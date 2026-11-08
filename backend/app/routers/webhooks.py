import json
import datetime
from decimal import Decimal
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models.entities import Transaction, Quote, WebhookEvent
from app.services.paypal_service import paypal_service

router = APIRouter(prefix="/api/webhooks/paypal", tags=["PayPal Webhooks"])

@router.post("")
async def handle_paypal_webhook(
    request: Request,
    db: Session = Depends(get_db),
    paypal_transmission_id: Optional[str] = Header(None, alias="PAYPAL-TRANSMISSION-ID"),
    paypal_transmission_time: Optional[str] = Header(None, alias="PAYPAL-TRANSMISSION-TIME"),
    paypal_transmission_sig: Optional[str] = Header(None, alias="PAYPAL-TRANSMISSION-SIG"),
    paypal_cert_url: Optional[str] = Header(None, alias="PAYPAL-CERT-URL"),
    paypal_auth_algo: Optional[str] = Header(None, alias="PAYPAL-AUTH-ALGO"),
):
    """
    Handles asynchronous PayPal webhook notifications with strict cryptographic signature verification
    and duplicate event prevention.
    """
    try:
        body_bytes = await request.body()
        event = json.loads(body_bytes.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook JSON body: {str(e)}")

    event_id = event.get("id")
    event_type = event.get("event_type")
    resource_type = event.get("resource_type")
    summary = event.get("summary", "")
    resource = event.get("resource", {})

    if not event_id or not event_type:
        raise HTTPException(status_code=400, detail="Missing required event_id or event_type.")

    # 1. Prevent duplicate event processing (Idempotency)
    existing_event = db.query(WebhookEvent).filter(WebhookEvent.event_id == event_id).first()
    if existing_event:
        return {
            "status": "duplicate",
            "message": f"Webhook event {event_id} has already been processed.",
            "event_type": event_type
        }

    # 2. Verify webhook signature via PayPal Verification API
    is_verified = False
    if paypal_transmission_id and paypal_transmission_sig:
        is_verified = await paypal_service.verify_webhook_signature(
            transmission_id=paypal_transmission_id,
            transmission_time=paypal_transmission_time or "",
            cert_url=paypal_cert_url or "",
            auth_algo=paypal_auth_algo or "",
            transmission_sig=paypal_transmission_sig,
            webhook_id=settings.PAYPAL_WEBHOOK_ID or "SANDBOX_WEBHOOK_ID",
            webhook_event=event
        )

    if not is_verified:
        # Log unverified event
        db_event = WebhookEvent(
            event_id=event_id,
            event_type=event_type,
            resource_type=resource_type or "unknown",
            summary=summary,
            status="unverified",
            verified=False,
            payload=json.dumps(event)
        )
        db.add(db_event)
        db.commit()
        raise HTTPException(status_code=401, detail="PayPal webhook signature verification failed.")

    # 3. Process Verified Event
    process_status = "processed"
    now = datetime.datetime.utcnow()

    try:
        if event_type == "PAYMENT.CAPTURE.COMPLETED":
            capture_id = resource.get("id")
            # In captures, custom_id or supplementary_data carries quote_id
            custom_id = resource.get("custom_id")
            
            # Find transaction by capture ID or order ID
            tx = None
            if capture_id:
                tx = db.query(Transaction).filter(Transaction.paypal_capture_id == capture_id).first()
            
            if not tx and custom_id:
                tx = db.query(Transaction).filter(Transaction.quote_id == custom_id).first()

            amount_val = resource.get("amount", {}).get("value")
            currency_val = resource.get("amount", {}).get("currency_code", "USD")

            if tx:
                tx.status = "completed"
                tx.paypal_capture_id = capture_id or tx.paypal_capture_id
                tx.completed_at = now
                if tx.quote:
                    tx.quote.status = "paid"
            else:
                # Create completed transaction record from verified capture
                quote = db.query(Quote).filter(Quote.id == custom_id).first() if custom_id else None
                if quote:
                    quote.status = "paid"

                tx = Transaction(
                    quote_id=quote.id if quote else None,
                    customer_id=quote.customer_id if quote else None,
                    paypal_order_id=resource.get("parent_payment") or f"ORD_{capture_id}",
                    paypal_capture_id=capture_id,
                    customer_name=quote.customer_name if quote else "Customer",
                    customer_email=quote.customer_email if quote else "client@sandbox.paypal.com",
                    amount=Decimal(amount_val) if amount_val else (quote.total if quote else Decimal('0.00')),
                    currency=currency_val,
                    status="completed",
                    payment_method="PayPal Sandbox (Webhook Verified)",
                    created_at=now,
                    completed_at=now
                )
                db.add(tx)

        elif event_type == "PAYMENT.CAPTURE.DENIED":
            capture_id = resource.get("id")
            custom_id = resource.get("custom_id")
            
            tx = None
            if capture_id:
                tx = db.query(Transaction).filter(Transaction.paypal_capture_id == capture_id).first()
            if not tx and custom_id:
                tx = db.query(Transaction).filter(Transaction.quote_id == custom_id).first()

            if tx:
                tx.status = "denied"
            else:
                quote = db.query(Quote).filter(Quote.id == custom_id).first() if custom_id else None
                amount_val = resource.get("amount", {}).get("value")
                tx = Transaction(
                    quote_id=quote.id if quote else None,
                    customer_id=quote.customer_id if quote else None,
                    paypal_order_id=f"ORD_DENIED_{capture_id}",
                    paypal_capture_id=capture_id,
                    customer_name=quote.customer_name if quote else "Customer",
                    customer_email=quote.customer_email if quote else "client@sandbox.paypal.com",
                    amount=Decimal(amount_val) if amount_val else Decimal('0.00'),
                    currency=resource.get("amount", {}).get("currency_code", "USD"),
                    status="denied",
                    payment_method="PayPal Sandbox",
                    created_at=now
                )
                db.add(tx)

        # 4. Save processed event record
        db_event = WebhookEvent(
            event_id=event_id,
            event_type=event_type,
            resource_type=resource_type or "capture",
            summary=summary,
            status=process_status,
            verified=True,
            payload=json.dumps(event)
        )
        db.add(db_event)
        db.commit()

        return {
            "status": "success",
            "message": f"Webhook {event_id} processed successfully.",
            "event_type": event_type
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error executing webhook logic: {str(e)}")
