import mysql.connector
from mysql.connector import Error
from typing import List, Optional, Dict, Any
import json
from datetime import datetime
import os

class MySQLService:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Kết nối đến MySQL database"""
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('MYSQL_HOST', 'localhost'),
                database=os.getenv('MYSQL_DATABASE', 'sep490'),
                user=os.getenv('MYSQL_USER', 'root'),
                password=os.getenv('MYSQL_PASSWORD', ''),
                port=int(os.getenv('MYSQL_PORT', '3306'))
            )
            print("Connected to MySQL database")
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            raise
    
    def ensure_connection(self):
        """Đảm bảo kết nối còn hoạt động"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
    
    async def create_document_material(self, name: str, description: str, content: str, file_path: str = None) -> int:
        """Tạo document material mới"""
        try:
            self.ensure_connection()
            cursor = self.connection.cursor()
            
            query = """
                INSERT INTO document_materials (name, description, content, file_path, status, created_at, chunk_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (name, description, content, file_path, "pending", datetime.utcnow(), 0)
            
            cursor.execute(query, values)
            self.connection.commit()
            
            document_id = cursor.lastrowid
            cursor.close()
            
            return document_id
        except Error as e:
            print(f"Error creating document material: {e}")
            raise
    
    async def get_all_document_materials(self) -> List[Dict[str, Any]]:
        """Lấy tất cả document materials"""
        try:
            self.ensure_connection()
            cursor = self.connection.cursor(dictionary=True)
            
            query = "SELECT * FROM document_materials ORDER BY created_at DESC"
            cursor.execute(query)
            
            documents = cursor.fetchall()
            cursor.close()
            
            # Convert datetime objects to string for JSON serialization
            for doc in documents:
                if 'created_at' in doc and doc['created_at']:
                    doc['created_at'] = doc['created_at'].isoformat()
            
            return documents
        except Error as e:
            print(f"Error getting document materials: {e}")
            raise
    
    async def get_document_material_by_id(self, document_id: int) -> Optional[Dict[str, Any]]:
        """Lấy document material theo ID"""
        try:
            self.ensure_connection()
            cursor = self.connection.cursor(dictionary=True)
            
            query = "SELECT * FROM document_materials WHERE id = %s"
            cursor.execute(query, (document_id,))
            
            document = cursor.fetchone()
            cursor.close()
            
            if document and 'created_at' in document and document['created_at']:
                document['created_at'] = document['created_at'].isoformat()
            
            return document
        except Error as e:
            print(f"Error getting document material by ID: {e}")
            raise
    
    async def update_document_material(self, document_id: int, name: str = None, description: str = None, 
                                     content: str = None, file_path: str = None) -> bool:
        """Cập nhật document material"""
        try:
            self.ensure_connection()
            cursor = self.connection.cursor()
            
            # Build dynamic query
            update_parts = []
            values = []
            
            if name is not None:
                update_parts.append("name = %s")
                values.append(name)
            if description is not None:
                update_parts.append("description = %s")
                values.append(description)
            if content is not None:
                update_parts.append("content = %s")
                values.append(content)
            if file_path is not None:
                update_parts.append("file_path = %s")
                values.append(file_path)
            
            if not update_parts:
                return False
            
            values.append(document_id)
            query = f"UPDATE document_materials SET {', '.join(update_parts)} WHERE id = %s"
            
            cursor.execute(query, values)
            self.connection.commit()
            
            affected_rows = cursor.rowcount
            cursor.close()
            
            return affected_rows > 0
        except Error as e:
            print(f"Error updating document material: {e}")
            raise
    
    async def update_document_status(self, document_id: int, status: str) -> bool:
        """Cập nhật status của document material"""
        try:
            self.ensure_connection()
            cursor = self.connection.cursor()
            
            query = "UPDATE document_materials SET status = %s WHERE id = %s"
            cursor.execute(query, (status, document_id))
            self.connection.commit()
            
            affected_rows = cursor.rowcount
            cursor.close()
            
            return affected_rows > 0
        except Error as e:
            print(f"Error updating document status: {e}")
            raise
    
    async def update_document_chunk_count(self, document_id: int, chunk_count: int) -> bool:
        """Cập nhật chunk count của document material"""
        try:
            self.ensure_connection()
            cursor = self.connection.cursor()
            
            query = "UPDATE document_materials SET chunk_count = %s WHERE id = %s"
            cursor.execute(query, (chunk_count, document_id))
            self.connection.commit()
            
            affected_rows = cursor.rowcount
            cursor.close()
            
            return affected_rows > 0
        except Error as e:
            print(f"Error updating document chunk count: {e}")
            raise
    
    async def delete_document_material(self, document_id: int) -> bool:
        """Xóa document material"""
        try:
            self.ensure_connection()
            cursor = self.connection.cursor()
            
            query = "DELETE FROM document_materials WHERE id = %s"
            cursor.execute(query, (document_id,))
            self.connection.commit()
            
            affected_rows = cursor.rowcount
            cursor.close()
            
            return affected_rows > 0
        except Error as e:
            print(f"Error deleting document material: {e}")
            raise
    
    def close(self):
        """Đóng kết nối database"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection closed") 