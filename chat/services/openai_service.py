import openai
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv


# Tải biến môi trường
load_dotenv()


# Khởi tạo LLM và parser (parser có thể là output string nếu chỉ cần trả lời text)
llm = ChatOpenAI(model="gpt-4.1-nano", temperature=0.0)

# Prompt template mới cho RAG
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
Bạn là một trợ lý thân thiện giúp trả lời các câu hỏi của người dùng dựa trên tài liệu nội bộ được cung cấp.

**Hướng dẫn**:
- Trả lời dựa trên nội dung tài liệu được trích xuất bên dưới (`context`).
- Nếu câu hỏi không thể được trả lời từ tài liệu, trả lời: "Tôi không tìm thấy thông tin trong tài liệu để trả lời câu hỏi này."
- Luôn trả lời bằng tiếng Việt.
- Trả lời chính xác, ngắn gọn, dễ hiểu, đúng theo dữ kiện tài liệu.

**Dữ liệu nội bộ**:
{context}
"""
        ),
        ("human", "Câu hỏi: {question}"),
        # ("placeholder", "{agent_scratchpad}"),
    ]
)
def update_chat_history(chat_id, message):
    # Function to update chat history in the database
    pass

def delete_chat_history(chat_id):
    # Function to delete chat history from the database
    pass

def get_chat_history(chat_id):
    # Function to retrieve chat history from the database
    pass