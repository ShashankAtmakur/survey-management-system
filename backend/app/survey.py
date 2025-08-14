from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Survey(Base):
    __tablename__ = "surveys"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    questions = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    created_by = Column(String(100), default="user")
    responses = relationship("SurveyResponse", back_populates="survey")

class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    responses = Column(JSON, nullable=False)
    audio_data = Column(JSON)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    respondent_ip = Column(String(45))
    survey = relationship("Survey", back_populates="responses")
