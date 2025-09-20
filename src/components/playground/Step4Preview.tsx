'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSync } from "@fortawesome/free-solid-svg-icons";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: ({ sourceUrl?: string } | null)[]; // Can contain nulls
}

type Props = {
  color: string;
  agentName: string;
};

// Sub-component for displaying a single message
function ChatMessage({ message, userColor }: { message: Message, userColor: string }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-lg p-3 rounded-lg shadow-sm text-sm`}
        style={{ 
          backgroundColor: isUser ? userColor : '#e5e7eb', // Use theme color for user
          color: isUser ? '#ffffff' : '#1f2937'
        }}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {/* Sources are hidden from UI per your request but handled safely */}
      </div>
    </div>
  );
}

export default function Step4Preview({ color, agentName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        throw new Error("You must be logged in to chat.");
      }

      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, userId: user.id }),
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
      <h2 className="text-xl font-semibold mb-4">Step 4: Preview & Chat with "{agentName || 'Your Agent'}"</h2>
      <div className="border rounded-lg h-[60vh] flex flex-col bg-gray-50">
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 pt-8">
              Ask a question about the content you scraped in Step 3.
            </div>
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} userColor={color} />
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-gray-200">
                    <FontAwesomeIcon icon={faSync} className="animate-spin text-gray-500" />
                </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your agent a question..."
            className="form-input flex-grow"
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