# Import services
from .services.document_service import DocumentService
from .services.embedding_service import EmbeddingService
from .services.openai_service import OpenAIService
from .services.chromadb.service import ChromaDBService
from .services.mysql_service import MySQLService

# Import schemas
from .models.schemas import (
    Message, Document, ChatResponse, UpdateDocument,
    DocumentMaterialBase, DocumentMaterialCreate, DocumentMaterialUpdate, DocumentMaterialResponse,
    UploadResponse, UpdateStatusRequest, UpdateChunkCountRequest
)

# Import API modules
from .api import chat, documents, health

# Import settings
from .config import settings

# Dependency injection functions
def get_document_service():
    return DocumentService()

def get_embedding_service():
    return EmbeddingService()

def get_openai_service():
    return OpenAIService()

def get_chromadb_service():
    return ChromaDBService()

def get_mysql_service():
    return MySQLService() 