import datetime
import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    quotes = relationship("Quote", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quote_number = Column(String(64), unique=True, nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax = Column(Numeric(10, 2), default=0.0)
    discount = Column(Numeric(10, 2), default=0.0)
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(32), default="pending_approval", nullable=False, index=True) # draft, pending_approval, approved, sent, paid, cancelled
    notes = Column(Text, nullable=True)
    paypal_order_id = Column(String(128), unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="quote")

class QuoteItem(Base):
    __tablename__ = "quote_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quote_id = Column(String(36), ForeignKey("quotes.id"), nullable=False)
    description = Column(String(500), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    quote = relationship("Quote", back_populates="items")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quote_id = Column(String(36), ForeignKey("quotes.id"), nullable=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)
    paypal_order_id = Column(String(128), unique=True, nullable=False, index=True)
    paypal_capture_id = Column(String(128), unique=True, nullable=True, index=True)
    idempotency_key = Column(String(128), unique=True, nullable=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    status = Column(String(32), default="pending", nullable=False, index=True) # pending, completed, denied, refunded, failed
    payment_method = Column(String(64), default="PayPal Sandbox", nullable=False)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    quote = relationship("Quote", back_populates="transactions")
    customer = relationship("Customer", back_populates="transactions")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(128), unique=True, nullable=False, index=True)
    event_type = Column(String(128), nullable=False, index=True)
    resource_type = Column(String(64), nullable=False)
    summary = Column(String(255), nullable=True)
    status = Column(String(32), default="processed", nullable=False) # processed, duplicate, ignored, failed
    verified = Column(Boolean, default=False, nullable=False)
    payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


