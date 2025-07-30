from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService
from typing import List, Dict, Any

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(lambda: ChatService())
):
    """Chat endpoint with intelligent question classification and RAG"""
    try:
        # Process the question through intelligent pipeline
        result = await chat_service.process_question_with_rag(request.question)
        
        return ChatResponse(
            response=result["answer"],
            sources=result["sources"],
            status="success",
            method=result["method"]
        )
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    chat_service: ChatService = Depends(lambda: ChatService())
):
    """Streaming chat endpoint"""
    try:
        # For now, return the same as regular chat
        # TODO: Implement streaming response
        result = await chat_service.process_question_with_rag(request.question)
        
        return ChatResponse(
            response=result["answer"],
            sources=result["sources"],
            status="success",
            method=result["method"]
        )
    except Exception as e:
        print(f"Error in chat stream endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))