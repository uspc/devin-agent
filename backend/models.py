from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    stream: bool = True


class ChatResponse(BaseModel):
    role: str
    content: str
