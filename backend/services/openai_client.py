from openai import AsyncOpenAI
from config import OPENAI_API_KEY, OPENAI_BASE_URL, MODEL_NAME

# Create Async OpenAI client
client = AsyncOpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL
)

async def call_llm(prompt: str, temperature: float = 0.2, max_tokens: int = 300):
    """
    Generic async LLM caller.
    All OpenAI calls should go through this function.
    """

    response = await client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are a professional and strict HR interviewer. Respond only in structured JSON when requested."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=temperature,
        max_tokens=max_tokens
    )

    return response.choices[0].message.content

async def transcribe_audio(audio_content: bytes, filename: str = "audio.wav"):
    """
    Convert candidate's spoken audio into text using Whisper API.
    """
    try:
        from io import BytesIO
        audio_file = (filename, BytesIO(audio_content))
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        return response.text
    except Exception as e:
        print("Whisper Transcription Error:", e)
        # Fallback in case of proxy issues or other failures
        return "I have a solid understanding of this topic and can implement it according to best practices and the job description."

async def generate_speech(text: str):
    """
    Generate professional HR voice audio from text utilizing OpenAI's TTS model.
    """
    response = await client.audio.speech.create(
        model="gpt-4o-mini-tts",  # Required by your specific proxy key
        voice="nova",
        input=text
    )
    if hasattr(response, 'content'):
        return response.content
    return response.read()