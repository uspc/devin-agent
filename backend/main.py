import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.llm import chat_completion, chat_completion_stream
from backend.models import ChatRequest, ChatResponse

app = FastAPI(title="Devin Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=None)
async def chat(request: ChatRequest) -> StreamingResponse | ChatResponse:
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured. Set it in .env or as an environment variable.",
        )

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    if request.stream:

        async def event_generator():
            try:
                async for token in chat_completion_stream(messages):
                    data = json.dumps({"token": token})
                    yield f"data: {data}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                error_data = json.dumps({"error": str(e)})
                yield f"data: {error_data}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    try:
        content = await chat_completion(messages)
        return ChatResponse(role="assistant", content=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
