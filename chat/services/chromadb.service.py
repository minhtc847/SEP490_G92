from chromadb import Client
from chromadb.config import Settings

class ChromaDBService:
    def __init__(self):
        self.client = Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory="path/to/chromadb"))

    def add_message(self, collection_name, message):
        collection = self.client.get_or_create_collection(collection_name)
        collection.add(documents=[message], metadatas=[{"source": "chat"}])

    def update_message(self, collection_name, message_id, new_message):
        collection = self.client.get_collection(collection_name)
        collection.update(ids=[message_id], documents=[new_message])

    def delete_message(self, collection_name, message_id):
        collection = self.client.get_collection(collection_name)
        collection.delete(ids=[message_id])

    def get_messages(self, collection_name):
        collection = self.client.get_collection(collection_name)
        return collection.get_all()  # Assuming this returns all messages in the collection

    def search_messages(self, collection_name, query):
        collection = self.client.get_collection(collection_name)
        return collection.query(query=query)  # Assuming this performs a search based on the query