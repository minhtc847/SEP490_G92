def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list:
    """
    Split text into chunks with overlap
    
    Args:
        text: Input text to chunk
        chunk_size: Maximum size of each chunk
        overlap: Number of characters to overlap between chunks
    
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # If this is not the first chunk, include overlap
        if start > 0:
            start = start - overlap
        
        # Extract the chunk
        chunk = text[start:end]
        chunks.append(chunk)
        
        # Move to next position
        start = end
    
    return chunks
