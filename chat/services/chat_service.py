from typing import List
from models.schemas import Message
from services.openai_service import OpenAIService
from services.chromadb_service import ChromaDBService

class ChatService:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.chromadb_service = ChromaDBService()
    
    async def process_message(self, message: str, history: List[Message] = None) -> str:
        """Process chat message and return response"""
        try:
            # Search for relevant documents
            similar_docs = await self.chromadb_service.search_similar(message, n_results=3)
            
            # Build context from similar documents
            context = ""
            if similar_docs:
                context = "\n\n".join([doc['document'] for doc in similar_docs])
            
            # Convert history to OpenAI format
            messages = []
            if history:
                for msg in history:
                    messages.append({
                        "role": "user" if msg.sender == "user" else "assistant",
                        "content": msg.content
                    })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Generate response
            response = await self.openai_service.generate_response(messages, context)
            
            return response
            
        except Exception as e:
            print(f"Error processing message: {e}")
            return "Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau."
