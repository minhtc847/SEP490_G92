from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from services.document_service import DocumentService
from services.embedding_service import EmbeddingService
from models.schemas import UploadResponse, DocumentMaterialCreate, DocumentMaterialUpdate, DocumentMaterialResponse
from models.schemas import UpdateStatusRequest, UpdateChunkCountRequest
from services.mysql_service import MySQLService
import shutil
from pathlib import Path
from typing import List

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(""),
    document_service: DocumentService = Depends(lambda: DocumentService()),
    embedding_service: EmbeddingService = Depends(lambda: EmbeddingService()),
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Upload and process document"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(tuple(['.pdf', '.txt'])):
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and TXT files are supported.")
        
        # Save file
        file_path = Path(f"data/documents/{file.filename}")
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text
        text = await document_service.extract_text(file_path)
        
        # Save to MySQL database
        document_id = await mysql_service.create_document_material(
            name=name,
            description=description,
            content=text,
            file_path=str(file_path)
        )
        
        # Update status to syncing
        await mysql_service.update_document_status(document_id, "syncing")
        
        # Process and embed
        metadata = {
            'filename': file.filename,
            'file_type': file.filename.split('.')[-1],
            'file_size': file.size,
            'document_id': document_id
        }
        
        await embedding_service.process_document(text, metadata)
        
        # Update status to ready and chunk count
        chunk_count = len(text) // 1000 + 1  # Simple chunk count estimation
        await mysql_service.update_document_status(document_id, "ready")
        await mysql_service.update_document_chunk_count(document_id, chunk_count)
        
        return UploadResponse(
            message="Document uploaded and processed successfully",
            filename=file.filename,
            document_id=document_id
        )
        
    except Exception as e:
        # Update status to error if something went wrong
        if 'document_id' in locals():
            await mysql_service.update_document_status(document_id, "error")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text", response_model=UploadResponse)
async def create_document_from_text(
    document_data: DocumentMaterialCreate,
    embedding_service: EmbeddingService = Depends(lambda: EmbeddingService()),
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Create document from text input"""
    try:
        # Save to MySQL database
        document_id = await mysql_service.create_document_material(
            name=document_data.name,
            description=document_data.description or "",
            content=document_data.content,
            file_path=document_data.file_path
        )
        
        # Update status to syncing
        await mysql_service.update_document_status(document_id, "syncing")
        
        # Process and embed
        metadata = {
            'document_id': document_id,
            'source': 'text_input'
        }
        
        await embedding_service.process_document(document_data.content, metadata)
        
        # Update status to ready and chunk count
        chunk_count = len(document_data.content) // 1000 + 1
        await mysql_service.update_document_status(document_id, "ready")
        await mysql_service.update_document_chunk_count(document_id, chunk_count)
        
        return UploadResponse(
            message="Document created and processed successfully",
            filename=document_data.name,
            document_id=document_id
        )
        
    except Exception as e:
        # Update status to error if something went wrong
        if 'document_id' in locals():
            await mysql_service.update_document_status(document_id, "error")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[DocumentMaterialResponse])
async def get_all_documents(
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Get all documents"""
    try:
        documents = await mysql_service.get_all_document_materials()
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}", response_model=DocumentMaterialResponse)
async def get_document_by_id(
    document_id: int,
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Get document by ID"""
    try:
        document = await mysql_service.get_document_material_by_id(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return document
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{document_id}", response_model=DocumentMaterialResponse)
async def update_document(
    document_id: int,
    document_data: DocumentMaterialUpdate,
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Update document"""
    try:
        success = await mysql_service.update_document_material(
            document_id=document_id,
            name=document_data.name,
            description=document_data.description,
            content=document_data.content,
            file_path=document_data.file_path
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Return updated document
        document = await mysql_service.get_document_material_by_id(document_id)
        return document
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Delete document"""
    try:
        success = await mysql_service.delete_document_material(document_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{document_id}/status")
async def update_document_status(
    document_id: int,
    status_request: UpdateStatusRequest,
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Update document status"""
    try:
        success = await mysql_service.update_document_status(document_id, status_request.status)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{document_id}/chunk-count")
async def update_document_chunk_count(
    document_id: int,
    chunk_request: UpdateChunkCountRequest,
    mysql_service: MySQLService = Depends(lambda: MySQLService())
):
    """Update document chunk count"""
    try:
        success = await mysql_service.update_document_chunk_count(document_id, chunk_request.chunk_count)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Chunk count updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))