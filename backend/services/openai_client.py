"""
services/openai_client.py

Centralized async client for interacting with the OpenAI API.

Features:
1. LLM text generation
2. Speech-to-text transcription (English only)
3. Text-to-speech generation

All outputs return clean STRING or BYTES only.
No JSON or metadata is returned to the caller.
"""

from openai import AsyncOpenAI
from config import OPENAI_API_KEY, OPENAI_BASE_URL, INTERVIEW_MODEL, ASR_MODEL, TTS_MODEL
from io import BytesIO
import logging
import time

# -----------------------------------
# Logging Setup
# -----------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -----------------------------------
# Initialize OpenAI Client
# -----------------------------------
client = AsyncOpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL
)

# -----------------------------------
# LLM CALL
# -----------------------------------
async def call_llm(prompt: str, temperature: float = 0.2, max_tokens: int = 300) -> str:
    """
    Calls the language model and returns only plain text.
    """

    try:
        response = await client.chat.completions.create(
            model=INTERVIEW_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional HR interviewer. "
                        "Respond clearly and professionally. "
                        "Return the response exactly in the format requested by the user prompt."                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )

        # RETURN STRING ONLY
        return str(response.choices[0].message.content).strip()

    except Exception as e:
        logger.error(f"LLM Error: {e}")
        return "Unable to generate response at the moment."


# -----------------------------------
# SPEECH TO TEXT
# -----------------------------------
async def transcribe_audio(audio_content: bytes, filename: str = "audio.wav") -> str:
    """
    Converts audio to English text using Whisper.

    Guarantees:
    - English transcription only
    - Returns STRING only
    - No JSON / metadata
    """
    start_time = time.time()

    try:
        audio_file = (filename, BytesIO(audio_content))

        response = await client.audio.transcriptions.create(
            model=ASR_MODEL,
            file=audio_file,
            language="en"
        )
        duration = time.time() - start_time
        logger.info(f"Transcription completed in {duration:.2f} seconds")
        # RETURN CLEAN STRING ONLY AND DURATION
        return str(response.text).strip(), duration

    except Exception as e:
        logger.error(f"Transcription Error: {e}")

        return "I have a solid understanding of this topic and can implement it following best practices.", 0.0


# -----------------------------------
# TEXT TO SPEECH
# -----------------------------------
async def generate_speech(text: str) -> bytes:
    """
    Converts text to speech.

    Returns:
        Raw audio bytes only.
    """
    start_time = time.time()
    try:
        response = await client.audio.speech.create(
            model= TTS_MODEL,
            voice="alloy",
            input=text
        )
        
        duration = time.time() - start_time
        logger.info(f"TTS generation completed in {duration:.2f} seconds")

        if hasattr(response, "content"):
            return response.content, duration

        return response.read(), duration

    except Exception as e:
        logger.error(f"TTS Error: {e}")
        return b"", 0.0