from typing import List, Dict, Any
from models.schemas import Message, Source
from services.openai_service import OpenAIService
from services.chromadb_service import ChromaDBService

class ChatService:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.chromadb_service = ChromaDBService()
    
    async def process_question_with_rag(self, question: str) -> Dict[str, Any]:
        """
        Process question through intelligent pipeline:
        1. Classify question type (simple vs complex)
        2. For simple questions: Use GPT directly
        3. For complex questions: Use RAG pipeline
        """
        try:
            # Step 1: Classify question type
            question_type = await self._classify_question(question)
            
            if question_type == "simple":
                # Use GPT directly for simple questions
                print(f"Simple question detected: {question[:100]}...")
                answer = await self._generate_simple_response(question)
                return {
                    "answer": answer,
                    "sources": [],
                    "method": "direct_gpt"
                }
            else:
                # Use RAG for complex questions
                print(f"Complex question detected: {question[:100]}...")
                return await self._process_rag_pipeline(question)
                
        except Exception as e:
            print(f"Error in question processing: {e}")
            # Fallback to simple response
            try:
                answer = await self._generate_simple_response(question)
                return {
                    "answer": answer,
                    "sources": [],
                    "method": "fallback"
                }
            except:
                return {
                    "answer": "Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
                    "sources": [],
                    "method": "error"
                }
    
    async def _classify_question(self, question: str) -> str:
        """
        Classify question as simple or complex using GPT-4
        """
        try:
            classification_prompt = f"""
            Phân loại câu hỏi sau đây:
            Câu hỏi: "{question}"
            
            Phân loại thành:
            - "simple": Câu hỏi chào hỏi, hỏi thăm, yêu cầu đơn giản, không cần kiến thức chuyên môn
            - "complex": Câu hỏi về kiến thức, thông tin, dữ liệu, yêu cầu tìm hiểu sâu, cần tham khảo tài liệu
            
            Chỉ trả về "simple" hoặc "complex".
            """
            
            response = await self.openai_service.generate_response(
                messages=[{"role": "user", "content": classification_prompt}]
            )
            
            # Clean response
            response = response.strip().lower()
            if "simple" in response:
                return "simple"
            elif "complex" in response:
                return "complex"
            else:
                # Default to complex if unclear
                return "complex"
                
        except Exception as e:
            print(f"Error classifying question: {e}")
            # Default to complex for safety
            return "complex"
    
    async def _generate_simple_response(self, question: str) -> str:
        """
        Generate response for simple questions using GPT directly
        """
        try:
            simple_prompt = f"""
            Bạn là một trợ lý AI thân thiện. Hãy trả lời câu hỏi sau một cách tự nhiên và hữu ích:
            
            Câu hỏi: {question}
            
            Hướng dẫn:
            - Trả lời bằng tiếng Việt
            - Thân thiện và tự nhiên
            - Nếu là câu chào hỏi, hãy chào lại và giới thiệu khả năng của bạn
            - Nếu là câu hỏi đơn giản, hãy trả lời ngắn gọn và rõ ràng
            """
            
            response = await self.openai_service.generate_response(
                messages=[{"role": "user", "content": simple_prompt}]
            )
            
            return response
            
        except Exception as e:
            print(f"Error generating simple response: {e}")
            return "Xin chào! Tôi là trợ lý AI, có thể giúp bạn trả lời các câu hỏi về tài liệu và kiến thức."
    
    async def _process_rag_pipeline(self, question: str) -> Dict[str, Any]:
        """
        Process complex question through RAG pipeline
        """
        try:
            # Step 1: Generate embedding for the question
            print(f"Generating embedding for complex question: {question[:100]}...")
            question_embedding = await self.openai_service.generate_embedding(question)
            
            # Step 2: Query ChromaDB for relevant chunks
            print("Querying ChromaDB for relevant chunks...")
            search_results = await self.chromadb_service.search_documents(
                query_embeddings=[question_embedding],
                n_results=10
            )
            
            if not search_results or not search_results[0]:
                # No relevant documents found, fallback to simple response
                print("No relevant documents found, using fallback response")
                answer = await self._generate_fallback_response(question)
                return {
                    "answer": answer,
                    "sources": [],
                    "method": "no_documents"
                }
            
            # Step 3: Use GPT-4 to evaluate and select most relevant chunks
            print("Evaluating relevance of chunks...")
            relevant_chunks = await self._evaluate_chunk_relevance(question, search_results[0])
            
            # Step 4: Generate answer using selected chunks as context
            print("Generating answer with context...")
            context = self._build_context(relevant_chunks)
            answer = await self._generate_answer(question, context)
            
            # Prepare sources for response
            sources = []
            for chunk_data in relevant_chunks:
                source = Source(
                    chunk=chunk_data["chunk"],
                    metadata=chunk_data["metadata"],
                    relevance_score=chunk_data.get("relevance_score")
                )
                sources.append(source)
            
            return {
                "answer": answer,
                "sources": sources,
                "method": "rag"
            }
            
        except Exception as e:
            print(f"Error in RAG pipeline: {e}")
            # Fallback to simple response
            answer = await self._generate_fallback_response(question)
            return {
                "answer": answer,
                "sources": [],
                "method": "rag_error"
            }
    
    async def _generate_fallback_response(self, question: str) -> str:
        """
        Generate fallback response when RAG fails
        """
        try:
            fallback_prompt = f"""
            Bạn là trợ lý AI. Người dùng hỏi: "{question}"
            
            Trả lời một cách hữu ích và cho biết rằng bạn có thể tìm kiếm thông tin chi tiết hơn nếu họ upload tài liệu liên quan.
            """
            
            response = await self.openai_service.generate_response(
                messages=[{"role": "user", "content": fallback_prompt}]
            )
            
            return response
            
        except Exception as e:
            print(f"Error generating fallback response: {e}")
            return "Tôi hiểu câu hỏi của bạn. Để có thể trả lời chi tiết và chính xác hơn, bạn có thể upload các tài liệu liên quan vào hệ thống."
    
    async def _evaluate_chunk_relevance(self, question: str, search_results: List[Dict]) -> List[Dict]:
        """
        Use GPT-4 to evaluate relevance of chunks and select the most relevant ones
        while keeping total tokens under 3000
        """
        try:
            # Prepare chunks for evaluation
            chunks_text = ""
            for i, result in enumerate(search_results):
                chunk_text = result.get("document", "")[:500]  # Limit chunk length for evaluation
                chunks_text += f"\n--- Chunk {i+1} ---\n{chunk_text}\n"
            
            # Create evaluation prompt
            evaluation_prompt = f"""
            Câu hỏi: {question}
            
            Các đoạn văn bản từ cơ sở dữ liệu:
            {chunks_text}
            
            Hãy đánh giá mức độ liên quan của từng đoạn với câu hỏi và chọn những đoạn thực sự liên quan nhất.
            Trả về danh sách các số thứ tự của đoạn liên quan (ví dụ: 1,3,5) và tổng số token ước tính.
            Chỉ chọn những đoạn thực sự cần thiết để trả lời câu hỏi, giữ tổng token dưới 3000.
            """
            
            # Get evaluation from GPT-4
            evaluation_response = await self.openai_service.generate_response(
                messages=[{"role": "user", "content": evaluation_prompt}]
            )
            
            # Parse evaluation response (simple parsing for now)
            selected_indices = self._parse_evaluation_response(evaluation_response)
            
            # Select relevant chunks
            relevant_chunks = []
            total_tokens = 0
            max_tokens = 3000
            
            for idx in selected_indices:
                if idx < len(search_results):
                    chunk_data = search_results[idx]
                    chunk_text = chunk_data.get("document", "")
                    estimated_tokens = len(chunk_text.split()) * 1.3  # Rough estimation
                    
                    if total_tokens + estimated_tokens <= max_tokens:
                        relevant_chunks.append({
                            "chunk": chunk_text,
                            "metadata": chunk_data.get("metadata", {}),
                            "relevance_score": chunk_data.get("distance", 0)
                        })
                        total_tokens += estimated_tokens
                    else:
                        break
            
            return relevant_chunks
            
        except Exception as e:
            print(f"Error evaluating chunk relevance: {e}")
            # Fallback: return first few chunks
            return search_results[:3]
    
    def _parse_evaluation_response(self, response: str) -> List[int]:
        """
        Parse GPT-4 evaluation response to extract selected chunk indices
        """
        try:
            # Simple parsing - look for numbers in the response
            import re
            numbers = re.findall(r'\d+', response)
            indices = []
            for num in numbers:
                idx = int(num) - 1  # Convert to 0-based index
                if 0 <= idx <= 9:  # Valid range for top 10 results
                    indices.append(idx)
            return list(set(indices))  # Remove duplicates
        except:
            # Fallback: return first 3 chunks
            return [0, 1, 2]
    
    def _build_context(self, relevant_chunks: List[Dict]) -> str:
        """
        Build context string from relevant chunks
        """
        context_parts = []
        for i, chunk_data in enumerate(relevant_chunks):
            chunk_text = chunk_data["chunk"]
            metadata = chunk_data.get("metadata", {})
            source_info = f"[Nguồn: {metadata.get('filename', 'Unknown')}]"
            context_parts.append(f"Đoạn {i+1} {source_info}:\n{chunk_text}\n")
        
        return "\n".join(context_parts)
    
    async def _generate_answer(self, question: str, context: str) -> str:
        """
        Generate answer using GPT-4 with context
        """
        try:
            prompt = f"""
            Dựa trên thông tin sau đây, hãy trả lời câu hỏi một cách chính xác và hữu ích:
            
            Thông tin tham khảo:
            {context}
            
            Câu hỏi: {question}
            
            Hướng dẫn:
            - Chỉ sử dụng thông tin từ các đoạn văn bản được cung cấp
            - Nếu thông tin không đủ, hãy nói rõ điều đó
            - Trả lời bằng tiếng Việt
            - Cung cấp câu trả lời chi tiết và có cấu trúc
            """
            
            answer = await self.openai_service.generate_response(
                messages=[{"role": "user", "content": prompt}]
            )
            
            return answer
            
        except Exception as e:
            print(f"Error generating answer: {e}")
            return "Xin lỗi, tôi không thể tạo câu trả lời lúc này. Vui lòng thử lại sau."
    
    async def process_message(self, message: str, history: List[Message] = None) -> str:
        """
        Legacy method for backward compatibility
        """
        result = await self.process_question_with_rag(message)
        return result["answer"]
