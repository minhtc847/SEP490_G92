import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL: str = os.getenv('OPENAI_MODEL', 'gpt-4')
    OPENAI_EMBEDDING_MODEL: str = os.getenv('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small')
    
    # ChromaDB Configuration
    CHROMA_DB_PATH: str = os.getenv('CHROMA_DB_PATH', './data/embeddings')
    CHROMA_COLLECTION_NAME: str = os.getenv('CHROMA_COLLECTION_NAME', 'documents')
    
    # MySQL Configuration
    MYSQL_HOST: str = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT: int = int(os.getenv('MYSQL_PORT', '3307'))
    MYSQL_DATABASE: str = os.getenv('MYSQL_DATABASE', 'vng_glass3')
    MYSQL_USER: str = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD: str = os.getenv('MYSQL_PASSWORD', 'tuankietnvu00')
    
    # File Upload Configuration
    UPLOAD_DIR: str = os.getenv('UPLOAD_DIR', './data/documents')
    MAX_FILE_SIZE: int = int(os.getenv('MAX_FILE_SIZE', '10485760'))  # 10MB
    ALLOWED_EXTENSIONS: List[str] = os.getenv('ALLOWED_EXTENSIONS', '.pdf,.txt,.docx').split(',')
    
    # API Configuration
    ALLOWED_ORIGINS: List[str] = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:8080').split(',')
    
    # Chunking Configuration
    CHUNK_SIZE: int = int(os.getenv('CHUNK_SIZE', '1000'))
    CHUNK_OVERLAP: int = int(os.getenv('CHUNK_OVERLAP', '200'))

settings = Settings()