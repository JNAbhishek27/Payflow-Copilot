from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.seed import seed_initial_data
from app.routers import copilot, insights, payments, data, webhooks

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed realistic initial database records
with SessionLocal() as db:
    seed_initial_data(db)

app = FastAPI(
    title="PayFlow Copilot Backend API",
    description="AI-powered quote-to-payment agent & PayPal Sandbox Orders API v2 engine",
    version="1.0.0"
)

# CORS middleware for Vite frontend
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(copilot.router)
app.include_router(insights.router)
app.include_router(payments.router)
app.include_router(data.router)
app.include_router(webhooks.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PayFlow Copilot Backend",
        "gemini_sdk_ready": True,
        "paypal_mode": settings.PAYPAL_MODE,
        "paypal_configured": bool(settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET),
        "database": settings.DATABASE_URL.split("://")[0]
    }
