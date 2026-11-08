from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # PayPal Sandbox credentials
    PAYPAL_MODE: str = "sandbox"
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_WEBHOOK_ID: Optional[str] = None
    
    # Supabase / PostgreSQL database
    DATABASE_URL: str = "sqlite:///./payflow.db"
    
    # Host and environment
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

