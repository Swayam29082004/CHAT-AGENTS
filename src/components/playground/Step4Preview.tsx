'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSync, faUser } from "@fortawesome/free-solid-svg-icons";

// Define a simple user type
interface ChatUser {
  username: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: ({ sourceUrl?: string } | null)[];
}

type Props = {
  color: string;
  agentName: string;
  avatar: string; // Agent's avatar URL
  welcomeMessage: string;
  placeholderText: string;
};

// --- CHAT MESSAGE COMPONENT ---
function ChatMessage({ message, user, agentName, agentAvatar, userColor }: { 
    message: Message, 
    user: ChatUser | null,
    agentName: string,
    agentAvatar: string,
    userColor: string 
}) {
  const isUser = message.role === 'user';
  
  // ✅ FIX: Changed from dynamic user name to the fixed string 'User'
  const displayName = isUser ? 'User' : (agentName || 'Agent');
  
  const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
      {/* This will now show 'U' for 'User' or a generic icon */}
      {displayName ? displayName.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUser} />}
    </div>
  );

  const AgentAvatar = () => (
      <img src={agentAvatar} alt="Agent Avatar" className="w-8 h-8 rounded-full object-cover" />
  );

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <AgentAvatar />}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <p className="text-xs font-semibold mb-1 text-gray-600">{displayName}</p>
        <div 
          className={`max-w-lg p-3 rounded-lg shadow-sm text-sm`}
          style={{ 
            backgroundColor: isUser ? userColor : '#e5e7eb',
            color: isUser ? '#000000' : '#1f2937'
          }}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
}

export default function Step4Preview({ color, agentName, avatar, welcomeMessage, placeholderText }: Props) {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
        role: 'assistant',
        content: welcomeMessage || "Hello! How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // This useEffect can remain; it helps populate the avatar initial if needed
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    // This function's logic does not need to change
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("You must be logged in to chat.");
      const parsedUser = JSON.parse(userData);
      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, userId: parsedUser.id }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get a response from the agent.');
      }
      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.answer, sources: data.sources };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sorry, something went wrong.";
      const errorMessage: Message = { role: 'assistant', content: message };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Step 4: Preview & Chat</h2>
      <div className="border rounded-lg h-[70vh] flex flex-col bg-gray-50">
        <div 
            className="p-3 flex items-center gap-4 text-white rounded-t-lg shadow-md"
            style={{ backgroundColor: color }}
        >
            <img src={avatar} alt="Agent Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white/50" />
            <div>
                <h3 className="font-bold">{agentName || 'Your Agent'}</h3>
                <p className="text-xs opacity-90">Online</p>
            </div>
        </div>
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <ChatMessage 
                key={index} 
                message={msg} 
                user={user}
                agentName={agentName}
                agentAvatar={avatar}
                userColor={color}
            />
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                <img src={avatar} alt="Agent Avatar" className="w-8 h-8 rounded-full object-cover" />
                 <div className="flex flex-col items-start">
                    <p className="text-xs font-semibold mb-1 text-gray-600">{agentName || 'Agent'}</p>
                    <div className="p-3 rounded-lg bg-gray-200">
                        <FontAwesomeIcon icon={faSync} className="animate-spin text-gray-500" />
                    </div>
                </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderText || "Ask a question..."}
            className="form-input flex-grow text-black"
            disabled={isLoading}
          />
          <button type="submit" className="btn-primary" style={{backgroundColor: color}} disabled={isLoading || !input.trim()}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </section>
  );
}