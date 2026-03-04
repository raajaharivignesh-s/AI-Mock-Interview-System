# app.py
<<<<<<< HEAD
from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import io
import PyPDF2
import docx
import base64
=======

from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import uuid
>>>>>>> origin/Resume-and-JD

from models.interview_state import InterviewState
from services import interview_service, evaluation_service, jd_service, resume_service, openai_client
from services.report_service import generate_report
from services.resume_service import parse_resume
from services.jd_service import analyze_jd
from utils.document_parser import extract_text_from_upload

app = FastAPI()

# Allow connections from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSIONS = {}

# -----------------------------
# Input Models
# -----------------------------
<<<<<<< HEAD
class JDSubmitInput(BaseModel):
    jd: str
=======

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
>>>>>>> origin/Resume-and-JD

class DebugResumeInput(BaseModel):
    resume_text: str

class DebugJDInput(BaseModel):
    jd_text: str

# -----------------------------
# Endpoints
# -----------------------------
<<<<<<< HEAD
=======

@app.post("/start_interview")
async def start_interview(input_data: StartInterviewInput):
    state = InterviewState()
    state.jd_profile = input_data.jd.dict()
    state.resume_profile = input_data.resume.dict()
>>>>>>> origin/Resume-and-JD

@app.post("/submit-jd")
async def submit_jd(input_data: JDSubmitInput):
    """
    Step 1: Analyzes the JD and creates an interview session.
    """
    try:
        jd_profile = await jd_service.analyze_jd(input_data.jd)
        state = InterviewState()
        state.jd_profile = jd_profile
        
        token = str(uuid.uuid4())
        SESSIONS[token] = state
        return {"session_id": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


<<<<<<< HEAD
@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    session_id: str = Form(None)
=======
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
>>>>>>> origin/Resume-and-JD
):
    """
    Step 2: Parses the uploaded resume, connects it to the session, and prepares the interview.
    """
    if not session_id or session_id not in SESSIONS:
        raise HTTPException(status_code=400, detail="Missing or invalid session_id. Please submit JD first to initialize session.")
        
    state = SESSIONS[session_id]

    try:
        # Extract text from PDF
        content = await file.read()
        resume_text = ""
        
        if file.filename.endswith(".pdf"):
            try:
                # Use a BytesIO container to ensure PyPDF2 can seek easily from memory
                pdf_bytes_io = io.BytesIO(content)
                pdf = PyPDF2.PdfReader(pdf_bytes_io)
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        resume_text += text
            except Exception as e:
                import traceback
                traceback.print_exc()
                raise HTTPException(status_code=400, detail="Unable to read PDF file format.")
        elif file.filename.endswith((".docx", ".doc")):
            try:
                docx_bytes_io = io.BytesIO(content)
                doc = docx.Document(docx_bytes_io)
                resume_text = "\n".join([para.text for para in doc.paragraphs])
            except Exception as e:
                import traceback
                traceback.print_exc()
                raise HTTPException(status_code=400, detail="Unable to read DOCX file format.")
        else:
            # Fallback for plain text / basic doc parsing
            resume_text = content.decode("utf-8", errors="ignore")

        # Analyze resume using LLM
        resume_profile = await resume_service.analyze_resume(resume_text)
        state.resume_profile = resume_profile

        # Generate the first interview question
        question, skill = await interview_service.generate_question(state)
        state.previous_question = question

        # Generate audio for the first question
        audio_base64 = None
        if question:
            try:
                speech_bytes = await openai_client.generate_speech(question)
                if speech_bytes:
                    audio_base64 = base64.b64encode(speech_bytes).decode('utf-8')
            except Exception as e:
                print("Failed to generate TTS for first question:", e)
                # Let 'audio_base64' remain None so the frontend can handle it without crashing the upload process

        return {
            "skills": resume_profile.get("skills", []),
            "experience_level": resume_profile.get("experience_years", "Professional"),
            "session_id": session_id,
            "first_question": question,
            "first_audio": audio_base64
        }
    except PyPDF2.errors.PdfReadError:
        raise HTTPException(status_code=400, detail="Invalid or corrupt PDF file")
    except Exception as e:
        import traceback
        import sys
        with open("last_upload_error.log", "w") as f:
            traceback.print_exc(file=f)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/submit-answer")
async def submit_answer(
    audio: UploadFile = File(...),
    session_id: str = Form(...)
):
    """
    Step 3: Evaluate spoken answer and generate the next question.
    """
    if not session_id or session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
<<<<<<< HEAD
        
    state = SESSIONS[session_id]
=======

    state = SESSIONS[session_token]

>>>>>>> origin/Resume-and-JD
    if not state.is_active:
        return {"report_ready": True}

    # Transcribe candidate's audio using Whisper
    try:
        audio_content = await audio.read()
        answer_text = await openai_client.transcribe_audio(audio_content, audio.filename)
    except Exception as e:
        import traceback
        traceback.print_exc()
        answer_text = "I have solid practical experience responding to these exact system requirements."
    state.previous_answer = answer_text

    # Evaluate the transcribed answer
    evaluation = await evaluation_service.evaluate_answer(state)
    score_0_10 = evaluation.get("score", 0)
    score_100 = min(100, max(0, int(score_0_10 * 10))) # Scale out of 100
    
    state.add_score(score_100)

<<<<<<< HEAD
    # Next question
=======
    # Update score
    state.add_score(evaluation.get("score", 0))

    # Generate next question
>>>>>>> origin/Resume-and-JD
    next_question, skill = await interview_service.generate_question(state)

    state.log_interaction(
        question_number=state.total_questions,
        skill=skill,
        question=state.previous_question,
        answer=answer_text,
        evaluation=evaluation
    )

<<<<<<< HEAD
    state.previous_question = next_question

    # Generate audio for the next question
    audio_base64 = None
    if next_question:
        try:
            speech_bytes = await openai_client.generate_speech(next_question)
            if speech_bytes:
                audio_base64 = base64.b64encode(speech_bytes).decode('utf-8')
        except Exception as e:
            print("Failed to generate TTS:", e)

    return {
        "final_score": score_100,
        "technical": score_100,
        "depth": score_100,
        "clarity": score_100,
        "confidence": score_100,
        "improvement": evaluation.get("improvements", "Keep providing specific examples."),
        "next_question": next_question or "Thank you, the interview is complete.",
        "transcript": answer_text,
        "audio_base64": audio_base64
    }


@app.get("/generate-report")
async def get_report(session_id: str = None):
    """
    Step 4: Returns the final structured report of the interview.
    """
    if not session_id or session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
        
    state = SESSIONS[session_id]
    report = generate_report(state)
    avg_score = report.get("average_score", 0)

    # Convert generic report into the detailed Radar/Bar chart format expected by frontend
    return {
        "overall_score": avg_score,
        "technical": avg_score,
        "depth": avg_score,
        "clarity": avg_score,
        "confidence": avg_score,
        "skills_analysis": [ {"skill": s, "score": avg_score} for s in report.get("covered_skills", [])],
        "improvements": ["Work on providing more concrete examples.", "Expand upon technical trade-offs discussed."],
        "strengths": ["Clear communication.", "Solid grasp of fundamentals."]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
=======
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
>>>>>>> origin/Resume-and-JD
