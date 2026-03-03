# services/evaluation_service.py

from services.openai_client import call_llm
import json

# Default mock flag (can be overridden per call)
DEFAULT_MOCK = True

async def evaluate_answer(state, mock=None):
    """
    Evaluate the candidate's last answer.
    Returns a dict with score, technical depth, communication, strengths, improvements.

    Parameters:
    - state: InterviewState
    - mock: bool | None
        If True, returns mock evaluation for testing.
        If False, performs real LLM evaluation.
        If None, uses DEFAULT_MOCK value.
    """
    use_mock = DEFAULT_MOCK if mock is None else mock

    if use_mock:
        # Simple mock rules
        answer = state.previous_answer.lower() if state.previous_answer else ""
        if "list comprehension" in answer:
            return {"score": 5, "technical_depth": "Moderate",
                    "communication": "Basic explanation", "strengths": "Understands basics",
                    "improvements": "Add examples and details"}
        elif "django" in answer:
            return {"score": 6, "technical_depth": "Moderate",
                    "communication": "Basic explanation", "strengths": "Knows ORM",
                    "improvements": "Explain best practices and migrations"}
        elif "sql" in answer:
            return {"score": 7, "technical_depth": "Moderate",
                    "communication": "Basic explanation", "strengths": "Knows queries",
                    "improvements": "Explain optimization and indexing"}
        else:
            return {"score": 4, "technical_depth": "Low",
                    "communication": "Brief", "strengths": "", "improvements": ""}
    else:
        # Real evaluation using LLM
        prompt = f"""
Evaluate the following candidate answer and provide a JSON with fields:
score (0-10), technical_depth, communication, strengths, improvements.

Question: {state.previous_question}
Answer: {state.previous_answer}
"""
        raw_eval = await call_llm(prompt=prompt, max_tokens=150)
        try:
            return json.loads(raw_eval)
        except:
            # fallback
            return {"score": 0, "technical_depth": "N/A",
                    "communication": "N/A", "strengths": "", "improvements": ""}