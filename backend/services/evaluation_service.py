"""
services/evaluation_service.py

Provides functionality to evaluate a candidate's answer against the asked question
using the LLM. It extracts a continuous score and specific textual feedback.
"""
from services.openai_client import call_llm
import json

async def evaluate_answer(state):
    """
    Evaluates the candidate's last answer dynamically using the AI model.
    
    Args:
        state: The ongoing InterviewState object containing the previous question and answer.
        
    Returns:
        A semantic, structured dictionary containing:
        {
            "score": 0-10,
            "technical_depth": "Detailed explanation of technical correctness",
            "communication": "Observations on clarity and articulation",
            "strengths": "What was done well in the answer",
            "improvements": "Suggestions for improving the answer"
        }
    """

    # Ensure we have a previous question and answer
    question = state.previous_question or ""
    answer = state.previous_answer or ""

    prompt = f"""
You are a professional HR interviewer.

Task:
Evaluate the following candidate answer semantically.
- Consider correctness, completeness, depth of knowledge, clarity, and confidence.
- Provide a numeric score from 0 to 10.
- Give detailed feedback for technical depth and communication.
- Mention clear strengths and concrete suggestions for improvements.

Return STRICT JSON ONLY with the following fields:
score (0-10),
technical_depth,
communication,
strengths,
improvements

Question:
{question}

Candidate Answer:
{answer}
"""

    # Call the LLM
    raw_eval = await call_llm(prompt=prompt, max_tokens=250, temperature=0.2)

    try:
        # Attempt to parse JSON from model
        evaluation = json.loads(raw_eval)
        return evaluation
    except json.JSONDecodeError:
        # fallback if LLM returns non-JSON
        return {
            "score": 0,
            "technical_depth": "N/A",
            "communication": "N/A",
            "strengths": "",
            "improvements": "Failed to parse LLM response. Try re-evaluating."
        }