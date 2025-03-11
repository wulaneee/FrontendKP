"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  chatBotApi,
  diagnoseApi,
  checkSymptoms,
  initializeChat,
  clearChatHistory,
} from "@/app/api/chatbot";

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
  messages: Message[];
}

// Helper function for chat time grouping
const getChatTimeGroup = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hari ini";
  if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
  return date.toLocaleDateString(); // Return formatted date for older chats
};

export default function Chatbot() {
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Memuat pesan...",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [userData, setUserData] = useState<{
    name: string;
    age: string | null;
    weight: string | null;
    height: string | null;
    description: string;
  }>({
    name: "Unknown",
    age: null,
    weight: null,
    height: null,
    description: "-",
  });

  const [userEmail, setUserEmail] = useState<string>("");
  const [gejala, setGejala] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [isDiagnosis, setIsDiagnosis] = useState<boolean>(false);
  const [symptomDialogComplete, setSymptomDialogComplete] =
    useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");

  const addGejala = (newGejala: string) => {
    if (!gejala.includes(newGejala)) {
      setGejala((prev) => [...prev, newGejala]);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUser = localStorage.getItem("currentUser");
    if (!isLoggedIn) {
      router.push("/masuk");
    }
    if (currentUser) {
      const user = JSON.parse(currentUser);
      const savedInfo = localStorage.getItem(`infoAnda_${user.email}`);
      const info = savedInfo ? JSON.parse(savedInfo) : {};
      setUserEmail(user.email);

      setUserData({
        name: user?.username || "Unknown",
        age: info?.usia || null,
        weight: info?.bb || null,
        height: info?.tb || null,
        description: "-",
      });
    }
  }, [router]);

  // Initialize chat when user data is loaded
  useEffect(() => {
    if (!userData.name || !userEmail) return; // Wait until userData is set

    const fetchInitialMessage = async () => {
      try {
        const response = await initializeChat({
          session_id: userEmail,
          context: JSON.stringify(userData),
        });

        const message = response.data.message;

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === 1 ? { ...msg, content: message } : msg
          )
        );
      } catch (error) {
        console.error("Error fetching initial message:", error);
      }
    };

    fetchInitialMessage();
  }, [userData, userEmail]);

  // Load chat history
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (currentUser.email) {
      const savedHistory = JSON.parse(
        localStorage.getItem(`chatHistory_${currentUser.email}`) || "[]"
      );

      setChatHistory(savedHistory);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    try {
      setIsProcessing(true);

      // Add user message
      const userQuery = inputMessage.trim();
      const newUserMessage: Message = {
        id: messages.length + 1,
        content: userQuery,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setInputMessage(""); // Clear input immediately for better UX

      let botResponse = "Maaf, saya tidak mengerti pertanyaan anda.";

      if (isDiagnosis) {
        // Already in diagnosis mode - no need to check symptoms again
        console.log(diagnosis);
        const response = await chatBotApi({
          human_messages: userQuery,
          session_id: `${userEmail}_konsultasi_${sessionId}`,
          is_diagnose: true,
          context: JSON.stringify(userData),
          disease_context: diagnosis,
        });

        botResponse = response.data.message || botResponse;
      } else {
        // Not yet in diagnosis mode - check if message is a symptom
        const isSymptomResponse = await checkSymptoms({
          human_messages: userQuery,
        });

        if (isSymptomResponse.is_symptoms) {
          console.log(
            "Symptom detected with message and symptomp:",
            userQuery,
            isSymptomResponse.symptoms
          );
          // This is a symptom - process it and collect symptoms
          const response = await chatBotApi({
            human_messages: userQuery,
            session_id: `${userEmail}_symptom_${sessionId}`,
            is_diagnose: false,
            context: JSON.stringify(userData),
            disease_context: "",
          });

          // Extract and store symptoms
          if (
            response.data.symptoms_summary?.gejala &&
            Array.isArray(response.data.symptoms_summary.gejala)
          ) {
            response.data.symptoms_summary.gejala.forEach((symptom: string) => {
              addGejala(symptom);
            });
          }

          botResponse = response.data.message || botResponse;
        } else {
          // Not a symptom - transition to diagnosis mode if we have symptoms
          if (gejala.length === 0) {
            // No symptoms collected yet
            botResponse =
              "Maaf, saya belum mendeteksi gejala yang Anda alami. Silakan ceritakan lebih detail tentang gejala yang Anda rasakan.";
          } else {
            console.log("Diagnostic mode activated:", gejala);
            // We have symptoms, proceed to diagnosis
            setIsDiagnosis(true);

            // First, get diagnosis
            const diagnosisResponse = await diagnoseApi({
              question: `Anda seorang dokter. Anda bertugas untuk diagnosis penyakit berdasarkan gejala pasien. Jelaskan penyakit tersebut, perawatan, dan obatnya. Jelaskan penyakit dalam bahasa Indonesia. Gejala yang dirasakan pasien: ${gejala.join(
                ", "
              )}`,
              session_id: `${userEmail}_diagnosis_${sessionId}`,
              email: userEmail,
            });

            const finalDiagnosis = diagnosisResponse.data.message;
            setDiagnosis(finalDiagnosis);

            // Then, get consultation response - always use standard diagnosis request first time
            const standardDiagnosisRequest =
              "Jelaskan penyakit saya dan perawatannya dok";

            // Use standard diagnosis request for first consultation
            const response = await chatBotApi({
              human_messages: standardDiagnosisRequest, // Use standard message for first diagnosis
              session_id: `${userEmail}_konsultasi_${sessionId}`,
              is_diagnose: true,
              context: JSON.stringify(userData),
              disease_context: finalDiagnosis,
            });

            botResponse = response.data.message || botResponse;
          }
        }
      }

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: botResponse,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "Maaf, terjadi kesalahan. Silakan coba lagi nanti.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start new chat
  const startNewChat = async () => {
    setGejala([]);
    setIsDiagnosis(false);
    setDiagnosis("");
    setSymptomDialogComplete(false);

    // Save current chat to history if it has messages
    if (messages.length > 1) {
      const firstUserMessage = messages.find((m) => m.isUser);
      if (firstUserMessage) {
        const currentUser = JSON.parse(
          localStorage.getItem("currentUser") || "{}"
        );
        const userEmail = currentUser.email;

        const existingHistory = JSON.parse(
          localStorage.getItem(`chatHistory_${userEmail}`) || "[]"
        );

        const newHistory: ChatHistory = {
          id: existingHistory.length + 1,
          title: firstUserMessage.content,
          date: firstUserMessage.timestamp,
          messages: [...messages], // Save entire message history
        };

        setSessionId((existingHistory.length + 1).toString());

        const updatedHistory = [newHistory, ...existingHistory];

        localStorage.setItem(
          `chatHistory_${userEmail}`,
          JSON.stringify(updatedHistory)
        );
        setChatHistory(updatedHistory);
      }
    }

    // Reset to initial state
    setMessages([
      {
        id: 1,
        content: "Memuat pesan...",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setSelectedChat(null);

    // Fetch the initial chatbot message dynamically
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      const userEmail = currentUser.email;

      const response = await initializeChat({
        session_id: userEmail,
        context: JSON.stringify(userData),
      });

      const message = response.data.message;

      // Update the first message
      setMessages([
        {
          id: 1,
          content: message,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching initial message:", error);
    }
  };

  // Load chat from history
  const loadChat = (chat: ChatHistory) => {
    setSelectedChat(chat);
    setMessages(chat.messages);
    setSessionId(chat.id.toString());

    // Reset diagnosis state - we'll need to re-identify symptoms and diagnosis
    setGejala([]);
    setIsDiagnosis(false);
    setDiagnosis("");
    setSymptomDialogComplete(false);

    // We could potentially analyze the loaded chat to determine the state,
    // but that's a more complex feature that would require additional logic
  };

  const handleLogout = () => {
    // Hapus data login saja, biarkan history tetap ada
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    // Reset state
    setMessages([
      {
        id: 1,
        content: "Hallo, ada yang bisa saya bantu?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setChatHistory([]);

    // Redirect ke landing page
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-white">
      {/* History Toggle Button - Di luar sidebar */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-2 left-4 p-2 hover:bg-white/50 rounded-full z-20"
      >
        <Image
          src="/img/history.png"
          alt="Toggle History"
          width={30}
          height={30}
        />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "w-64" : "w-0"
        } bg-blue-200 transition-all duration-300 overflow-hidden flex flex-col relative`}
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
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className={`py-2 hover:bg-white rounded-lg cursor-pointer text-sm ${
                      selectedChat?.id === chat.id ? "bg-white/50" : ""
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
          <div className="flex flex-row flex-1 items-center justify-start translate-x-10">
            <Image
              className="translate-y-1"
              src="/img/dtetilogo.png"
              alt="Logo DTETI"
              width={100}
              height={100}
            />
            <Image
              className="translate-x-4"
              src="/img/kimiafarma.png"
              alt="Logo Kimia Farma"
              width={100}
              height={100}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <Image
                src="/img/logologin.png"
                alt="User"
                width={37}
                height={37}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => router.push("/infoakun")}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full"
                >
                  <Image
                    src="/img/akun.png"
                    alt="Account"
                    width={20}
                    height={20}
                  />
                  <span>Akun saya</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full"
                >
                  <Image
                    src="/img/out.png"
                    alt="Logout"
                    width={20}
                    height={20}
                  />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              } mb-4`}
            >
              {!message.isUser && (
                <div className="mr-2 flex-shrink-0">
                  <div className="p-1 bg-blue-200 rounded-full">
                    <Image
                      src="/img/logo.png"
                      alt="Bot"
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
              )}
              <div
                className={`
                  relative max-w-[70%] px-4 py-2
                  ${
                    message.isUser
                      ? "bg-blue-200 text-[#1E2A39] rounded-[20px] rounded-tr-[5px]"
                      : "bg-white border border-blue-200 text-[#1E2A39] rounded-[20px] rounded-tl-[5px]"
                  }
                  ${message.isUser ? "bubble-right" : "bubble-left"}
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
              disabled={isProcessing}
            />
            <button
              type="submit"
              className={`p-2 ${
                isProcessing ? "opacity-50" : "hover:bg-blue-200"
              } rounded-full transition-colors`}
              disabled={isProcessing}
            >
              <Image src="/img/send.png" alt="Send" width={35} height={35} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
