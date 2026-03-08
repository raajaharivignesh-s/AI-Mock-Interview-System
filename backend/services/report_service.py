# services/report_service.py

def generate_report(state):
    """
    Converts InterviewState into a structured report suitable for dashboard.
    Aggregates scores, strengths, improvements, and logs.
    """
    detailed_log = getattr(state, "interview_log", [])
    total_questions = max(state.total_questions, 1)

    # Initialize sums
    total_tech = total_depth = total_clarity = total_confidence = 0
    strengths = []
    improvements = []

    for idx, log in enumerate(detailed_log, 1):
        eval_ = log.get("evaluation", {})
        tech = eval_.get("technical", 0)
        depth = eval_.get("depth", 0)
        clarity = eval_.get("clarity", 0)
        confidence = eval_.get("confidence", 0)

        total_tech += tech
        total_depth += depth
        total_clarity += clarity
        total_confidence += confidence

        # Flatten comma-separated strengths/improvements
        s = eval_.get("strengths", "")
        if s:
            strengths.extend([x.strip() for x in s.split(",") if x.strip()])

        i = eval_.get("improvements", "")
        if i:
            improvements.extend([x.strip() for x in i.split(",") if x.strip()])

        # Ensure question_number & skill exist for frontend
        log.setdefault("question_number", idx)
        log.setdefault("skill", "General")
        log.setdefault("question", "")
        log.setdefault("answer", "")

    # Compute averages
    avg_tech = round(total_tech / total_questions, 2)
    avg_depth = round(total_depth / total_questions, 2)
    avg_clarity = round(total_clarity / total_questions, 2)
    avg_confidence = round(total_confidence / total_questions, 2)
    overall_score = round((avg_tech + avg_depth + avg_clarity + avg_confidence) / 4, 2)

    return {
        "total_questions": total_questions,
        "overall_score": overall_score,
        "technical": avg_tech,
        "depth": avg_depth,
        "clarity": avg_clarity,
        "confidence": avg_confidence,
        "strengths": strengths,
        "improvements": improvements,
        "covered_skills": list(getattr(state, "covered_skills", [])),
        "detailed_log": detailed_log
    }