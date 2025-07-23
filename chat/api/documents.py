from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Document(BaseModel):
    id: str
    title: str
    content: str

documents_db = {}

@router.post("/documents/", response_model=Document)
def create_document(document: Document):
    if document.id in documents_db:
        raise HTTPException(status_code=400, detail="Document already exists")
    documents_db[document.id] = document
    return document

@router.get("/documents/", response_model=List[Document])
def read_documents():
    return list(documents_db.values())

@router.get("/documents/{document_id}", response_model=Document)
def read_document(document_id: str):
    document = documents_db.get(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.put("/documents/{document_id}", response_model=Document)
def update_document(document_id: str, document: Document):
    if document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    documents_db[document_id] = document
    return document

@router.delete("/documents/{document_id}", response_model=Document)
def delete_document(document_id: str):
    document = documents_db.pop(document_id, None)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document