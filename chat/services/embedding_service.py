from services.openai_service import OpenAIService
from services.chromadb_service import ChromaDBService
from services.document_service import DocumentService
from utils.text_utils import chunk_text
import uuid
import os

class EmbeddingService:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.chromadb_service = ChromaDBService()
        self.document_service = DocumentService()
    
    async def process_document(self, file_path: str, document_id: int) -> None:
        """Process document: extract text, chunk, embed, and store"""
        try:
            # Extract text from file
            text = await self.document_service.extract_text(file_path)
            
            # Chunk the text
            chunks = chunk_text(text, chunk_size=1000, overlap=200)
            
            # Generate embeddings for each chunk
            documents = []
            metadatas = []
            ids = []
            
            filename = os.path.basename(file_path)
            file_type = os.path.splitext(filename)[1].lower()
            
            for i, chunk in enumerate(chunks):
                embedding = await self.openai_service.generate_embedding(chunk)
                
                chunk_metadata = {
                    'document_id': document_id,
                    'filename': filename,
                    'file_type': file_type,
                    'chunk_index': i,
                    'total_chunks': len(chunks)
                }
                
                documents.append(chunk)
                metadatas.append(chunk_metadata)
                ids.append(str(uuid.uuid4()))
            
            # Store in ChromaDB
            await self.chromadb_service.add_documents(documents, metadatas, ids)
            
            print(f"✅ Processed document with {len(chunks)} chunks")
            
        except Exception as e:
            print(f"Error processing document: {e}")
            raise