#!/usr/bin/env python3
"""
Test script for RAG pipeline
"""

import asyncio
from services.chat_service import ChatService
from services.chromadb_service import ChromaDBService

async def test_simple_question():
    """Test simple question (should use direct GPT)"""
    print("🧪 Testing simple question...")
    
    chat_service = ChatService()
    
    # Test simple question
    question = "Xin chào"
    print(f"Question: {question}")
    
    try:
        result = await chat_service.process_question_with_rag(question)
        print(f"✅ Method: {result['method']}")
        print(f"✅ Answer: {result['answer'][:100]}...")
        print(f"✅ Sources count: {len(result['sources'])}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def test_complex_question():
    """Test complex question (should use RAG)"""
    print("\n🧪 Testing complex question...")
    
    chat_service = ChatService()
    
    # Test complex question
    question = "cho tôi hỏi về nội quy của xưởng"
    print(f"Question: {question}")
    
    try:
        result = await chat_service.process_question_with_rag(question)
        print(f"✅ Method: {result['method']}")
        print(f"✅ Answer: {result['answer'][:100]}...")
        print(f"✅ Sources count: {len(result['sources'])}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def test_chromadb_info():
    """Test ChromaDB collection info"""
    print("\n🧪 Testing ChromaDB info...")
    
    chromadb_service = ChromaDBService()
    
    try:
        info = chromadb_service.get_collection_info()
        print(f"✅ Collection info: {info}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting RAG Pipeline Tests...\n")
    
    # Test ChromaDB info
    chromadb_ok = await test_chromadb_info()
    
    # Test simple question
    simple_ok = await test_simple_question()
    
    # Test complex question
    complex_ok = await test_complex_question()
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST RESULTS:")
    print("="*50)
    print(f"ChromaDB Info: {'✅ PASS' if chromadb_ok else '❌ FAIL'}")
    print(f"Simple Question: {'✅ PASS' if simple_ok else '❌ FAIL'}")
    print(f"Complex Question: {'✅ PASS' if complex_ok else '❌ FAIL'}")
    
    if all([chromadb_ok, simple_ok, complex_ok]):
        print("\n🎉 All tests passed! RAG pipeline is working correctly.")
    else:
        print("\n💥 Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    asyncio.run(main()) 