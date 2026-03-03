# app.py

from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import uuid

from models.interview_state import InterviewState
from services import interview_service, evaluation_service, termination_service
from services.report_service import generate_report
from services.resume_service import parse_resume
from services.jd_service import analyze_jd
from utils.document_parser import extract_text_from_upload

app = FastAPI()

SESSIONS = {}

# -----------------------------
# Pydantic models for input
# -----------------------------

class JDInput(BaseModel):
    role: str
    required_skills: list[str]
    preferred_skills: list[str] = []

class ResumeInput(BaseModel):
    candidate_name: str
    skills: list[str]
    projects: list[str] = []
    experience_years: str = ""
    primary_domain: str = ""

class StartInterviewInput(BaseModel):
    jd: JDInput
    resume: ResumeInput

class SubmitAnswerInput(BaseModel):
    answer: str

class DebugResumeInput(BaseModel):
    resume_text: str

class DebugJDInput(BaseModel):
    jd_text: str

# -----------------------------
# Start interview endpoint
# -----------------------------

@app.post("/start_interview")
async def start_interview(input_data: StartInterviewInput):
    state = InterviewState()
    state.jd_profile = input_data.jd.dict()
    state.resume_profile = input_data.resume.dict()

    token = str(uuid.uuid4())
    SESSIONS[token] = state

    # Generate first question
    question, _ = await interview_service.generate_question(state)

    return {
        "session_token": token,
        "question": question
    }

# -----------------------------
# Submit answer endpoint
# -----------------------------

@app.post("/submit_answer")
async def submit_answer(
    input_data: SubmitAnswerInput,
    session_token: str = Header(...)
):
    if session_token not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    state = SESSIONS[session_token]

    if not state.is_active:
        return {"report": generate_report(state)}

    # Save candidate answer
    state.previous_answer = input_data.answer

    # Evaluate answer
    evaluation = await evaluation_service.evaluate_answer(state)

    # Update score
    state.add_score(evaluation.get("score", 0))

    # Generate next question
    next_question, skill = await interview_service.generate_question(state)

    # Log interaction
    state.log_interaction(
        question_number=state.total_questions,
        skill=skill,
        question=state.previous_question,
        answer=input_data.answer,
        evaluation=evaluation
    )

    # Check termination
    terminate, reason = termination_service.should_terminate_interview(state)

    if terminate:
        state.end_interview()
        return {"report": generate_report(state)}

    return {
        "next_question": next_question,
        "evaluation": evaluation
    }

# -----------------------------
# Debug endpoints (text)
# -----------------------------

@app.post("/debug/parse_resume")
async def debug_parse_resume(input_data: DebugResumeInput):
    return await parse_resume(input_data.resume_text)

@app.post("/debug/analyze_jd")
async def debug_analyze_jd(input_data: DebugJDInput):
    return await analyze_jd(input_data.jd_text)

# -----------------------------
# Debug endpoints (file upload)
# -----------------------------

@app.post("/debug/upload_resume")
async def debug_upload_resume(file: UploadFile = File(...)):
    text = await extract_text_from_upload(file)
    return await parse_resume(text)

@app.post("/debug/upload_jd")
async def debug_upload_jd(file: UploadFile = File(...)):
    text = await extract_text_from_upload(file)
    return await analyze_jd(text)