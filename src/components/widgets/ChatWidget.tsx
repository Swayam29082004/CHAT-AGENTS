"use client";
import { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSync } from "@fortawesome/free-solid-svg-icons";
import { useChat } from "@/lib/sdk/useChat"; // Import the hook

interface ChatWidgetProps {
  agentId: string;
  initialMessages?: { role: 'user' | 'assistant'; content: string }[];
  placeholderText?: string;
  header?: React.ReactNode;
}

export default function ChatWidget({ agentId, initialMessages, placeholderText, header }: ChatWidgetProps) {
  const { messages, input, isLoading, setInput, sendMessage } = useChat({
    agentId,
    initialMessages,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg border">
      {header}
      <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-800"}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {/* Correctly renders the sources list */}
              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <h4 className="text-xs font-bold mb-1">Sources</h4>
                  <ul className="text-xs list-disc pl-4">
                    {msg.sources.map((source, idx) => (
                      source.sourceUrl && <li key={idx}>
                        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {source.sourceUrl.substring(0, 30)}...
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
            <div className="p-3 rounded-lg bg-gray-200"><FontAwesomeIcon icon={faSync} className="animate-spin text-gray-500" /></div>
          </div>
        )}
      </div>
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