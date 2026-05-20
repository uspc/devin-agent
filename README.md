# Devin Agent

LLM-powered chat agent with a FastAPI backend and a web-based chat UI. Supports streaming responses via Server-Sent Events (SSE).

## Features

- **Streaming chat** — token-by-token responses streamed to the browser in real time
- **Conversation history** — multi-turn conversations with full context
- **OpenAI-compatible** — works with OpenAI, Azure OpenAI, local models (Ollama, LM Studio), or any provider that exposes an OpenAI-compatible API
- **Clean chat UI** — dark-themed, responsive interface

## Quick Start

### 1. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Run the server

```bash
uvicorn backend.main:app --reload --port 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

## API Endpoints

| Method | Path          | Description                  |
|--------|---------------|------------------------------|
| GET    | `/api/health` | Health check                 |
| POST   | `/api/chat`   | Send a chat message          |
| GET    | `/`           | Serves the chat UI           |

### POST `/api/chat`

**Request body:**

```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "stream": true
}
```

**Response (stream=true):** Server-Sent Events with `{"token": "..."}` payloads.

**Response (stream=false):**

```json
{
  "role": "assistant",
  "content": "Hello! How can I help you?"
}
```

## Configuration

All settings can be configured via environment variables or `.env`:

| Variable          | Default                        | Description                          |
|-------------------|--------------------------------|--------------------------------------|
| `OPENAI_API_KEY`  | *(required)*                   | API key for the LLM provider         |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1`    | Base URL for OpenAI-compatible API   |
| `MODEL_NAME`      | `gpt-3.5-turbo`               | Model to use                         |
| `MAX_TOKENS`      | `2048`                         | Maximum tokens per response          |
| `TEMPERATURE`     | `0.7`                          | Sampling temperature                 |

## Using with Local Models

To use with [Ollama](https://ollama.ai):

```bash
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
MODEL_NAME=llama3
```

To use with [LM Studio](https://lmstudio.ai):

```bash
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_API_KEY=lm-studio
MODEL_NAME=local-model
```

## Development

```bash
pip install -e ".[dev]"

# Lint
ruff check backend/

# Format
ruff format backend/

# Run tests
pytest
```

## Project Structure

```
devin-agent/
├── backend/
│   ├── __init__.py
│   ├── config.py       # Settings from environment / .env
│   ├── llm.py          # OpenAI client + streaming logic
│   ├── main.py          # FastAPI application
│   └── models.py        # Pydantic request/response models
├── frontend/
│   ├── index.html       # Chat UI
│   ├── style.css        # Styles
│   └── script.js        # Frontend logic
├── pyproject.toml
├── .env.example
└── README.md
```
