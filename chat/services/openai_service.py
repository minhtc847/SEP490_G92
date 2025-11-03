from openai import OpenAI
from config.settings import settings

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.embedding_model = settings.OPENAI_EMBEDDING_MODEL
    
    async def generate_embedding(self, text: str) -> list:
        """Generate embedding for text"""
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            raise
    
    async def generate_response(self, messages: list, context: str = "") -> str:
        """Generate chat response"""
        try:
            system_prompt = f"""You are a helpful assistant. Use the following context to answer the user's question:
            Context: {context}
            
            If the context doesn't contain relevant information, say so politely."""
            
            messages_with_context = [{"role": "system", "content": system_prompt}] + messages
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages_with_context,
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating response: {e}")
            raise