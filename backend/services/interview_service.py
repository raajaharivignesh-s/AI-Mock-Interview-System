import json
from services.openai_client import call_llm
from config import TEMPERATURE_MEDIUM

# Simple cache for static prompt parts
PROMPT_CACHE = {}

def build_static_prompt(jd_profile, resume_profile):
    key = json.dumps({"jd": jd_profile, "resume": resume_profile}, sort_keys=True)
    if key not in PROMPT_CACHE:
        prompt = f"""
You are a professional HR interviewer.
Job Role: {jd_profile.get('role')}
Required Skills: {jd_profile.get('required_skills')}
Candidate Skills: {resume_profile.get('skills')}
"""
        PROMPT_CACHE[key] = prompt
    return PROMPT_CACHE[key]

async def generate_question(state):
    """
    Generate the next interview question.
    Uses caching and avoids double-counting skills.
    """
    required_skills = state.jd_profile.get("required_skills", [])
    remaining_skills = [s for s in required_skills if s not in state.covered_skills]

    if not remaining_skills:
        state.end_interview()
        return None, None

    skill_to_ask = remaining_skills[0]
    static_prompt = build_static_prompt(state.jd_profile, state.resume_profile)

    # Build dynamic prompt
    if state.total_questions == 0 or not state.previous_question:
        dynamic_prompt = f"""
{static_prompt}
Ask ONE strong opening technical question focused on {skill_to_ask}.
Return ONLY the question sentence.
"""
    else:
        dynamic_prompt = f"""
{static_prompt}
Previous Question: {state.previous_question}
Candidate Answer: {state.previous_answer}
If answer is strong, move to next skill {skill_to_ask}.
If answer is weak, ask a follow-up on same skill.
Return ONLY one clear technical question.
"""

    question = await call_llm(prompt=dynamic_prompt, temperature=TEMPERATURE_MEDIUM, max_tokens=150)
    question = question.strip().strip('"')

    # Mark skill covered only for new skill
    if skill_to_ask not in state.covered_skills:
        state.covered_skills.add(skill_to_ask)
        state.increment_question_count()

    return question, skill_to_ask

