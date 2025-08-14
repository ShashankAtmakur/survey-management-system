from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.models.survey import Survey, SurveyResponse
from app.services.analytics_service import analytics_service
from app.schemas.survey import AnalyticsOut

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/surveys/{survey_id}/analytics", response_model=AnalyticsOut)
async def get_survey_analytics(survey_id: int, db: Session = Depends(get_db)):
    """Get analytics for a survey"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    responses = db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey_id).all()
    analytics_data = analytics_service.compute_survey_analytics(survey, responses)
    return {
        "survey_id": survey_id,
        "title": survey.title,
        "total_responses": analytics_data["total_responses"],
        "analytics": analytics_data["analytics"]
    }

@router.get("/surveys/{survey_id}/summary")
async def get_survey_summary(survey_id: int, db: Session = Depends(get_db)):
    """Get dashboard summary for a survey"""
    from datetime import datetime, timedelta
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    responses = db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey_id).all()
    recent_cut = datetime.utcnow() - timedelta(days=7)
    recent_responses = [r for r in responses if r.submitted_at and r.submitted_at >= recent_cut]
    return {
        "survey_id": survey_id,
        "title": survey.title,
        "total_questions": len(survey.questions),
        "total_responses": len(responses),
        "recent_responses_7d": len(recent_responses),
        "completion_rate": 100.0,  # adjust logic if you have partials
        "created_at": survey.created_at,
        "is_active": survey.is_active
    }
