from collections.abc import AsyncGenerator

from openai import AsyncOpenAI

from backend.config import settings


def get_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
    )


async def chat_completion(
    messages: list[dict[str, str]],
) -> str:
    client = get_client()
    response = await client.chat.completions.create(
        model=settings.model_name,
        messages=messages,
        max_tokens=settings.max_tokens,
        temperature=settings.temperature,
        stream=False,
    )
    return response.choices[0].message.content or ""


async def chat_completion_stream(
    messages: list[dict[str, str]],
) -> AsyncGenerator[str, None]:
    client = get_client()
    stream = await client.chat.completions.create(
        model=settings.model_name,
        messages=messages,
        max_tokens=settings.max_tokens,
        temperature=settings.temperature,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            yield delta.content
