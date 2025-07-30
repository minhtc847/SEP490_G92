import chromadb
from chromadb.config import Settings as ChromaSettings
from config.settings import settings
from typing import List, Dict, Any

class ChromaDBService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME
        )
    
    async def add_documents(self, documents: List[str], metadatas: List[Dict], ids: List[str]):
        """Add documents to ChromaDB"""
        try:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"Added {len(documents)} documents to ChromaDB")
        except Exception as e:
            print(f"Error adding documents to ChromaDB: {e}")
            raise
    
    async def search_similar(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents"""
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