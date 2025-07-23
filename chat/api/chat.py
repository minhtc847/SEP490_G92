from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.openai_service import get_openai_response
from services.chromadb_service import (
    add_message,
    update_message,
    delete_message,
    get_messages
)

router = APIRouter()

class Message(BaseModel):
    user_id: str
    content: str

@router.post("/chat/send")
async def send_message(message: Message):
    try:
        response = await get_openai_response(message.content)
        await add_message(user_id=message.user_id, content=message.content)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/chat/update/{message_id}")
async def update_chat_message(message_id: str, message: Message):
    try:
        await update_message(message_id=message_id, user_id=message.user_id, content=message.content)
        return {"detail": "Message updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/delete/{message_id}")
async def delete_chat_message(message_id: str):
    try:
        await delete_message(message_id=message_id)
        return {"detail": "Message deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/messages/{user_id}")
async def get_chat_messages(user_id: str):
    try:
        messages = await get_messages(user_id=user_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))