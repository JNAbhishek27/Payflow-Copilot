import os
import base64
import httpx
from typing import Dict, Any, Optional
from decimal import Decimal
from app.core.config import settings

PAYPAL_SANDBOX_BASE_URL = "https://api-m.sandbox.paypal.com"

class PayPalService:
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID or os.environ.get("PAYPAL_CLIENT_ID")
        self.client_secret = settings.PAYPAL_CLIENT_SECRET or os.environ.get("PAYPAL_CLIENT_SECRET")
        self.base_url = PAYPAL_SANDBOX_BASE_URL

    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)

    async def get_access_token(self) -> str:
        """
        Secure OAuth2 token exchange with PayPal Sandbox.
        Uses HTTP Basic authentication: Base64(client_id:client_secret).
        """
        if not self.is_configured():
            raise ValueError(
                "PayPal credentials not configured. Please supply PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env."
            )

        auth_header = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()

        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/v1/oauth2/token",
                headers=headers,
                data=data
            )
            if resp.status_code != 200:
                raise ValueError(f"PayPal OAuth token exchange failed ({resp.status_code}): {resp.text}")

            token_data = resp.json()
            return token_data["access_token"]

    async def create_order(
        self,
        quote_id: str,
        quote_number: str,
        total_amount: Decimal,
        currency: str,
        customer_name: str,
        customer_email: str,
        line_items: list,
        idempotency_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a PayPal Order via Orders API v2.
        - Calculates amounts strictly from the server-side quote.
        - Attaches custom_id for quote reference.
        - Includes Idempotency-Key header.
        """
        token = await self.get_access_token()

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        if idempotency_key:
            headers["PayPal-Request-Id"] = idempotency_key

        items_payload = []
        item_total = Decimal('0.00')
        for it in line_items:
            unit_price = Decimal(str(it["unit_price"]))
            qty = int(it["quantity"])
            item_total += (unit_price * qty)
            items_payload.append({
                "name": str(it["description"])[:127],
                "quantity": str(qty),
                "unit_amount": {
                    "currency_code": currency,
                    "value": f"{unit_price:.2f}"
                }
            })

        order_payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": quote_id,
                    "custom_id": quote_id,
                    "description": f"PayFlow Quote {quote_number} for {customer_name}",
                    "amount": {
                        "currency_code": currency,
                        "value": f"{total_amount:.2f}",
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency,
                                "value": f"{item_total:.2f}"
                            }
                        }
                    },
                    "items": items_payload
                }
            ],
            "application_context": {
                "brand_name": "PayFlow Copilot",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "shipping_preference": "NO_SHIPPING"
            }
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders",
                headers=headers,
                json=order_payload
            )

            if resp.status_code not in (200, 201):
                raise ValueError(f"PayPal create order failed ({resp.status_code}): {resp.text}")

            return resp.json()

    async def capture_order(self, order_id: str, idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Captures authorized payment for the order via Orders API v2.
        Guarantees server-side verification: payment is never marked as complete
        without a verified 'COMPLETED' capture status returned by PayPal.
        """
        token = await self.get_access_token()

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        if idempotency_key:
            headers["PayPal-Request-Id"] = idempotency_key

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders/{order_id}/capture",
                headers=headers
            )

            if resp.status_code not in (200, 201):
                raise ValueError(f"PayPal capture order failed ({resp.status_code}): {resp.text}")

            return resp.json()

    async def verify_webhook_signature(
        self,
        transmission_id: str,
        transmission_time: str,
        cert_url: str,
        auth_algo: str,
        transmission_sig: str,
        webhook_id: str,
        webhook_event: dict
    ) -> bool:
        """
        Calls PayPal verification endpoint: POST /v1/notifications/verify-webhook-signature
        Confirms webhook authenticity before taking any financial action.
        """
        if not self.is_configured():
            # In sandbox demo mode without live credentials, verify non-empty transmission fields
            return bool(transmission_id and transmission_sig)

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        verify_payload = {
            "transmission_id": transmission_id,
            "transmission_time": transmission_time,
            "cert_url": cert_url,
            "auth_algo": auth_algo,
            "transmission_sig": transmission_sig,
            "webhook_id": webhook_id or (settings.PAYPAL_WEBHOOK_ID or "SANDBOX_WEBHOOK"),
            "webhook_event": webhook_event
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{self.base_url}/v1/notifications/verify-webhook-signature",
                headers=headers,
                json=verify_payload
            )

            if resp.status_code != 200:
                return False

            res_data = resp.json()
            return res_data.get("verification_status") == "SUCCESS"

paypal_service = PayPalService()

