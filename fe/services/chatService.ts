import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:7075/api';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Source {
  chunk: string;
  metadata: Record<string, any>;
  relevance_score?: number;
}

export interface ChatRequest {
  question: string;
  history?: Message[];
}

export interface ChatResponse {
  response: string;
  sources?: Source[];
  status: string;
  method?: string; // "direct_gpt", "rag", "fallback", "error", "no_documents"
}

class ChatService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async sendMessage(question: string, history: Message[] = []): Promise<ChatResponse> {
    try {
      const request: ChatRequest = {
        question,
        history,
      };

      const response = await this.api.post<ChatResponse>('/chat/', request);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async sendMessageStream(question: string, history: Message[] = []): Promise<ChatResponse> {
    try {
      const request: ChatRequest = {
        question,
        history,
      };

      const response = await this.api.post<ChatResponse>('/chat/stream', request);
      return response.data;
    } catch (error) {
      console.error('Error sending message stream:', error);
      throw new Error('Failed to send message stream');
    }
  }
}

export const chatService = new ChatService();
export default chatService; 