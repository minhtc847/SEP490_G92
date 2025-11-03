import React, { useEffect, useRef, useState } from 'react';
import chatService, { Message, Source } from '@/services/chatService';
import SourceModal from './SourceModal';

interface ChatMessage extends Message {
  id: string;
  createdAt: string;
  sources?: Source[];
  method?: string;
}

interface Conversation {
  id: string;
  title: string;
}

const LOCAL_STORAGE_KEY = 'chat_messages';

/**
 * ChatPage component: Giao diện chatbot với intelligent question classification và RAG
 */
const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load conversations khi mount
  useEffect(() => {
    // Tạo conversation mặc định nếu chưa có
    if (conversations.length === 0) {
      const defaultConversation: Conversation = {
        id: 'default',
        title: 'Cuộc trò chuyện mới'
      };
      setConversations([defaultConversation]);
      setSelectedConversation('default');
    }
  }, [conversations.length]);

  // Load messages khi chọn conversation
  useEffect(() => {
    if (!selectedConversation) return;
    const local = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${selectedConversation}`);
    if (local) {
      setMessages(JSON.parse(local));
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  // Tự động scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Lưu messages vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (selectedConversation) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${selectedConversation}`, JSON.stringify(messages));
    }
  }, [messages, selectedConversation]);

  const handleSend = async () => {
    if (!input.trim() || loading || !selectedConversation) return;
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      // Chuyển đổi messages thành format cho API
      const history: Message[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt
      }));
      
      const response = await chatService.sendMessage(input, history);
      
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        createdAt: new Date().toISOString(),
        sources: response.sources,
        method: response.method
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: `Cuộc trò chuyện ${conversations.length + 1}`
    };
    setConversations(prev => [...prev, newConversation]);
    setSelectedConversation(newConversation.id);
    setMessages([]);
  };

  const handleViewSources = (sources: Source[]) => {
    setSelectedSources(sources);
    setIsSourceModalOpen(true);
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return null;
    
    const methodConfig = {
      'direct_gpt': { label: 'GPT Trực tiếp', color: 'bg-green-100 text-green-800' },
      'rag': { label: 'RAG', color: 'bg-blue-100 text-blue-800' },
      'fallback': { label: 'Fallback', color: 'bg-yellow-100 text-yellow-800' },
      'no_documents': { label: 'Không có tài liệu', color: 'bg-gray-100 text-gray-800' },
      'error': { label: 'Lỗi', color: 'bg-red-100 text-red-800' }
    };
    
    const config = methodConfig[method as keyof typeof methodConfig];
    if (!config) return null;
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const renderSources = (sources: Source[]) => {
    if (!sources || sources.length === 0) return null;
    
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <div className="text-xs font-semibold text-gray-600 mb-1 flex justify-between items-center">
          <span>Nguồn tham khảo ({sources.length})</span>
          <button
            onClick={() => handleViewSources(sources)}
            className="text-blue-500 hover:text-blue-700 text-xs underline"
          >
            Xem chi tiết
          </button>
        </div>
        {sources.slice(0, 2).map((source, index) => (
          <div key={index} className="text-xs text-gray-500 mb-1">
            <div className="font-medium">
              {source.metadata?.filename || 'Tài liệu không xác định'}
            </div>
            <div className="text-gray-400 truncate">
              {source.chunk.substring(0, 80)}...
            </div>
          </div>
        ))}
        {sources.length > 2 && (
          <div className="text-xs text-gray-400">
            ... và {sources.length - 2} nguồn khác
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Sidebar conversations */}
        <div className="w-1/4 border-r bg-gray-50 flex flex-col">
          <div className="p-4 font-bold text-lg border-b flex justify-between items-center">
            <span>Cuộc trò chuyện</span>
            <button
              onClick={createNewConversation}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              +
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`p-4 cursor-pointer hover:bg-gray-200 ${selectedConversation === conv.id ? 'bg-gray-200 font-semibold' : ''}`}
                onClick={() => setSelectedConversation(conv.id)}
              >
                {conv.title}
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-2xl mb-2">🤖</div>
                <div>Chào bạn! Tôi là trợ lý AI thông minh.</div>
                <div className="text-sm mt-2">
                  • Câu hỏi đơn giản: Tôi sẽ trả lời trực tiếp<br/>
                  • Câu hỏi chuyên sâu: Tôi sẽ tìm kiếm trong tài liệu của bạn
                </div>
                <div className="text-sm mt-2">Hãy bắt đầu cuộc trò chuyện!</div>
              </div>
            )}
            
            {messages.map(msg => (
              <div key={msg.id} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm relative ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.sources && renderSources(msg.sources)}
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {msg.method && msg.role === 'assistant' && (
                      <div className="text-[10px]">
                        {getMethodBadge(msg.method)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="max-w-[70%] px-4 py-2 rounded-2xl shadow bg-white text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Đang phân tích câu hỏi và tìm kiếm thông tin...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t bg-white flex items-center gap-2">
            <textarea
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={1}
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button
              className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-600"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? 'Đang xử lý...' : 'Gửi'}
            </button>
          </div>
        </div>
      </div>

      {/* Source Modal */}
      <SourceModal
        sources={selectedSources}
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
      />
    </>
  );
};

export default ChatPage; 