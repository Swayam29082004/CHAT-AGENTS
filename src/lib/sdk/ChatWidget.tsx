'use client';

import { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSync } from "@fortawesome/free-solid-svg-icons";
import { useChat } from '@/lib/sdk/useChat'; // Import the new hook

// Define the component's props
interface ChatWidgetProps {
  agentId: string;
  welcomeMessage?: string;
  placeholderText?: string;
  header?: React.ReactNode; // Optional custom header
}

export default function ChatWidget({ agentId, welcomeMessage, placeholderText, header }: ChatWidgetProps) {
  // All logic is now handled by the useChat hook
  const { messages, input, isLoading, setInput, sendMessage } = useChat({
    agentId,
    initialWelcomeMessage: welcomeMessage,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effect to auto-scroll to the latest message
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ 
      top: chatContainerRef.current.scrollHeight, 
      behavior: 'smooth' 
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg border">
      {/* Render a custom header if provided */}
      {header}

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
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

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-3 border-t flex items-center gap-2 bg-white rounded-b-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholderText || "Ask a question..."}
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