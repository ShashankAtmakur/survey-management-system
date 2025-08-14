from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class QuestionCreate(BaseModel):
    text: str
    type: str = Field(..., pattern="^(text|multiple_choice|rating|yes_no|audio|number)$")
    options: Optional[List[str]] = []
    required: bool = True

class SurveyCreate(BaseModel):
    title: str
    description: str
    questions: List[QuestionCreate]

class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[List[QuestionCreate]] = None
    is_active: Optional[bool] = None

class SurveyOut(BaseModel):
    id: int
    title: str
    description: str
    questions: List[Dict[str, Any]]
    created_at: datetime
    is_active: bool

    model_config = {
        "from_attributes": True
    }

class SurveyResponseCreate(BaseModel):
    responses: Dict[str, Any]
    audio_data: Optional[Dict[str, str]] = None

class ResponseOut(BaseModel):
    id: int
    survey_id: int
    responses: Dict[str, Any]
    submitted_at: datetime

    model_config = {
        "from_attributes": True
    }

class AIGenerateRequest(BaseModel):
    prompt: str
    question_count: int = 5

class AnalyticsOut(BaseModel):
    survey_id: int
    title: str
    total_responses: int
    analytics: Dict[str, Any]
