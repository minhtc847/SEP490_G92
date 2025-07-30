#!/usr/bin/env python3
"""
Script to upload sample document for testing RAG pipeline
"""

import asyncio
import os
from services.embedding_service import EmbeddingService
from services.mysql_service import MySQLService
from utils.text_utils import chunk_text

async def upload_sample_document():
    """Upload sample document to test RAG pipeline"""
    
    print("📄 Uploading sample document...")
    
    # File path
    file_path = "./sample_document.txt"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        # Initialize services
        embedding_service = EmbeddingService()
        mysql_service = MySQLService()
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"✅ File content loaded ({len(content)} characters)")
        
        # Save to MySQL first
        name = "Nội quy xưởng sản xuất kính VNG Glass"
        description = "Tài liệu nội quy xưởng sản xuất kính với các quy định về an toàn, kỷ luật và quy trình làm việc"
        
        # Insert into database
        document_id = await mysql_service.create_document_material(name, description, content, file_path)
        print(f"✅ Document saved to MySQL with ID: {document_id}")
        
        # Update status to syncing
        await mysql_service.update_document_status(document_id, "syncing")
        
        # Process with embedding service
        print("🔄 Processing document with embedding service...")
        await embedding_service.process_document(file_path, document_id)
        
        # Calculate chunk count
        chunks = chunk_text(content, chunk_size=1000, overlap=200)
        chunk_count = len(chunks)
        
        # Update chunk count and status to ready
        await mysql_service.update_document_chunk_count(document_id, chunk_count)
        await mysql_service.update_document_status(document_id, "ready")
        
        print("✅ Sample document uploaded and processed successfully!")
        print(f"📋 Document ID: {document_id}")
        print(f"📊 Chunk count: {chunk_count}")
        print("💡 You can now test RAG pipeline with questions about factory rules")
        
        return True
        
    except Exception as e:
        print(f"❌ Error uploading sample document: {e}")
        return False

async def main():
    """Main function"""
    print("🚀 Uploading Sample Document for RAG Testing...\n")
    
    success = await upload_sample_document()
    
    if success:
        print("\n🎉 Sample document uploaded successfully!")
        print("🧪 You can now test the RAG pipeline with questions like:")
        print("   - 'Cho tôi hỏi về nội quy của xưởng'")
        print("   - 'Quy định an toàn lao động như thế nào?'")
        print("   - 'Cần mặc đồ bảo hộ gì khi vào xưởng?'")
    else:
        print("\n💥 Failed to upload sample document!")

if __name__ == "__main__":
    asyncio.run(main()) 