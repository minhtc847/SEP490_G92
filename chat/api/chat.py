from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(lambda: ChatService())
):
    """Chat endpoint"""
    try:
        response = await chat_service.process_message(request.message, request.history)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))