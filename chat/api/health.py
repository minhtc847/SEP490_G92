from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Chatbot API is running"} 