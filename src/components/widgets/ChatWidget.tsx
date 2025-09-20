'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSync, faCommentDots } from "@fortawesome/free-solid-svg-icons";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { sourceUrl?: string }[];
}

export default function ChatWidget({ agentId, userId }: { agentId: string, userId: string }) {
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
      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, userId, agentId }),
      });

      if (!response.ok) throw new Error('Failed to get a response.');
      
      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.answer, sources: data.sources };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, an error occurred.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl">
      <header className="bg-indigo-600 text-white p-4 flex items-center">
        <FontAwesomeIcon icon={faCommentDots} className="mr-2" />
        <h1 className="font-semibold text-lg">Chat Assistant</h1>
      </header>
      <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <h4 className="text-xs font-bold mb-1">Sources:</h4>
                  <ul className="text-xs list-disc pl-4">
                    {msg.sources.map((source, idx) => (
                      <li key={idx}>
                        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {source.sourceUrl?.substring(0, 30)}...
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-gray-200">
                  <FontAwesomeIcon icon={faSync} className="animate-spin text-gray-500" />
              </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-2 border-t flex items-center gap-2 bg-gray-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="form-input flex-grow text-sm"
          disabled={isLoading}
        />
        <button type="submit" className="btn-primary" disabled={isLoading || !input.trim()}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
}