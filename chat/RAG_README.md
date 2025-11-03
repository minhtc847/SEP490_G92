# 🤖 Hệ thống Chat RAG (Retrieval-Augmented Generation)

## 📋 Tổng quan

Hệ thống chat RAG sử dụng OpenAI GPT-4 và ChromaDB để tạo câu trả lời thông minh dựa trên tài liệu đã được upload. Hệ thống thực hiện các bước sau:

1. **Tạo embedding** cho câu hỏi của người dùng
2. **Truy vấn ChromaDB** để tìm top 10 chunk liên quan
3. **Đánh giá relevance** bằng GPT-4 và chọn chunk phù hợp (dưới 3000 token)
4. **Tạo câu trả lời** dựa trên context được chọn

## 🚀 Cách sử dụng

### 1. Khởi động Backend

```bash
cd chat
python main.py
```

Backend sẽ chạy tại: `http://localhost:8000`

### 2. Khởi động Frontend

```bash
cd fe
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### 3. Upload tài liệu

1. Truy cập trang **Materials** trong ứng dụng
2. Click **"Thêm tài liệu"**
3. Upload file PDF hoặc TXT
4. Đợi quá trình xử lý hoàn tất (status: "ready")

### 4. Sử dụng Chat

1. Truy cập trang **Chat**
2. Nhập câu hỏi vào ô input
3. Hệ thống sẽ tự động tìm kiếm thông tin liên quan và trả lời
4. Click **"Xem chi tiết"** để xem nguồn tham khảo

## 🔧 API Endpoints

### Chat API

```http
POST /api/chat/
Content-Type: application/json

{
  "question": "Câu hỏi của bạn",
  "history": [
    {
      "role": "user",
      "content": "Câu hỏi trước",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "response": "Câu trả lời từ AI",
  "sources": [
    {
      "chunk": "Nội dung chunk",
      "metadata": {
        "filename": "document.pdf",
        "file_type": "pdf"
      },
      "relevance_score": 0.85
    }
  ],
  "status": "success"
}
```

### Document Management API

```http
# Upload document
POST /api/documents/upload
Content-Type: multipart/form-data

# Get all documents
GET /api/documents/

# Get document by ID
GET /api/documents/{id}

# Update document
PUT /api/documents/{id}

# Delete document
DELETE /api/documents/{id}
```

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   ChromaDB      │
│   (Next.js)     │◄──►│   Backend       │◄──►│   Vector Store  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MySQL         │
                       │   Document      │
                       │   Metadata      │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │   GPT-4 +       │
                       │   Embeddings    │
                       └─────────────────┘
```

## 📁 Cấu trúc thư mục

```
chat/
├── api/
│   ├── chat.py          # Chat API endpoints
│   ├── documents.py     # Document management API
│   └── health.py        # Health check
├── services/
│   ├── chat_service.py      # RAG logic
│   ├── openai_service.py    # OpenAI API integration
│   ├── chromadb_service.py  # ChromaDB operations
│   ├── document_service.py  # Document processing
│   └── mysql_service.py     # Database operations
├── models/
│   └── schemas.py       # Pydantic models
├── config/
│   └── settings.py      # Configuration
├── utils/
│   └── text_utils.py    # Text processing utilities
└── main.py              # FastAPI application
```

## ⚙️ Cấu hình

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
MYSQL_PORT=3307
MYSQL_DATABASE=vng_glass3
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# File Upload Configuration
UPLOAD_DIR=./data/documents
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.pdf,.txt

# API Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Chunking Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

## 🔍 Quy trình RAG

### 1. Tạo Embedding
- Sử dụng `text-embedding-3-small` để tạo vector cho câu hỏi
- Vector 1536 chiều được tạo ra

### 2. Truy vấn ChromaDB
- Tìm top 10 chunk có độ tương đồng cao nhất
- Sử dụng cosine similarity để so sánh vectors

### 3. Đánh giá Relevance
- GPT-4 đánh giá mức độ liên quan của từng chunk
- Chọn chunk phù hợp nhất (dưới 3000 token)
- Loại bỏ thông tin không liên quan

### 4. Tạo câu trả lời
- Sử dụng context được chọn làm prompt
- GPT-4 tạo câu trả lời chi tiết và có cấu trúc
- Trả về kèm theo nguồn tham khảo

## 🎯 Tính năng chính

- ✅ **Upload tài liệu** (PDF, TXT)
- ✅ **Chunking tự động** với overlap
- ✅ **Vector embedding** với OpenAI
- ✅ **Semantic search** với ChromaDB
- ✅ **Relevance evaluation** với GPT-4
- ✅ **Context-aware responses**
- ✅ **Source attribution**
- ✅ **Real-time chat interface**
- ✅ **Conversation management**
- ✅ **Local storage** cho chat history

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **"Unknown database"**
   - Kiểm tra cấu hình MySQL trong `.env`
   - Đảm bảo database đã được tạo

2. **"OpenAI API error"**
   - Kiểm tra `OPENAI_API_KEY` trong `.env`
   - Đảm bảo có đủ credit trong tài khoản OpenAI

3. **"ChromaDB connection error"**
   - Kiểm tra thư mục `./data/embeddings` có tồn tại
   - Restart ứng dụng

4. **"Module not found"**
   - Cài đặt dependencies: `pip install -r requirements.txt`
   - Xóa `__pycache__` và restart

### Debug mode

Thêm vào `.env`:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```

## 📈 Performance

- **Response time**: 2-5 giây (tùy thuộc vào độ phức tạp)
- **Max tokens**: 3000 cho context
- **Chunk size**: 1000 ký tự
- **Overlap**: 200 ký tự
- **Top results**: 10 chunks

## 🔮 Roadmap

- [ ] Streaming responses
- [ ] Multi-language support
- [ ] Advanced filtering
- [ ] Document versioning
- [ ] User authentication
- [ ] Conversation export
- [ ] Analytics dashboard 