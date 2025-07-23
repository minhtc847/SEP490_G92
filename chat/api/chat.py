from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.openai_service import get_openai_response
from services.chromadb_service import (
    add_message,
    update_message,
    delete_message,
    get_messages,
    get_conversations
)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversationId: str
    userId: Optional[str] = None

class MessageModel(BaseModel):
    id: str
    role: str
    content: str
    createdAt: str
    conversationId: str

class ConversationModel(BaseModel):
    id: str
    title: str

@router.get("/conversations", response_model=List[ConversationModel])
async def list_conversations(userId: Optional[str] = None):
    try:
        return await get_conversations(userId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageModel])
async def get_conversation_messages(conversation_id: str):
    try:
        return await get_messages(conversation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=dict)
async def send_message(req: ChatRequest):
    try:
        # Lưu message user
        user_msg = await add_message(req.conversationId, req.message, role="user")
        # Gọi bot
        reply = await get_openai_response(req.message)
        # Lưu message bot
        bot_msg = await add_message(req.conversationId, reply, role="assistant")
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))