from fastapi import APIRouter, HTTPException, Depends, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.core.database import get_db
from app.models.survey import Survey, SurveyResponse
from app.schemas.survey import SurveyResponseCreate, ResponseOut

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/surveys/{survey_id}/responses", response_model=ResponseOut, status_code=201)
async def submit_response(
    survey_id: int,
    response_data: SurveyResponseCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Submit a response to a survey"""
    # Check if survey exists and is active
    survey = db.query(Survey).filter(
        Survey.id == survey_id, 
        Survey.is_active == True
    ).first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or inactive")
    
    try:
        # Get client IP
        client_ip = "unknown"
        if request.client:
            client_ip = request.client.host
        elif "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        # Create response record
        db_response = SurveyResponse(
            survey_id=survey_id,
            responses=response_data.responses,
            audio_data=response_data.audio_data,
            respondent_ip=client_ip
        )
        
        db.add(db_response)
        db.commit()
        db.refresh(db_response)
        
        logger.info(f"Response submitted for survey {survey_id} with ID: {db_response.id}")
        return db_response
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting response: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit response")

@router.get("/surveys/{survey_id}/responses", response_model=List[ResponseOut])
async def get_responses(
    survey_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all responses for a survey with pagination"""
    # Verify survey exists
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    try:
        responses = db.query(SurveyResponse).filter(
            SurveyResponse.survey_id == survey_id
        ).offset(skip).limit(limit).all()
        
        return responses
        
    except Exception as e:
        logger.error(f"Error fetching responses: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch responses")

@router.get("/surveys/{survey_id}/responses/{response_id}", response_model=ResponseOut)
async def get_response(
    survey_id: int, 
    response_id: int, 
    db: Session = Depends(get_db)
):
    """Get a specific response by ID"""
    response = db.query(SurveyResponse).filter(
        SurveyResponse.id == response_id,
        SurveyResponse.survey_id == survey_id
    ).first()
    
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    return response

@router.delete("/surveys/{survey_id}/responses/{response_id}")
async def delete_response(
    survey_id: int, 
    response_id: int, 
    db: Session = Depends(get_db)
):
    """Delete a specific response"""
    response = db.query(SurveyResponse).filter(
        SurveyResponse.id == response_id,
        SurveyResponse.survey_id == survey_id
    ).first()
    
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    try:
        db.delete(response)
        db.commit()
        
        logger.info(f"Deleted response ID: {response_id}")
        return {"message": "Response deleted successfully", "response_id": response_id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting response {response_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete response")

@router.get("/surveys/{survey_id}/responses/export")
async def export_responses(survey_id: int, db: Session = Depends(get_db)):
    """Export responses in a format suitable for CSV/Excel"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    responses = db.query(SurveyResponse).filter(
        SurveyResponse.survey_id == survey_id
    ).all()
    
    if not responses:
        return {"message": "No responses to export", "data": []}
    
    # Prepare export data
    export_data = []
    for response in responses:
        row = {
            "response_id": response.id,
            "submitted_at": response.submitted_at.isoformat(),
            "respondent_ip": response.respondent_ip
        }
        
        # Add question responses
        for question in survey.questions:
            question_text = question.get("text", "")
            answer = response.responses.get(question_text, "")
            row[f"Q: {question_text}"] = answer
        
        export_data.append(row)
    
    return {
        "survey_title": survey.title,
        "export_timestamp": str(datetime.utcnow()),
        "total_responses": len(export_data),
        "data": export_data
    }
