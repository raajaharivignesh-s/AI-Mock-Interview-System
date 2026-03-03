# services/termination_service.py

MAX_QUESTIONS = 8
MIN_QUESTIONS_BEFORE_DECISION = 4
WEAK_THRESHOLD = 3


def should_terminate_interview(state):
    """
    Determines whether interview should end.
    Returns (bool, reason)
    """

    # Safety cap
    if state.total_questions >= MAX_QUESTIONS:
        return True, "Maximum question limit reached."

    # Early weak termination
    if (
        state.total_questions >= MIN_QUESTIONS_BEFORE_DECISION
        and state.average_score() <= WEAK_THRESHOLD
    ):
        return True, "Candidate performance consistently weak."

    # Skill coverage termination
    required_skills = set(state.jd_profile.get("required_skills", []))
    covered_skills = set(state.covered_skills)

    if required_skills and required_skills.issubset(covered_skills):
        return True, "All required skills evaluated."

    return False, "Continue interview."