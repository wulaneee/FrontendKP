'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatHistory {
  id: number;
  title: string;
  date: Date;
  messages: Message[]; // Updated interface
}

// Helper function for chat time grouping
const getChatTimeGroup = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hari ini';
  if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return date.toLocaleDateString(); // Return formatted date for older chats
};

export default function Chatbot() {
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hallo, ada yang bisa saya bantu?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/masuk');
    }
  }, [router]);

  // Load chat history
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.email) {
      const savedHistory = JSON.parse(localStorage.getItem(`chatHistory_${currentUser.email}`) || '[]');
      
      setChatHistory(savedHistory);
    }
  }, []); 

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Generate bot response based on user input
    let botResponse = "Maaf, saya tidak mengerti pertanyaan anda.";
    const lowercaseInput = inputMessage.toLowerCase();

    if (lowercaseInput.includes('sakit kepala')) {
      botResponse = `Halo! Sakit kepala sebelah atau yang sering dikenal sebagai migrain, dapat disebabkan oleh berbagai faktor. Berikut beberapa kemungkinan penyebabnya:
1. Stres atau tekanan emosional.
2. Kurang tidur atau pola tidur yang tidak teratur.
3. Dehidrasi (kurang minum air putih).
4. Konsumsi makanan atau minuman tertentu, seperti cokelat, makanan dengan MSG, keju, atau kopi berlebihan.
5. Perubahan hormon, terutama pada wanita, misalnya saat menstruasi atau penggunaan pil KB.
6. Paparan cahaya yang terang atau suara yang terlalu keras.
7. Kelelahan fisik atau kurang olahraga.
8. Faktor genetik, jika ada riwayat migrain dalam keluarga.`;
    }

    // Add bot response with delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      }]);
    }, 1000);

    setInputMessage('');
  };

  // Updated startNewChat function
  const startNewChat = () => {
    if (messages.length > 1) {
      const firstUserMessage = messages.find(m => m.isUser);
      if (firstUserMessage) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email;
        
        const existingHistory = JSON.parse(localStorage.getItem(`chatHistory_${userEmail}`) || '[]');
        
        const newHistory: ChatHistory = {
          id: existingHistory.length + 1,
          title: firstUserMessage.content,
          date: firstUserMessage.timestamp,
          messages: [...messages] // Save entire message history
        };
        
        const updatedHistory = [newHistory, ...existingHistory];
        
        localStorage.setItem(`chatHistory_${userEmail}`, JSON.stringify(updatedHistory));
        setChatHistory(updatedHistory);
      }
    }
    // Reset to initial state
    setMessages([{
      id: 1,
      content: "Hallo, ada yang bisa saya bantu?",
      isUser: false,
      timestamp: new Date()
    }]);
    setSelectedChat(null);
  };

  // New loadChat function
  const loadChat = (chat: ChatHistory) => {
    setSelectedChat(chat);
    setMessages(chat.messages);
  };

  const handleLogout = () => {
    // Hapus data login saja, biarkan history tetap ada
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Reset state
    setMessages([{
      id: 1,
      content: "Hallo, ada yang bisa saya bantu?",
      isUser: false,
      timestamp: new Date()
    }]);
    setChatHistory([]);
    
    // Redirect ke landing page
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* History Toggle Button - Di luar sidebar */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-2 left-4 p-2 hover:bg-white/50 rounded-full z-20"
      >
        <Image src="/img/history.png" alt="Toggle History" width={30} height={30} />
      </button>

      {/* Sidebar */}
      <div 
        className={`${
          showSidebar ? 'w-64' : 'w-0'
        } bg-[#ACC8E5] transition-all duration-300 overflow-hidden flex flex-col relative`}
      >
        <div className="p-4 flex flex-col space-y-20 mt-12 absolute w-64">
          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="flex items-center space-x-2 w-full px-1 py-1 bg-transparent rounded-lg hover:bg-white/50 transition-colors mt-15"
          >
            <Image src="/img/logo.png" alt="New Chat" width={35} height={35} />
            <span className="text-[#1E2A39]">Obrolan baru</span>
          </button>

          {/* History Sections */}
          <div className="space-y-4 px-4">
            {Object.entries(
              chatHistory.reduce((groups, chat) => {
                const group = getChatTimeGroup(new Date(chat.date));
                if (!groups[group]) groups[group] = [];
                groups[group].push(chat);
                return groups;
              }, {} as Record<string, ChatHistory[]>)
            ).map(([timeGroup, chats]) => (
              <div key={timeGroup}>
                <h3 className="text-[#4A5567] font-medium mb-2">{timeGroup}</h3>
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className={`py-2 hover:bg-white rounded-lg cursor-pointer text-sm ${
                      selectedChat?.id === chat.id ? 'bg-white/50' : ''
                    }`}
                  >
                    {chat.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-end px-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <Image src="/img/logologin.png" alt="User" width={37} height={37} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => router.push('/infoakun')}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full"
                >
                  <Image src="/img/akun.png" alt="Account" width={20} height={20} />
                  <span>Akun saya</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full"
                >
                  <Image src="/img/out.png" alt="Logout" width={20} height={20} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              {!message.isUser && (
                <div className="mr-2 flex-shrink-0">
                  <div className="p-1 bg-[#ACC8E5] rounded-full">
                    <Image src="/img/logo.png" alt="Bot" width={32} height={32} />
                  </div>
                </div>
              )}
              <div
                className={`
                  relative max-w-[70%] px-4 py-2
                  ${message.isUser ? 
                    'bg-[#ACC8E5] text-[#1E2A39] rounded-[20px] rounded-tr-[5px]' : 
                    'bg-white border border-[#ACC8E5] text-[#1E2A39] rounded-[20px] rounded-tl-[5px]'
                  }
                  ${message.isUser ? 'bubble-right' : 'bubble-left'}
                `}
              >
                <div className="whitespace-pre-line">{message.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 ml-12">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Kirim Pesan Untuk Konsultasi"
              className="flex-1 bg-transparent outline-none"
            />
            <button
              type="submit"
              className="p-2 hover:bg-[#ACC8E5] rounded-full transition-colors"
            >
              <Image src="/img/send.png" alt="Send" width={35} height={35} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}