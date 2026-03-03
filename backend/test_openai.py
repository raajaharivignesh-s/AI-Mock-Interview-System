import asyncio
from models.interview_state import InterviewState
from services.evaluation_service import evaluate_answer


async def test_evaluation():

    state = InterviewState()

    state.jd_profile = {
        "role": "Backend Developer",
        "required_skills": ["Python", "Django"],
    }

    state.previous_question = "Explain how Django authentication works."
    state.previous_answer = "Django uses middleware and sessions to manage user authentication."

    result = await evaluate_answer(state)

    print("\nEvaluation Result:")
    print(result)
    print("\nAverage Score Stored:", state.average_score())


asyncio.run(test_evaluation())