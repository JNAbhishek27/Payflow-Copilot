from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class CreatePayPalOrderRequest(BaseModel):
    quote_id: str
    idempotency_key: Optional[str] = None

class CreatePayPalOrderResponse(BaseModel):
    paypal_order_id: str
    status: str
    quote_id: str
    quote_number: str
    amount: float
    currency: str
    approve_url: Optional[str] = None

class CapturePayPalOrderRequest(BaseModel):
    paypal_order_id: str
    quote_id: Optional[str] = None
    idempotency_key: Optional[str] = None

class CapturePayPalOrderResponse(BaseModel):
    transaction_id: str
    quote_id: str
    paypal_order_id: str
    paypal_capture_id: Optional[str] = None
    status: str
    amount: float
    currency: str
    customer_name: str
    customer_email: str
    completed_at: Optional[str] = None
    message: str

class QuoteItemDTO(BaseModel):
    id: Optional[str] = None
    description: str
    quantity: int
    unit_price: float
    subtotal: float

class QuoteDTO(BaseModel):
    id: str
    quote_number: str
    customer_name: str
    customer_email: str
    currency: str
    subtotal: float
    tax: float
    discount: float
    total: float
    status: str
    notes: Optional[str] = None
    paypal_order_id: Optional[str] = None
    created_at: str
    items: List[QuoteItemDTO]

class TransactionDTO(BaseModel):
    id: str
    quote_id: Optional[str] = None
    paypal_order_id: str
    paypal_capture_id: Optional[str] = None
    customer_name: str
    customer_email: str
    amount: float
    currency: str
    status: str
    payment_method: str
    created_at: str
    completed_at: Optional[str] = None

