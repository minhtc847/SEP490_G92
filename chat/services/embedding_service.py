from services.openai_service import OpenAIService
from services.chromadb_service import ChromaDBService
from utils.text_utils import chunk_text
import uuid

class EmbeddingService:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.chromadb_service = ChromaDBService()
    
    async def process_document(self, text: str, metadata: dict) -> None:
        """Process document: chunk, embed, and store"""
        try:
            # Chunk the text
            chunks = chunk_text(text, chunk_size=1000, overlap=200)
            
            # Generate embeddings for each chunk
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                embedding = await self.openai_service.generate_embedding(chunk)
                
                chunk_metadata = {
                    **metadata,
                    'chunk_index': i,
                    'total_chunks': len(chunks)
                }
                
                documents.append(chunk)
                metadatas.append(chunk_metadata)
                ids.append(str(uuid.uuid4()))
            
            # Store in ChromaDB
            await self.chromadb_service.add_documents(documents, metadatas, ids)
            
            print(f"Processed document with {len(chunks)} chunks")
            
        except Exception as e:
            print(f"Error processing document: {e}")
            raise