from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.core.database import get_db
from app.models.survey import Survey
from app.schemas.survey import SurveyCreate, SurveyUpdate, SurveyOut

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/surveys", response_model=SurveyOut, status_code=201)
async def create_survey(survey: SurveyCreate, db: Session = Depends(get_db)):
    """Create a new survey"""
    try:
        db_survey = Survey(
            title=survey.title,
            description=survey.description,
            questions=[q.dict() for q in survey.questions]
        )
        
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        
        logger.info(f"Created survey with ID: {db_survey.id}")
        return db_survey
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating survey: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create survey")

@router.get("/surveys", response_model=List[SurveyOut])
async def get_surveys(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get list of surveys with pagination"""
    try:
        query = db.query(Survey)
        if active_only:
            query = query.filter(Survey.is_active == True)
            
        surveys = query.offset(skip).limit(limit).all()
        return surveys
        
    except Exception as e:
        logger.error(f"Error fetching surveys: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch surveys")

@router.get("/surveys/{survey_id}", response_model=SurveyOut)
async def get_survey(survey_id: int, db: Session = Depends(get_db)):
    """Get a specific survey by ID"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id, 
        Survey.is_active == True
    ).first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return survey

@router.put("/surveys/{survey_id}", response_model=SurveyOut)
async def update_survey(
    survey_id: int, 
    survey_update: SurveyUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing survey"""
    db_survey = db.query(Survey).filter(Survey.id == survey_id).first()
    
    if not db_survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    try:
        update_data = survey_update.dict(exclude_unset=True)
        
        if "questions" in update_data:
            update_data["questions"] = [q.dict() for q in survey_update.questions]
        
        for key, value in update_data.items():
            setattr(db_survey, key, value)
            
        db.commit()
        db.refresh(db_survey)
        
        logger.info(f"Updated survey ID: {survey_id}")
        return db_survey
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating survey {survey_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update survey")

@router.delete("/surveys/{survey_id}")
async def delete_survey(survey_id: int, db: Session = Depends(get_db)):
    """Soft delete a survey (set is_active to False)"""
    db_survey = db.query(Survey).filter(Survey.id == survey_id).first()
    
    if not db_survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    try:
        db_survey.is_active = False
        db.commit()
        
        logger.info(f"Deleted survey ID: {survey_id}")
        return {"message": "Survey deleted successfully", "survey_id": survey_id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting survey {survey_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete survey")

@router.get("/surveys/{survey_id}/stats")
async def get_survey_stats(survey_id: int, db: Session = Depends(get_db)):
    """Get basic stats for a survey"""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    response_count = len(survey.responses) if survey.responses else 0
    
    return {
        "survey_id": survey_id,
        "title": survey.title,
        "question_count": len(survey.questions),
        "response_count": response_count,
        "created_at": survey.created_at,
        "is_active": survey.is_active
    }
