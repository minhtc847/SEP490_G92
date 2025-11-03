import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any
from config.settings import settings

class ChromaDBService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self.collection = self._get_or_create_collection()
    
    def _get_or_create_collection(self):
        """Get existing collection or create new one with correct settings"""
        try:
            # Try to get existing collection
            collection = self.client.get_collection(name=self.collection_name)
            print(f"✅ Using existing collection: {self.collection_name}")
            return collection
        except:
            # Create new collection with correct settings for text-embedding-3-small
            print(f"🔄 Creating new collection: {self.collection_name}")
            collection = self.client.create_collection(
                name=self.collection_name,
                metadata={
                    "hnsw:space": "cosine",
                    "description": "Document embeddings for RAG pipeline"
                }
            )
            print(f"✅ Collection created successfully with cosine similarity")
            return collection
    
    async def add_documents(self, documents: List[str], metadatas: List[Dict], ids: List[str]):
        """Add documents to ChromaDB"""
        try:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"✅ Added {len(documents)} documents to ChromaDB")
        except Exception as e:
            print(f"Error adding documents to ChromaDB: {e}")
            raise
    
    async def search_documents(self, query_embeddings: List[List[float]], n_results: int = 10) -> List[List[Dict[str, Any]]]:
        """Search for documents using embeddings"""
        try:
            results = self.collection.query(
                query_embeddings=query_embeddings,
                n_results=n_results
            )
            
            documents = results['documents'][0]
            metadatas = results['metadatas'][0]
            distances = results['distances'][0]
            
            return [[
                {
                    'document': doc,
                    'metadata': meta,
                    'distance': dist
                }
                for doc, meta, dist in zip(documents, metadatas, distances)
            ]]
        except Exception as e:
            print(f"Error searching ChromaDB: {e}")
            raise
    
    async def search_similar(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents using text query"""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            documents = results['documents'][0]
            metadatas = results['metadatas'][0]
            distances = results['distances'][0]
            
            return [
                {
                    'document': doc,
                    'metadata': meta,
                    'distance': dist
                }
                for doc, meta, dist in zip(documents, metadatas, distances)
            ]
        except Exception as e:
            print(f"Error searching ChromaDB: {e}")
            raise
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Get collection information"""
        try:
            count = self.collection.count()
            return {
                "name": self.collection_name,
                "document_count": count,
                "embedding_function": "text-embedding-3-small (1536 dimensions)"
            }
        except Exception as e:
            print(f"Error getting collection info: {e}")
            return {"error": str(e)}