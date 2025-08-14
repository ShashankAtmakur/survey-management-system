from fastapi import APIRouter, HTTPException
from app.services.ai_service import ai_service
from app.schemas.survey import AIGenerateRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate-questions")
async def generate_questions(request: AIGenerateRequest):
    """Generate survey questions using OpenAI"""
    try:
        result = ai_service.generate_questions(request.prompt, request.question_count)
        if result.get("success", False):
            return {
                "success": True,
                "questions": result["questions"],
                "count": len(result["questions"]),
                "prompt": request.prompt
            }
        else:
            return {
                "success": False,
                "questions": [],
                "error": result.get("error", "Unknown error"),
                "prompt": request.prompt
            }
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")
