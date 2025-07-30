from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class Document(BaseModel):
    id: str
    title: str
    content: str
    created_at: str
    updated_at: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[Message]] = []

class Source(BaseModel):
    chunk: str
    metadata: Dict[str, Any]
    relevance_score: Optional[float] = None

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[Source]] = None
    status: str = "success"
    method: Optional[str] = None  # "direct_gpt", "rag", "fallback", "error", "no_documents"

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