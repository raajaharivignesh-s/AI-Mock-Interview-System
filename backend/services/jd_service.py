import json
from services.openai_client import call_llm
from config import TEMPERATURE_LOW


async def analyze_jd(jd_text: str):
    """
    Extract structured information from Job Description.
    """

    prompt = f"""
You are a professional technical recruiter.

Extract structured information from the following Job Description.

Return STRICT JSON only in this format:

{{
  "role": "",
  "required_skills": [],
  "preferred_skills": [],
  "experience_level": ""
}}

Job Description:
{jd_text}
"""

    response = await call_llm(
        prompt=prompt,
        temperature=TEMPERATURE_LOW,
        max_tokens=300
    )

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # If model adds extra text, try cleaning
        cleaned = response.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned)