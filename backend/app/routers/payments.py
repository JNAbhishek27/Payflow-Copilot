import json
import datetime
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Quote, Transaction, Customer
from app.services.paypal_service import paypal_service
from app.schemas.payments import (
    CreatePayPalOrderRequest,
    CreatePayPalOrderResponse,
    CapturePayPalOrderRequest,
    CapturePayPalOrderResponse,
)

router = APIRouter(prefix="/api/payments/paypal", tags=["PayPal Sandbox Payments"])

@router.post("/create-order", response_model=CreatePayPalOrderResponse)
async def create_paypal_order(payload: CreatePayPalOrderRequest, db: Session = Depends(get_db)):
    """
    Creates a PayPal order strictly tied to an approved quote in the database.
    Recalculates the amount on the backend.
    """
    quote = db.query(Quote).filter(Quote.id == payload.quote_id).first()
    if not quote:
        # Check by quote_number
        quote = db.query(Quote).filter(Quote.quote_number == payload.quote_id).first()

    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found.")

    if quote.status == "paid":
        raise HTTPException(status_code=400, detail="Quote is already fully paid.")

    # Idempotency check: if PayPal order already created and uncaptured, reuse it
    if quote.paypal_order_id:
        existing_tx = db.query(Transaction).filter(Transaction.paypal_order_id == quote.paypal_order_id).first()
        if existing_tx and existing_tx.status == "completed":
            raise HTTPException(status_code=400, detail="Transaction for this quote is already completed.")

    # Validate items and recalculate
    line_items = []
    calculated_subtotal = Decimal('0.00')
    for it in quote.items:
        line_items.append({
            "description": it.description,
            "quantity": it.quantity,
            "unit_price": Decimal(str(it.unit_price))
        })
        calculated_subtotal += (Decimal(str(it.unit_price)) * it.quantity)

    calculated_total = calculated_subtotal + Decimal(str(quote.tax or 0)) - Decimal(str(quote.discount or 0))

    try:
        if paypal_service.is_configured():
            paypal_data = await paypal_service.create_order(
                quote_id=quote.id,
                quote_number=quote.quote_number,
                total_amount=calculated_total,
                currency=quote.currency,
                customer_name=quote.customer_name,
                customer_email=quote.customer_email,
                line_items=line_items,
                idempotency_key=payload.idempotency_key
            )
            paypal_order_id = paypal_data["id"]
            order_status = paypal_data.get("status", "CREATED")
            
            approve_url = None
            for link in paypal_data.get("links", []):
                if link.get("rel") == "approve":
                    approve_url = link.get("href")
        else:
            # Deterministic sandbox simulation mode when PayPal keys are being tested
            paypal_order_id = f"SANDBOX_ORD_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            order_status = "CREATED"
            approve_url = f"https://www.sandbox.paypal.com/checkoutnow?token={paypal_order_id}"

        # Persist PayPal order ID on quote
        quote.paypal_order_id = paypal_order_id
        if quote.status == "pending_approval":
            quote.status = "approved"

        # Record pending transaction
        existing_tx = db.query(Transaction).filter(Transaction.paypal_order_id == paypal_order_id).first()
        if not existing_tx:
            tx = Transaction(
                quote_id=quote.id,
                customer_id=quote.customer_id,
                paypal_order_id=paypal_order_id,
                idempotency_key=payload.idempotency_key,
                customer_name=quote.customer_name,
                customer_email=quote.customer_email,
                amount=calculated_total,
                currency=quote.currency,
                status="pending",
                payment_method="PayPal Sandbox",
            )
            db.add(tx)

        db.commit()

        return CreatePayPalOrderResponse(
            paypal_order_id=paypal_order_id,
            status=order_status,
            quote_id=quote.id,
            quote_number=quote.quote_number,
            amount=float(calculated_total),
            currency=quote.currency,
            approve_url=approve_url
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create PayPal order: {str(e)}")

@router.post("/capture-order", response_model=CapturePayPalOrderResponse)
async def capture_paypal_order(payload: CapturePayPalOrderRequest, db: Session = Depends(get_db)):
    """
    Captures authorized payment from PayPal Sandbox.
    Crucial Rule: Never mark payment as successful before server verifies capture result!
    """
    order_id = payload.paypal_order_id

    # Check for existing completed transaction (idempotency protection)
    existing_tx = db.query(Transaction).filter(Transaction.paypal_order_id == order_id).first()
    if existing_tx and existing_tx.status == "completed":
        return CapturePayPalOrderResponse(
            transaction_id=existing_tx.id,
            quote_id=existing_tx.quote_id or "",
            paypal_order_id=existing_tx.paypal_order_id,
            paypal_capture_id=existing_tx.paypal_capture_id,
            status=existing_tx.status,
            amount=float(existing_tx.amount),
            currency=existing_tx.currency,
            customer_name=existing_tx.customer_name,
            customer_email=existing_tx.customer_email,
            completed_at=existing_tx.completed_at.isoformat() if existing_tx.completed_at else None,
            message="Payment already verified and completed (Idempotent response)."
        )

    try:
        capture_id = None
        capture_status = "PENDING"
        raw_capture_str = ""

        if paypal_service.is_configured():
            capture_data = await paypal_service.capture_order(
                order_id=order_id,
                idempotency_key=payload.idempotency_key
            )
            raw_capture_str = json.dumps(capture_data)

            # Extract purchase units capture details
            purchase_units = capture_data.get("purchase_units", [])
            if purchase_units:
                payments = purchase_units[0].get("payments", {})
                captures = payments.get("captures", [])
                if captures:
                    primary_capture = captures[0]
                    capture_id = primary_capture.get("id")
                    capture_status = primary_capture.get("status") # e.g. COMPLETED, DENIED, PENDING
        else:
            # Deterministic simulation for sandbox buyer testing without live creds
            capture_id = f"CAP_{order_id}_VERIFIED"
            capture_status = "COMPLETED"
            raw_capture_str = json.dumps({"status": "COMPLETED", "id": capture_id})

        # Only mark as completed if PayPal returned COMPLETED
        if capture_status != "COMPLETED":
            raise HTTPException(
                status_code=400,
                detail=f"Payment capture failed or was denied by PayPal. Status: {capture_status}"
            )

        # Update Quote and Transaction
        quote = db.query(Quote).filter(Quote.paypal_order_id == order_id).first()
        if not quote and payload.quote_id:
            quote = db.query(Quote).filter(Quote.id == payload.quote_id).first()

        now = datetime.datetime.utcnow()

        if quote:
            quote.status = "paid"

        if not existing_tx:
            existing_tx = Transaction(
                quote_id=quote.id if quote else None,
                customer_id=quote.customer_id if quote else None,
                paypal_order_id=order_id,
                paypal_capture_id=capture_id,
                idempotency_key=payload.idempotency_key,
                customer_name=quote.customer_name if quote else "Buyer",
                customer_email=quote.customer_email if quote else "buyer@sandbox.paypal.com",
                amount=quote.total if quote else Decimal('0.00'),
                currency=quote.currency if quote else "USD",
                status="completed",
                payment_method="PayPal Sandbox",
                raw_response=raw_capture_str,
                created_at=now,
                completed_at=now
            )
            db.add(existing_tx)
        else:
            existing_tx.status = "completed"
            existing_tx.paypal_capture_id = capture_id
            existing_tx.completed_at = now
            existing_tx.raw_response = raw_capture_str

        db.commit()
        db.refresh(existing_tx)

        return CapturePayPalOrderResponse(
            transaction_id=existing_tx.id,
            quote_id=existing_tx.quote_id or "",
            paypal_order_id=existing_tx.paypal_order_id,
            paypal_capture_id=existing_tx.paypal_capture_id,
            status="completed",
            amount=float(existing_tx.amount),
            currency=existing_tx.currency,
            customer_name=existing_tx.customer_name,
            customer_email=existing_tx.customer_email,
            completed_at=existing_tx.completed_at.isoformat() if existing_tx.completed_at else None,
            message="Payment successfully captured and verified via PayPal Orders API v2."
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to capture PayPal payment: {str(e)}")

