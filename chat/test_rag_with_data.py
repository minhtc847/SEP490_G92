#!/usr/bin/env python3
"""
Test RAG pipeline with real data
"""

import asyncio
from services.chat_service import ChatService

async def test_rag_with_data():
    """Test RAG pipeline with uploaded document"""
    
    print("🧪 Testing RAG Pipeline with Real Data...\n")
    
    chat_service = ChatService()
    
    # Test questions about factory rules
    test_questions = [
        "Cho tôi hỏi về nội quy của xưởng",
        "Quy định an toàn lao động như thế nào?",
        "Cần mặc đồ bảo hộ gì khi vào xưởng?",
        "Xử lý sự cố trong xưởng như thế nào?",
        "Quy trình sản xuất kính ra sao?"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"🔍 Test {i}: {question}")
        print("-" * 50)
        
        try:
            result = await chat_service.process_question_with_rag(question)
            
            print(f"✅ Method: {result['method']}")
            print(f"✅ Answer: {result['answer']}")
            print(f"✅ Sources: {len(result['sources'])} documents")
            
            if result['sources']:
                print("📚 Sources used:")
                for j, source in enumerate(result['sources'][:2], 1):  # Show first 2 sources
                    filename = source.metadata.get('filename', 'Unknown')
                    chunk_preview = source.chunk[:100] + "..." if len(source.chunk) > 100 else source.chunk
                    print(f"   {j}. {filename}: {chunk_preview}")
            
            print()
            
        except Exception as e:
            print(f"❌ Error: {e}")
            print()

async def main():
    """Main function"""
    print("🚀 RAG Pipeline Test with Real Data\n")
    
    await test_rag_with_data()
    
    print("🎉 RAG pipeline test completed!")

if __name__ == "__main__":
    asyncio.run(main()) 