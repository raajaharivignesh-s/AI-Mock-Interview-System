# AI Mock Interview System

## 📖 Project Overview
An AI-powered mock interview platform that helps users practice technical interviews. The system generates interview questions based on the user's resume and job description, accepts voice answers, evaluates responses using AI models, and generates a final report with scores, charts, and feedback.

## 🎯 Objectives
- **Simulate Real Interviews:** Provide candidates with a highly realistic mock interview experience customized to their profile.
- **Provide Actionable Insights:** Offer detailed feedback, scoring metrics, and visual performance charts to help users identify areas for improvement.
- **Enhance Communication Skills:** Allow candidates to practice and refine both spoken and written responses.

## 🛠️ Technologies Used
- **Backend:** Python, FastAPI
- **Frontend:** React + TypeScript
- **AI Model:** Gpt-4.1-nano
- **Speech-to-Text:** Whisper-1
- **Text-to-Speech:** Gpt-4o-mini-tts
- **Charts & Visualization:** Recharts

## 📂 Project Structure
```text
AI-Mock-Interview-System/
│
├── backend/                 # FastAPI backend
├── frontend/                # React TypeScript UI
├── .gitignore               # Git ignored files
└── README.md
```


## 📑 Key Features
- **Resume Upload:** Contextualize the interview using the candidate's uploaded resume.
- **Job Description Upload:** Tailor the interview questions accurately towards the desired role.
- **AI-Generated Interview Questions:** Generate dynamic and challenging questions specifically suited for the user's inputs.
- **Voice or Text Answer Support:** Practice using text input or speak naturally using voice support powered by Whisper.
- **AI Evaluation & Scoring:** Evaluate responses robustly using Gpt-4.1-nano to provide fair assessments.
- **Final Performance Report with Charts:** Visualize the interview results using Recharts alongside comprehensive feedback.

## 🧠 What This Project Demonstrates
- Full-stack web application development integrating a modern frontend architecture with a fast, async Python backend.
- Seamless integration of cutting-edge AI services—including LLMs and automatic speech recognition (OpenAI, Whisper).
- Effective data visual storytelling through performance charts to create an intuitive user experience.
- Designing interactive and state-heavy flows handling file uploads, real-time media/audio inputs, and streaming evaluations.

## 🚀 How to Run the Project

### Prerequisites
- Python 3.8+
- Node.js (v16+)
- OpenAI API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your `.env` file with the required variables (e.g., `OPENAI_API_KEY`).
4. Run the FastAPI server:
   ```bash
   python -m uvicorn app:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📌 Use Cases
- **Job Seekers:** Practice answering role-specific questions before actual technical interviews.
- **Career Coaches & Mentors:** Use the platform as an assessment tool to review candidate progress and tailor guidance.
- **Educational Institutions:** Deploy within career services to better prepare fresh graduates for the job market.

## 👥 Authors
- **ROHIT B G**
- **PRASHANNA S R**
- **RAAJA HARI VIGNESH S**

