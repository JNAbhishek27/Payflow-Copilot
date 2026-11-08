from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from decimal import Decimal, ROUND_HALF_UP

class ProposedLineItem(BaseModel):
    description: str = Field(..., description="Clear description of the work or deliverable")
    quantity: int = Field(..., ge=1, description="Integer quantity of items/hours")
    unit_price: Decimal = Field(..., ge=0, description="Unit price per item in the specified currency")

    @field_validator('unit_price', mode='before')
    def parse_price(cls, v):
        if isinstance(v, (int, float, str)):
            return Decimal(str(v)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return v

class StructuredQuoteProposal(BaseModel):
    customer_name: Optional[str] = Field(None, description="Extracted customer/client name")
    customer_email: Optional[str] = Field(None, description="Extracted customer email address if present")
    currency: str = Field(default="USD", description="3-letter ISO currency code, default USD")
    items: List[ProposedLineItem] = Field(default_factory=list, description="Extracted line items")
    notes: Optional[str] = Field(None, description="Contextual notes or deliverables summary")
    missing_fields: List[str] = Field(default_factory=list, description="Fields required before checkout (e.g. customer_email, price)")
    is_ready_for_approval: bool = Field(default=False, description="True only if customer name, line items, and prices are fully provided")

class CopilotExtractRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Natural language prompt or client conversation message")

class ValidatedQuoteItem(BaseModel):
    description: str
    quantity: int
    unit_price: float
    subtotal: float

class ValidatedQuoteResponse(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    currency: str
    items: List[ValidatedQuoteItem]
    subtotal: float
    tax: float = 0.0
    discount: float = 0.0
    total: float
    missing_fields: List[str]
    is_ready_for_approval: bool
    explanation: str

class CopilotExtractResponse(BaseModel):
    reply: str
    structured_quote: Optional[ValidatedQuoteResponse] = None

class BusinessInsightRequest(BaseModel):
    question: str

class SupportingFigure(BaseModel):
    label: str
    value: str

class BusinessInsightResponse(BaseModel):
    question: str
    answer: str
    date_range: dict
    supporting_figures: List[SupportingFigure]
    grounded_metrics: dict
    data_source: str = "Supabase PostgreSQL Database"

class FollowUpReminderRequest(BaseModel):
    customer_name: str
    customer_email: str
    quote_number: str
    amount: float
    currency: str = "USD"
    days_overdue: int = 7

class FollowUpReminderResponse(BaseModel):
    customer_name: str
    customer_email: str
    subject: str
    message_body: str

