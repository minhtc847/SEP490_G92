#!/usr/bin/env python3
"""
Script to reset ChromaDB collection with correct embedding dimensions
"""

import chromadb
from chromadb.config import Settings
import os

def reset_chromadb():
    """Reset ChromaDB collection with correct embedding dimensions"""
    
    # ChromaDB path
    chroma_path = "./data/embeddings"
    
    try:
        # Create client
        client = chromadb.PersistentClient(path=chroma_path)
        
        # Delete existing collection if it exists
        try:
            client.delete_collection("documents")
            print("✅ Existing collection 'documents' deleted")
        except:
            print("ℹ️  No existing collection to delete")
        
        # Create new collection with correct embedding function
        # text-embedding-3-small has 1536 dimensions
        collection = client.create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )
        
        print("✅ New collection 'documents' created successfully")
        print(f"📁 ChromaDB path: {os.path.abspath(chroma_path)}")
        print("🔧 Ready for text-embedding-3-small (1536 dimensions)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error resetting ChromaDB: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Resetting ChromaDB collection...")
    success = reset_chromadb()
    
    if success:
        print("\n🎉 ChromaDB reset completed successfully!")
        print("💡 You can now upload documents and they will work with the RAG pipeline.")
    else:
        print("\n💥 ChromaDB reset failed!") 