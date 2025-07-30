import PyPDF2
from pathlib import Path
from config.settings import settings

class DocumentService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    async def extract_text_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            raise
    
    async def extract_text_from_txt(self, file_path: Path) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"Error extracting text from TXT: {e}")
            raise
    
    async def extract_text(self, file_path: str) -> str:
        """Extract text based on file extension"""
        # Convert string to Path object
        path = Path(file_path)
        suffix = path.suffix.lower()
        
        if suffix == '.pdf':
            return await self.extract_text_from_pdf(path)
        elif suffix == '.txt':
            return await self.extract_text_from_txt(path)
        else:
            raise ValueError(f"Unsupported file type: {suffix}. Only PDF and TXT are supported.")