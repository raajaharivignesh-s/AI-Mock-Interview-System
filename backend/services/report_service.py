# report_service.py

def generate_report(state):
    """
    Converts InterviewState into a structured report suitable for dashboard.
    """
    detailed_log = getattr(state, "interview_log", [])

    report = {
        "total_questions": state.total_questions,
        "average_score": state.average_score(),
        "covered_skills": list(state.covered_skills),
        "detailed_log": detailed_log
    }

    return report