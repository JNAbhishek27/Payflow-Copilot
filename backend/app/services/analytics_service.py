import datetime
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.entities import Transaction, Quote, Customer

def compute_financial_aggregates(db: Session) -> Dict[str, Any]:
    """
    Safely queries PostgreSQL and computes grounded financial aggregates
    strictly in Python decimal/float arithmetic before feeding to Gemini.
    """
    now = datetime.datetime.utcnow()

    # 1. Settled Completed Transactions
    completed_txs = (
        db.query(Transaction)
        .filter(Transaction.status == "completed")
        .order_by(Transaction.created_at.desc())
        .all()
    )
    total_revenue = sum(float(t.amount) for t in completed_txs)
    completed_count = len(completed_txs)
    aov = (total_revenue / completed_count) if completed_count > 0 else 0.0

    recent_completed_list = [
        {
            "id": t.id,
            "quote_id": t.quote_id,
            "customer_name": t.customer_name,
            "amount": float(t.amount),
            "currency": t.currency,
            "completed_at": t.completed_at.strftime("%Y-%m-%d %H:%M") if t.completed_at else t.created_at.strftime("%Y-%m-%d")
        }
        for t in completed_txs[:5]
    ]

    # 2. Pending Orders / Transactions
    pending_txs = (
        db.query(Transaction)
        .filter(Transaction.status == "pending")
        .order_by(Transaction.created_at.desc())
        .all()
    )
    pending_amount = sum(float(t.amount) for t in pending_txs)
    pending_list = [
        {
            "id": t.id,
            "quote_id": t.quote_id,
            "customer_name": t.customer_name,
            "amount": float(t.amount),
            "created_at": t.created_at.strftime("%Y-%m-%d")
        }
        for t in pending_txs
    ]

    # 3. Outstanding Quotes (pending_approval, approved, sent)
    outstanding_quotes = (
        db.query(Quote)
        .filter(Quote.status.in_(["pending_approval", "approved", "sent"]))
        .order_by(Quote.created_at.desc())
        .all()
    )
    outstanding_amount = sum(float(q.total) for q in outstanding_quotes)
    outstanding_list = [
        {
            "id": q.id,
            "quote_number": q.quote_number,
            "customer_name": q.customer_name,
            "customer_email": q.customer_email,
            "status": q.status,
            "total": float(q.total),
            "days_active": (now - q.created_at).days if q.created_at else 0
        }
        for q in outstanding_quotes
    ]

    # 4. Customers needing follow-up (unpaid quotes active for 2+ days or pending checkout)
    followup_candidates = []
    for q in outstanding_quotes:
        days_active = (now - q.created_at).days if q.created_at else 0
        followup_candidates.append({
            "quote_number": q.quote_number,
            "customer_name": q.customer_name,
            "customer_email": q.customer_email,
            "amount": float(q.total),
            "currency": q.currency,
            "status": q.status,
            "days_since_creation": days_active,
            "priority": "High" if days_active >= 3 or q.status == "approved" else "Medium"
        })

    # 5. Date Range & Trend Summary
    first_tx = db.query(Transaction).order_by(Transaction.created_at.asc()).first()
    start_date = first_tx.created_at.strftime("%Y-%m-%d") if first_tx and first_tx.created_at else now.strftime("%Y-%m-%d")
    end_date = now.strftime("%Y-%m-%d")

    return {
        "date_range": {
            "start": start_date,
            "end": end_date
        },
        "summary": {
            "total_settled_revenue": round(total_revenue, 2),
            "currency": "USD",
            "successful_payments_count": completed_count,
            "average_order_value": round(aov, 2),
            "pending_payments_count": len(pending_txs),
            "pending_payments_amount": round(pending_amount, 2),
            "outstanding_quotes_count": len(outstanding_quotes),
            "outstanding_quotes_amount": round(outstanding_amount, 2),
        },
        "recent_completed_transactions": recent_completed_list,
        "pending_payments": pending_list,
        "outstanding_quotes": outstanding_list,
        "followup_candidates": followup_candidates
    }

