import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI Credentials
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")

# Model Configuration
MODEL_NAME = "gpt-4.1-nano"

# Temperature Settings
TEMPERATURE_LOW = 0.2
TEMPERATURE_MEDIUM = 0.3

# Safety Check
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set in the .env file")

if not OPENAI_BASE_URL:
    raise ValueError("OPENAI_BASE_URL is not set in the .env file")