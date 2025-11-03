'use client'
import React from 'react';
import ChatPage from '@/components/VNG/chat/ChatPage';
import { usePathname } from 'next/navigation';


/**
 * Trang Chat với sidebar navigation và ChatPage
 */
const ChatScreen: React.FC = () => {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Main Chat Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          <ChatPage />
        </div>
      </main>
    </div>
  );
};

export default ChatScreen; 