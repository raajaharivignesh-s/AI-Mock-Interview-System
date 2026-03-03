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