from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.ai import BusinessInsightRequest, BusinessInsightResponse
from app.services.ai_agent import gemini_agent
from app.services.analytics_service import compute_financial_aggregates

router = APIRouter(prefix="/api/insights", tags=["AI Business Insights"])

@router.post("/query", response_model=BusinessInsightResponse)
async def query_business_insights(payload: BusinessInsightRequest, db: Session = Depends(get_db)):
    """
    Answers business intelligence questions strictly grounded in real PostgreSQL records.
    Recalculates aggregates in Python before feeding to Gemini with zero hallucination.
    """
    try:
        # Step 1 & 2: Safely query records and compute real aggregates
        grounded_data = compute_financial_aggregates(db)

        # Step 3 & 4: Feed strictly grounded figures to Gemini
        response = gemini_agent.generate_business_insight(payload.question, grounded_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight generation error: {str(e)}")

