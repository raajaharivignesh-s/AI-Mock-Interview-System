# test_interview_flow.py (using generate_report)

import asyncio
from models.interview_state import InterviewState
from services import interview_service, evaluation_service, termination_service
from services.report_service import generate_report  # <- now we will use it

async def simulate_interview(mock=False):
    """
    Simulate an interview session.
    Handles question generation, candidate answer, evaluation, and logging.
    Returns final report.
    """
    state = InterviewState()
    state.jd_profile = {
        "role": "Backend Developer",
        "required_skills": ["Python", "Django", "SQL"]
    }
    state.resume_profile = {
        "skills": ["Python", "SQL"]
    }

    state.interview_log = []  # Initialize log

    print("=== STARTING INTERVIEW ===\n")

    question_number = 1

    while state.is_active:
        # Generate question
        question = await interview_service.generate_question(state)

        if question is None:  # All skills covered, interview ended
            break

        # Normalize question text (from dict, list, tuple, or plain string)
        if isinstance(question, dict) and "question" in question:
            question_text = question["question"]
        elif isinstance(question, (list, tuple)):
            question_text = str(question[0])
        else:
            question_text = str(question)

        state.previous_question = question_text

        # Simulate candidate answer
        answer = f"My answer about {question_text}"
        state.previous_answer = answer

        # Evaluate answer
        evaluation = await evaluation_service.evaluate_answer(state)

        # Update scores and covered skills
        state.add_score(evaluation.get('score', 0))

        # Determine which skill this question belongs to
        skill_to_ask = None
        for skill in state.jd_profile.get("required_skills", []):
            if skill.lower() in question_text.lower():
                skill_to_ask = skill
                state.covered_skills.add(skill)
                break

        # Log the interaction
        log_entry = {
            "question_number": question_number,
            "skill": skill_to_ask,
            "question": question_text,
            "answer": answer,
            "evaluation": evaluation
        }
        state.interview_log.append(log_entry)

        # Print for testing
        print(f"Q{question_number}: {question_text}")
        print(f"Answer: {answer}")
        print(f"Evaluation: {evaluation}\n")

        # Increment counters and check termination
        state.increment_question_count()
        question_number += 1

        terminate, reason = termination_service.should_terminate_interview(state)
        if terminate:
            print(f"--- INTERVIEW ENDED: {reason} ---\n")
            state.end_interview()

    # Final report using centralized function
    report = generate_report(state)

    print("=== INTERVIEW SUMMARY ===")
    print(report)

    return report

# Run simulation if executed directly
if __name__ == "__main__":
    asyncio.run(simulate_interview(mock=True))