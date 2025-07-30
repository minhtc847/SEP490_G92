# Chatbot Backend System

Hệ thống chatbot sử dụng OpenAI GPT-4 + ChromaDB + FastAPI để xử lý tài liệu và trả lời câu hỏi.

## Tính năng

- **Quản lý tài liệu**: Upload file PDF, TXT, DOCX hoặc nhập text trực tiếp
- **Xử lý tài liệu**: Trích xuất nội dung, chunk và tạo embeddings
- **Lưu trữ vector**: Sử dụng ChromaDB để lưu trữ embeddings
- **Tích hợp MySQL**: Lưu thông tin tài liệu vào database
- **API RESTful**: Giao diện API đầy đủ cho frontend

## Cài đặt

### 1. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 2. Cấu hình môi trường

Tạo file `.env` trong thư mục `chat/`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# ChromaDB Configuration
CHROMA_DB_PATH=./data/embeddings
CHROMA_COLLECTION_NAME=documents

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=sep490
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here

# File Upload Configuration
UPLOAD_DIR=./data/documents
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.pdf,.txt,.docx

# API Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Chunking Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

### 3. Tạo thư mục dữ liệu

```bash
mkdir -p data/documents data/embeddings data/temp
```

## Chạy ứng dụng

```bash
# Chạy trong development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Hoặc chạy trực tiếp
python main.py
```

## API Endpoints

### Documents Management

- `GET /api/documents/` - Lấy tất cả tài liệu
- `GET /api/documents/{id}` - Lấy tài liệu theo ID
- `POST /api/documents/upload` - Upload file tài liệu
- `POST /api/documents/text` - Tạo tài liệu từ text
- `PUT /api/documents/{id}` - Cập nhật tài liệu
- `DELETE /api/documents/{id}` - Xóa tài liệu
- `PATCH /api/documents/{id}/status` - Cập nhật trạng thái
- `PATCH /api/documents/{id}/chunk-count` - Cập nhật số chunk

### Chat

- `POST /api/chat/` - Gửi câu hỏi và nhận câu trả lời

### Health Check

- `GET /health` - Kiểm tra trạng thái hệ thống

## Cấu trúc Database

### DocumentMaterial Table

```sql
CREATE TABLE document_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content LONGTEXT NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    chunk_count INT DEFAULT 0
);
```

## Quy trình xử lý tài liệu

1. **Upload tài liệu**: Người dùng upload file hoặc nhập text
2. **Lưu vào MySQL**: Thông tin tài liệu được lưu vào database với status "pending"
3. **Trích xuất nội dung**: Nếu là file, trích xuất text từ file
4. **Cập nhật status**: Chuyển sang "syncing"
5. **Chunk và Embedding**: Chia nội dung thành chunks và tạo embeddings
6. **Lưu vào ChromaDB**: Lưu embeddings và metadata
7. **Cập nhật status**: Chuyển sang "ready" và cập nhật chunk count

## Trạng thái tài liệu

- `pending`: Tài liệu mới được tạo
- `syncing`: Đang xử lý và tạo embeddings
- `ready`: Đã sẵn sàng để sử dụng
- `error`: Có lỗi trong quá trình xử lý

## Frontend Integration

Frontend có thể sử dụng các API endpoints để:

- Hiển thị danh sách tài liệu
- Upload tài liệu mới
- Xóa tài liệu
- Cập nhật thông tin tài liệu
- Gửi câu hỏi và nhận câu trả lời

## Troubleshooting

### Lỗi kết nối MySQL
- Kiểm tra thông tin kết nối trong file `.env`
- Đảm bảo MySQL server đang chạy
- Kiểm tra quyền truy cập database

### Lỗi OpenAI API
- Kiểm tra API key trong file `.env`
- Đảm bảo có đủ credit trong tài khoản OpenAI

### Lỗi ChromaDB
- Kiểm tra đường dẫn `CHROMA_DB_PATH`
- Đảm bảo thư mục có quyền ghi

## Development

### Thêm tính năng mới

1. Tạo service mới trong thư mục `services/`
2. Tạo schema mới trong `models/schemas.py`
3. Tạo API endpoint trong `api/`
4. Cập nhật `app/__init__.py` để export

### Testing

```bash
# Chạy tests
pytest

# Chạy với coverage
pytest --cov=app
``` 