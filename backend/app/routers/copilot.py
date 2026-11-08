from fastapi import APIRouter, HTTPException, Depends
from app.schemas.ai import (
    CopilotExtractRequest,
    CopilotExtractResponse,
    BusinessInsightRequest,
    BusinessInsightResponse,
    FollowUpReminderRequest,
    FollowUpReminderResponse,
)
from app.services.ai_agent import gemini_agent

router = APIRouter(prefix="/api/copilot", tags=["AI Copilot Agent"])

@router.post("/extract", response_model=CopilotExtractResponse)
async def extract_quote_from_prompt(payload: CopilotExtractRequest):
    """
    Parses conversational user messages into structured quote JSON using Google Gen AI SDK.
    Recalculates monetary totals server-side using Decimal arithmetic.
    """
    try:
        response = gemini_agent.extract_quote_from_prompt(payload.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Copilot extraction error: {str(e)}")

@router.post("/followup", response_model=FollowUpReminderResponse)
async def generate_followup(payload: FollowUpReminderRequest):
    """
    Drafts an invoice reminder message using Gemini for business owner review before sending.
    """
    try:
        response = gemini_agent.generate_followup_reminder(
            customer_name=payload.customer_name,
            customer_email=payload.customer_email,
            quote_number=payload.quote_number,
            amount=payload.amount,
            currency=payload.currency,
            days_overdue=payload.days_overdue
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Follow-up draft generation error: {str(e)}")

