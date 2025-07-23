import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
}

const LOCAL_STORAGE_KEY = 'chat_messages';

/**
 * ChatPage component: Giao diện chatbot chuyên nghiệp với danh sách conversation, khung chat, input gửi tin nhắn, lưu localStorage, loading, tự động scroll.
 */
const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load conversations khi mount
  useEffect(() => {
    axios.get('/api/conversations')
      .then(res => setConversations(res.data))
      .catch(() => setConversations([]));
  }, []);

  // Load messages khi chọn conversation
  useEffect(() => {
    if (!selectedConversation) return;
    const local = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${selectedConversation}`);
    if (local) {
      setMessages(JSON.parse(local));
    } else {
      axios.get(`/api/conversations/${selectedConversation}/messages`)
        .then(res => {
          setMessages(res.data);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_${selectedConversation}`, JSON.stringify(res.data));
        })
        .catch(() => setMessages([]));
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
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('/api/chat', { message: input, conversationId: selectedConversation });
      const botMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      // Xử lý lỗi nếu cần
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar conversations */}
      <div className="w-1/4 border-r bg-gray-50 flex flex-col">
        <div className="p-4 font-bold text-lg border-b">Conversations</div>
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
          {messages.map(msg => (
            <div key={msg.id} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm relative ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                {msg.content}
                <div className="text-[10px] text-gray-400 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="max-w-[70%] px-4 py-2 rounded-2xl shadow bg-white text-gray-400 animate-pulse">
                Đang trả lời...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="p-4 border-t bg-white flex items-center gap-2">
          <input
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading || !selectedConversation}
          />
          <button
            className="bg-blue-500 text-white px-5 py-2 rounded-full font-semibold disabled:opacity-50"
            onClick={handleSend}
            disabled={loading || !input.trim() || !selectedConversation}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 