import json
from services.openai_client import call_llm
from config import TEMPERATURE_LOW


async def analyze_resume(resume_text: str):
    """
    Extract structured information from Resume.
    """

    prompt = f"""
You are an expert technical recruiter.

Extract structured information from the following Resume.

Return STRICT JSON only in this format:

{{
  "candidate_name": "",
  "skills": [],
  "projects": [],
  "experience_years": "",
  "primary_domain": ""
}}

Resume:
{resume_text}
"""

    response = await call_llm(
        prompt=prompt,
        temperature=TEMPERATURE_LOW,
        max_tokens=400
    )

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        cleaned = response.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned)