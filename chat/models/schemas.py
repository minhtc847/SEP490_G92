from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

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

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None
    status: str = "success"

class UpdateDocument(BaseModel):
    title: Optional[str]
    content: Optional[str]

# DocumentMaterial schemas
class DocumentMaterialBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    file_path: Optional[str] = None

class DocumentMaterialCreate(DocumentMaterialBase):
    pass

class DocumentMaterialUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    file_path: Optional[str] = None

class DocumentMaterialResponse(DocumentMaterialBase):
    id: int
    status: str
    created_at: datetime
    chunk_count: int

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    message: str
    filename: str
    document_id: Optional[int] = None

class UpdateStatusRequest(BaseModel):
    status: str

class UpdateChunkCountRequest(BaseModel):
    chunk_count: int