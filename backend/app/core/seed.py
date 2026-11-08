from decimal import Decimal
import datetime
from sqlalchemy.orm import Session
from app.models.entities import Customer, Quote, QuoteItem, Transaction

def seed_initial_data(db: Session):
    # Check if data already exists
    if db.query(Quote).count() > 0:
        return

    # 1. Customers
    c1 = Customer(id="cust_alex", name="Alex Rivera", email="alex.rivera@designcraft.io")
    c2 = Customer(id="cust_sarah", name="Sarah Chen", email="sarah@fintechpulse.co")
    c3 = Customer(id="cust_marcus", name="Marcus Brody", email="m.brody@velocityventures.com")
    c4 = Customer(id="cust_elena", name="Elena Rostova", email="elena@studioaurora.de")
    db.add_all([c1, c2, c3, c4])
    db.commit()

    # 2. Quotes & Items
    q1 = Quote(
        id="q_alex_001",
        quote_number="Q-2026-001",
        customer_id=c1.id,
        customer_name=c1.name,
        customer_email=c1.email,
        currency="USD",
        subtotal=Decimal("90.00"),
        tax=Decimal("0.00"),
        discount=Decimal("0.00"),
        total=Decimal("90.00"),
        status="pending_approval",
        notes="Generated via PayFlow AI Copilot from client message.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add(q1)
    db.commit()

    i1 = QuoteItem(
        quote_id=q1.id,
        description="Social Media Banners",
        quantity=2,
        unit_price=Decimal("35.00"),
        subtotal=Decimal("70.00")
    )
    i2 = QuoteItem(
        quote_id=q1.id,
        description="Brand Logo Revision",
        quantity=1,
        unit_price=Decimal("20.00"),
        subtotal=Decimal("20.00")
    )
    db.add_all([i1, i2])

    # Quote 2 (Approved & ready for PayPal checkout)
    q2 = Quote(
        id="q_sarah_002",
        quote_number="Q-2026-002",
        customer_id=c2.id,
        customer_name=c2.name,
        customer_email=c2.email,
        currency="USD",
        subtotal=Decimal("1250.00"),
        tax=Decimal("0.00"),
        discount=Decimal("50.00"),
        total=Decimal("1200.00"),
        status="approved",
        notes="FastAPI Architecture Review. Ready for sandbox payment.",
        paypal_order_id="8XX49102941092841",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    db.add(q2)
    db.commit()

    i3 = QuoteItem(
        quote_id=q2.id,
        description="FastAPI Backend Architecture Review",
        quantity=6,
        unit_price=Decimal("150.00"),
        subtotal=Decimal("900.00")
    )
    i4 = QuoteItem(
        quote_id=q2.id,
        description="Security Hardening Checklist & Documentation",
        quantity=1,
        unit_price=Decimal("350.00"),
        subtotal=Decimal("350.00")
    )
    db.add_all([i3, i4])

    # Quote 3 (Paid)
    q3 = Quote(
        id="q_marcus_003",
        quote_number="Q-2026-003",
        customer_id=c3.id,
        customer_name=c3.name,
        customer_email=c3.email,
        currency="USD",
        subtotal=Decimal("1150.00"),
        tax=Decimal("0.00"),
        discount=Decimal("0.00"),
        total=Decimal("1150.00"),
        status="paid",
        notes="Payment completed and verified via PayPal sandbox capture.",
        paypal_order_id="5YY91823190283912",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
    )
    db.add(q3)
    db.commit()

    i5 = QuoteItem(
        quote_id=q3.id,
        description="SaaS Pitch Deck Financial Model Optimization",
        quantity=1,
        unit_price=Decimal("650.00"),
        subtotal=Decimal("650.00")
    )
    i6 = QuoteItem(
        quote_id=q3.id,
        description="Interactive Dashboard Component (React/Vite)",
        quantity=2,
        unit_price=Decimal("250.00"),
        subtotal=Decimal("500.00")
    )
    db.add_all([i5, i6])

    # 3. Transactions
    tx1 = Transaction(
        quote_id=q3.id,
        customer_id=c3.id,
        paypal_order_id="5YY91823190283912",
        paypal_capture_id="CAP_5YY91823190283912_SANDBOX",
        customer_name=c3.name,
        customer_email=c3.email,
        amount=Decimal("1150.00"),
        currency="USD",
        status="completed",
        payment_method="PayPal Balance",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5),
        completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
    )
    tx2 = Transaction(
        quote_id=q2.id,
        customer_id=c2.id,
        paypal_order_id="8XX49102941092841",
        customer_name=c2.name,
        customer_email=c2.email,
        amount=Decimal("1200.00"),
        currency="USD",
        status="pending",
        payment_method="PayPal Sandbox",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    db.add_all([tx1, tx2])
    db.commit()

