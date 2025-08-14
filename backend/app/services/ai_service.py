import os
import json
import re
import logging
from typing import Dict, Any
import openai
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.primary_model = "gpt-4o-mini"
        self.fallback_model = "gpt-4.1-nano"

    def generate_questions(self, prompt: str, question_count: int = 5) -> Dict[str, Any]:
        system_message = f"""You are an expert survey creator. Generate exactly {question_count} professional survey questions based ONLY on this prompt:
{prompt}
Respond ONLY with a valid JSON array of questions. Each question must have:
- "text": the question text (string)
- "type": one of "text", "multiple_choice", "rating", "yes_no", "number" (string)
- "options": array of strings for multiple choice, empty array for others (array)
- "required": true or false (boolean)
Example response:
[
  {{"text": "How satisfied are you with our service?", "type": "rating", "options": [], "required": true}},
  {{"text": "Which features do you use most?", "type": "multiple_choice", "options": ["Feature A", "Feature B", "Feature C"], "required": true}}
]"""

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": "Generate the questions now."}
        ]

        try:
            # Try primary model first
            response = openai.ChatCompletion.create(
                model=self.primary_model,
                messages=messages,
                max_tokens=800,
                temperature=0.3
            )
        except Exception as e:
            logger.warning(f"Primary model failed: {e}, falling back to {self.fallback_model}")
            try:
                # fallback
                response = openai.ChatCompletion.create(
                    model=self.fallback_model,
                    messages=messages,
                    max_tokens=800,
                    temperature=0.3
                )
            except Exception as e2:
                logger.error(f"Fallback model also failed: {e2}")
                return {
                    "success": False,
                    "questions": [],
                    "error": f"Both primary and fallback model calls failed: {e}, {e2}"
                }

        raw_output = response.choices[0].message.content
        logger.info(f"AI raw output: {raw_output[:200]}...")

        json_match = re.search(r'(\[.*\])', raw_output, re.DOTALL)
        if json_match:
            questions_json = json_match.group(1)
            try:
                questions = json.loads(questions_json)
            except json.JSONDecodeError as je:
                return {
                    "success": False,
                    "questions": [],
                    "error": f"JSON decode error: {je}",
                    "raw_output": raw_output[:200]
                }

            validated_questions = []
            valid_types = ["text", "multiple_choice", "rating", "yes_no", "number", "audio"]
            for q in questions:
                if isinstance(q, dict) and 'text' in q and 'type' in q:
                    vq = {
                        "text": str(q.get("text", "")).strip(),
                        "type": str(q.get("type", "text")),
                        "options": list(q.get("options", [])),
                        "required": bool(q.get("required", True))
                    }
                    if vq["type"] not in valid_types:
                        vq["type"] = "text"
                    validated_questions.append(vq)

            return {
                "success": True,
                "questions": validated_questions[:question_count],
                "count": len(validated_questions)
            }

        # fallback if JSON parsing fails
        return {
            "success": False,
            "questions": [{
                "text": f"Question about: {prompt}",
                "type": "text",
                "options": [],
                "required": True
            }],
            "error": "Failed to parse AI response",
            "raw_output": raw_output[:200]
        }

ai_service = AIService()
