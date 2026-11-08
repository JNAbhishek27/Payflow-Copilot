from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from decimal import Decimal
import datetime

from app.core.database import get_db
from app.models.entities import Quote, QuoteItem, Transaction, Customer
from app.schemas.payments import QuoteDTO, QuoteItemDTO, TransactionDTO

router = APIRouter(prefix="/api", tags=["Quotes & Transactions Database Records"])

@router.get("/quotes", response_model=List[QuoteDTO])
def get_all_quotes(db: Session = Depends(get_db)):
    quotes = db.query(Quote).order_by(Quote.created_at.desc()).all()
    results = []
    for q in quotes:
        items = [
            QuoteItemDTO(
                id=i.id,
                description=i.description,
                quantity=i.quantity,
                unit_price=float(i.unit_price),
                subtotal=float(i.subtotal)
            ) for i in q.items
        ]
        results.append(QuoteDTO(
            id=q.id,
            quote_number=q.quote_number,
            customer_name=q.customer_name,
            customer_email=q.customer_email,
            currency=q.currency,
            subtotal=float(q.subtotal),
            tax=float(q.tax or 0),
            discount=float(q.discount or 0),
            total=float(q.total),
            status=q.status,
            notes=q.notes,
            paypal_order_id=q.paypal_order_id,
            created_at=q.created_at.isoformat() if q.created_at else "",
            items=items
        ))
    return results

@router.get("/quotes/{quote_id}", response_model=QuoteDTO)
def get_quote(quote_id: str, db: Session = Depends(get_db)):
    q = db.query(Quote).filter(Quote.id == quote_id).first()
    if not q:
        q = db.query(Quote).filter(Quote.quote_number == quote_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quote not found")

    items = [
        QuoteItemDTO(
            id=i.id,
            description=i.description,
            quantity=i.quantity,
            unit_price=float(i.unit_price),
            subtotal=float(i.subtotal)
        ) for i in q.items
    ]
    return QuoteDTO(
        id=q.id,
        quote_number=q.quote_number,
        customer_name=q.customer_name,
        customer_email=q.customer_email,
        currency=q.currency,
        subtotal=float(q.subtotal),
        tax=float(q.tax or 0),
        discount=float(q.discount or 0),
        total=float(q.total),
        status=q.status,
        notes=q.notes,
        paypal_order_id=q.paypal_order_id,
        created_at=q.created_at.isoformat() if q.created_at else "",
        items=items
    )

@router.get("/transactions", response_model=List[TransactionDTO])
def get_all_transactions(db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    return [
        TransactionDTO(
            id=t.id,
            quote_id=t.quote_id,
            paypal_order_id=t.paypal_order_id,
            paypal_capture_id=t.paypal_capture_id,
            customer_name=t.customer_name,
            customer_email=t.customer_email,
            amount=float(t.amount),
            currency=t.currency,
            status=t.status,
            payment_method=t.payment_method,
            created_at=t.created_at.isoformat() if t.created_at else "",
            completed_at=t.completed_at.isoformat() if t.completed_at else None
        ) for t in txs
    ]

@router.get("/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    completed_txs = db.query(Transaction).filter(Transaction.status == "completed").all()
    total_rev = sum(float(t.amount) for t in completed_txs)
    count_completed = len(completed_txs)
    atv = (total_rev / count_completed) if count_completed > 0 else 0.0

    pending_txs = db.query(Transaction).filter(Transaction.status == "pending").all()
    pending_amount = sum(float(t.amount) for t in pending_txs)

    outstanding_quotes = db.query(Quote).filter(Quote.status.in_(["pending_approval", "approved", "sent"])).all()
    outstanding_amount = sum(float(q.total) for q in outstanding_quotes)

    return {
        "total_revenue": total_rev,
        "revenue_currency": "USD",
        "successful_payments_count": count_completed,
        "pending_payments_count": len(pending_txs),
        "pending_payments_amount": pending_amount,
        "outstanding_quotes_count": len(outstanding_quotes),
        "outstanding_quotes_amount": outstanding_amount,
        "average_transaction_value": round(atv, 2)
    }

