"""Rihla backend: a FastAPI API for the Morocco travel guide chatbot."""

import os
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import APIError, APITimeoutError, OpenAI
from pydantic import BaseModel, Field, field_validator

from prompt import SYSTEM_PROMPT

# --- Configuration (read from the .env file at the root of the project) ---
load_dotenv()

API_KEY = os.getenv("LLM_API_KEY")
BASE_URL = os.getenv("LLM_BASE_URL")
MODEL = os.getenv("LLM_MODEL")
TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.4"))
TIMEOUT = float(os.getenv("LLM_TIMEOUT", "30"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

if not API_KEY:
    raise RuntimeError("LLM_API_KEY is missing: add it to the .env file")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL, timeout=TIMEOUT)

# --- Application ---
app = FastAPI(title="Rihla API", description="Morocco travel guide chatbot")

# CORS: allow the React app (another address) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conversations stored in memory: {conversation_id: history}
# (they are lost when the server restarts, which is enough for this project)
conversations = {}


# --- Data models (validated by Pydantic) ---
class ChatRequest(BaseModel):
    message: str = Field(max_length=2000)
    conversation_id: str | None = None

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("The message cannot be empty")
        return value


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str


# --- Routes ---
@app.get("/health")
def health():
    """Check that the service is running."""
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Send a message and receive Rihla's answer."""
    # No id given: start a new conversation
    conversation_id = request.conversation_id or str(uuid.uuid4())
    history = conversations.setdefault(conversation_id, [])

    # System prompt + previous messages + new message (same logic as the notebook)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += history
    messages.append({"role": "user", "content": request.message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=TEMPERATURE,
        )
    except APITimeoutError:
        raise HTTPException(status_code=504, detail="The model took too long to answer. Please try again.")
    except APIError:
        raise HTTPException(status_code=502, detail="The model is not available right now. Please try again later.")

    answer = response.choices[0].message.content or "Sorry, I could not answer. Please try again."

    history.append({"role": "user", "content": request.message})
    history.append({"role": "assistant", "content": answer})

    return ChatResponse(conversation_id=conversation_id, answer=answer)


@app.delete("/chat/{conversation_id}")
def reset_conversation(conversation_id: str):
    """Reset a conversation by deleting its history."""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    del conversations[conversation_id]
    return {"message": "Conversation reset"}
