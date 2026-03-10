import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ==============================
# OpenAI Credentials
# ==============================
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")

# ==============================
# Interview LLM Model
# ==============================
INTERVIEW_MODEL = "gpt-4.1-nano"

# ==============================
# Temperature Settings
# ==============================
TEMPERATURE_LOW = 0.2
TEMPERATURE_MEDIUM = 0.3

# ==============================
# Speech-to-Text (Local)
# ==============================
ASR_MODEL = "whisper-1"

# ==============================
# Text-to-Speech (OpenAI)
# ==============================
TTS_MODEL = "gpt-4o-mini-tts"

# ==============================
# Safety Checks
# ==============================
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set in the .env file")

if not OPENAI_BASE_URL:
    raise ValueError("OPENAI_BASE_URL is not set in the .env file")