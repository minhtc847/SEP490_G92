from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class MaterialBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Material name")
    description: Optional[str] = Field(None, max_length=1000, description="Material description")
    content: str = Field(..., min_length=1, description="Material content from PDF or manual input")

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    content: Optional[str] = Field(None, min_length=1)

class MaterialResponse(MaterialBase):
    id: UUID
    status: str
    created_at: datetime
    chunk_count: Optional[int] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User question for RAG chatbot")
    model: Optional[str] = Field("gpt-3.5-turbo", description="LLM model to use")

class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = Field(..., description="Sources used to answer the question")
    model_used: str = Field(..., description="LLM model used to generate the answer") 