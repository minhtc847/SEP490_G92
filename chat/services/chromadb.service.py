import uuid
import datetime
from chromadb import Client
from chromadb.config import Settings

class ChromaDBService:
    def __init__(self):
        self.client = Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory="path/to/chromadb"))

    async def add_message(self, conversation_id, content, role):
        collection = self.client.get_or_create_collection(conversation_id)
        msg_id = str(uuid.uuid4())
        created_at = datetime.datetime.utcnow().isoformat()
        message = {
            "id": msg_id,
            "role": role,
            "content": content,
            "createdAt": created_at,
            "conversationId": conversation_id
        }
        collection.add(documents=[message], metadatas=[{"source": "chat"}], ids=[msg_id])
        return message

    async def get_messages(self, conversation_id):
        collection = self.client.get_or_create_collection(conversation_id)
        docs = collection.get_all()
        # Giả sử docs là list[dict]
        return docs

    async def get_conversations(self, user_id=None):
        # Giả sử mỗi conversation là một collection, chỉ demo trả về list các collection
        collections = self.client.list_collections()
        # Nếu có user_id thì filter theo metadata (cần lưu user_id khi tạo conversation)
        return [{"id": c.name, "title": c.name} for c in collections]

# Singleton instance
chromadb_service = ChromaDBService()

add_message = chromadb_service.add_message
get_messages = chromadb_service.get_messages
get_conversations = chromadb_service.get_conversations