from pydantic import BaseModel
from typing import Optional, List

class Message(BaseModel):
    id: Optional[int]
    content: str
    sender: str
    timestamp: str

class Document(BaseModel):
    id: Optional[int]
    title: str
    content: str
    created_at: str
    updated_at: str

class ChatResponse(BaseModel):
    message: str
    suggestions: Optional[List[str]] = None
    status: str

class UpdateDocument(BaseModel):
    title: Optional[str]
    content: Optional[str]