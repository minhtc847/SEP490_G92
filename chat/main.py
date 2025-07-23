from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.chat import router as chat_router
from api.documents import router as documents_router

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(documents_router, prefix="/documents", tags=["documents"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Chat RAG Server!"}