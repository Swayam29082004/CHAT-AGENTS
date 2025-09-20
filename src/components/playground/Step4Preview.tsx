'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSync } from "@fortawesome/free-solid-svg-icons";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: ({ sourceUrl?: string } | null)[];
}

// Sub-component for displaying a single message
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const validSources = message.sources?.filter(source => source && source.sourceUrl) || [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-lg p-3 rounded-lg shadow-sm ${isUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        
        {/*
          ✅ THIS BLOCK IS NOW COMMENTED OUT TO HIDE SOURCES FROM THE UI
          
          {!isUser && validSources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <h4 className="text-xs font-bold mb-1">Sources:</h4>
              <ul className="text-xs list-disc pl-4">
                {validSources.map((source, index) => (
                  <li key={index}>
                    <a href={source!.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {source!.sourceUrl}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        */}
      </div>
    </div>
  );
}

// The rest of the Step4Preview component remains the same
export default function Step4Preview() {
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
        throw new Error('Failed to get a response from the agent.');
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
      <div className="border rounded-lg h-[60vh] flex flex-col bg-gray-50">
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 pt-8">
              Ask a question about the content you scraped in Step 3.
            </div>
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
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
          <button type="submit" className="btn-primary" disabled={isLoading || !input.trim()}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </section>
  );
}