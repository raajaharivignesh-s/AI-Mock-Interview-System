import json
from services.openai_client import call_llm
from config import TEMPERATURE_MEDIUM
from services.termination_service import should_terminate_interview

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

    - If the candidate performed well previously, ask a follow-up question focusing on a *new aspect* of the same skill, avoiding repetition.
    - If the candidate performed weakly, move to the next skill to cover all required skills.
    """
    required_skills = state.jd_profile.get("required_skills", [])
    remaining_skills = [s for s in required_skills if s not in state.covered_skills]

    # Check if interview should terminate
    terminate, reason = should_terminate_interview(state)
    if terminate:
        state.end_interview()
        return None, None

    # Pick next skill
    skill_to_ask = remaining_skills[0] if remaining_skills else None
    static_prompt = build_static_prompt(state.jd_profile, state.resume_profile)

    # Decide prompt for LLM
    if state.total_questions == 0 or not state.previous_question:
        # First question
        dynamic_prompt = f"""
{static_prompt}
Ask ONE clear and relevant technical question focusing on {skill_to_ask}.
Return ONLY the question, without extra context or explanation.
"""
    else:
        last_score = state.scores[-1] if state.scores else 0
        prev_question = state.previous_question
        prev_answer = state.previous_answer

        if last_score >= 7:
            # Strong candidate → follow-up on the same skill but new angle
            dynamic_prompt = f"""
{static_prompt}
Previous Question: {prev_question}
Candidate Answer: {prev_answer}

The candidate performed well. Ask ONE follow-up question that explores a new aspect, detail, or challenge within the same skill ({skill_to_ask}) without repeating the wording of the previous question. 
Keep the question concise and focused. Return ONLY the question.
"""
        else:
            # Weak candidate → move to next skill
            dynamic_prompt = f"""
{static_prompt}
Previous Question: {state.previous_question}
Candidate Answer: {state.previous_answer}
If answer is strong, move to next skill {skill_to_ask}.
If answer is weak, ask a follow-up on same skill.
Return ONLY one clear technical question.
"""

    # Call the LLM
    question = await call_llm(prompt=dynamic_prompt, temperature=TEMPERATURE_MEDIUM, max_tokens=150)
    question = question.strip().strip('"')

    # Mark skill as covered only for new skill
    if skill_to_ask not in state.covered_skills:
        state.covered_skills.add(skill_to_ask)
        state.increment_question_count()

    return question, skill_to_ask