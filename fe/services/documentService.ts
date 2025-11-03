import axios from '../setup/axios';

export interface DocumentMaterial {
  id: number;
  name: string;
  description?: string;
  content: string;
  file_path?: string;
  status: string;
  created_at: string;
  chunk_count: number;
}

export interface CreateDocumentRequest {
  name: string;
  description?: string;
  content: string;
  file_path?: string;
}

export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  content?: string;
  file_path?: string;
}

export interface UploadDocumentRequest {
  file: File;
  name: string;
  description?: string;
}

export interface UploadResponse {
  message: string;
  filename: string;
  document_id?: number;
}

class DocumentService {
  private baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/documents` : 'https://localhost:7075/api/documents';

  // Get all documents
  async getAllDocuments(): Promise<DocumentMaterial[]> {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  // Get document by ID
  async getDocumentById(id: number): Promise<DocumentMaterial> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  // Create document from text
  async createDocumentFromText(data: CreateDocumentRequest): Promise<UploadResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/text`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Upload document file
  async uploadDocument(data: UploadDocumentRequest): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await axios.post(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Update document
  async updateDocument(id: number, data: UpdateDocumentRequest): Promise<DocumentMaterial> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Update document status
  async updateDocumentStatus(id: number, status: string): Promise<void> {
    try {
      await axios.patch(`${this.baseUrl}/${id}/status`, { status });
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  }

  // Update document chunk count
  async updateDocumentChunkCount(id: number, chunkCount: number): Promise<void> {
    try {
      await axios.patch(`${this.baseUrl}/${id}/chunk-count`, { chunk_count: chunkCount });
    } catch (error) {
      console.error('Error updating document chunk count:', error);
      throw error;
    }
  }
}

export default new DocumentService(); 