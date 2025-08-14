from collections import Counter
from statistics import mean, median
from typing import Dict, Any, List
from app.models.survey import Survey, SurveyResponse
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    @staticmethod
    def compute_survey_analytics(survey: Survey, responses: List[SurveyResponse]) -> Dict[str, Any]:
        if not responses:
            return {"total_responses": 0, "analytics": {}, "message": "No responses yet"}
        analytics = {}
        total_responses = len(responses)
        try:
            for question in survey.questions:
                q_text = question.get("text", "")
                q_type = question.get("type", "text")
                answers = [r.responses.get(q_text) for r in responses if r.responses.get(q_text) is not None]
                if not answers:
                    analytics[q_text] = {"type": q_type, "response_count": 0, "data": "No responses"}
                    continue
                if q_type == "rating":
                    analytics[q_text] = AnalyticsService._analyze_rating(answers)
                elif q_type in ["multiple_choice", "yes_no"]:
                    analytics[q_text] = AnalyticsService._analyze_choice(answers)
                elif q_type == "number":
                    analytics[q_text] = AnalyticsService._analyze_numeric(answers)
                elif q_type == "text":
                    analytics[q_text] = AnalyticsService._analyze_text(answers)
                else:
                    analytics[q_text] = {"type": q_type, "response_count": len(answers), "data": f"{len(answers)} answers"}
                analytics[q_text]["type"] = q_type
                analytics[q_text]["response_count"] = len(answers)
        except Exception as e:
            logger.error(f"Error: {str(e)}")
        return {"total_responses": total_responses, "analytics": analytics}

    @staticmethod
    def _analyze_rating(answers: List[Any]) -> Dict[str, Any]:
        try:
            nums = [float(a) for a in answers if isinstance(a, (int, float, str)) and str(a).replace('.', '', 1).isdigit()]
            if not nums:
                return {"data": "No valid ratings"}
            return {"data": {
                "average": round(mean(nums), 2),
                "median": round(median(nums), 2),
                "min": min(nums),
                "max": max(nums),
                "distribution": dict(Counter(nums)),
                "valid_responses": len(nums)}}
        except Exception as e:
            return {"data": f"Error: {str(e)}"}

    @staticmethod
    def _analyze_choice(answers: List[Any]) -> Dict[str, Any]:
        try:
            counter = Counter(str(a).strip() for a in answers if a)
            total = sum(counter.values())
            return {"data": {
                "responses": dict(counter),
                "percentages": {k: round((v / total)*100, 1) for k, v in counter.items()},
                "most_common": counter.most_common(1)[0] if counter else None
            }}
        except Exception as e:
            return {"data": f"Error: {str(e)}"}

    @staticmethod
    def _analyze_numeric(answers: List[Any]) -> Dict[str, Any]:
        try:
            nums = [float(a) for a in answers if isinstance(a, (int, float, str)) and str(a).replace('.', '', 1).isdigit()]
            if not nums:
                return {"data": "No valid numbers"}
            return {"data": {
                "average": round(mean(nums), 2),
                "median": round(median(nums), 2),
                "min": min(nums),
                "max": max(nums),
                "range": max(nums) - min(nums),
                "valid_responses": len(nums)}}
        except Exception as e:
            return {"data": f"Error: {str(e)}"}

    @staticmethod
    def _analyze_text(answers: List[Any]) -> Dict[str, Any]:
        try:
            texts = [str(a).strip() for a in answers if str(a).strip()]
            word_count = sum(len(ans.split()) for ans in texts)
            avg_words = round(word_count/len(texts), 1) if texts else 0
            return {"data": {
                "total_responses": len(texts),
                "average_word_count": avg_words,
                "sample_responses": texts[:3],
                "longest_response": max(texts, key=len) if texts else "",
                "shortest_response": min(texts, key=len) if texts else ""
            }}
        except Exception as e:
            return {"data": f"Error: {str(e)}"}

analytics_service = AnalyticsService()
