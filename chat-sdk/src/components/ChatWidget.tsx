import React, { useEffect, useRef, useState } from "react";
import { useChatAgent } from "../hooks/useChatAgent";
import './ChatWidget.css'; // We'll add new styles here

// Define the shape of a single message
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Define the component's props
interface ChatWidgetProps {
  apiUrl: string;
  agentId: string;
  apiKey?: string;
  welcomeMessage?: string;
  placeholderText?: string;
  themeColor?: string;
}

// A new, separate component for the chat message bubble for cleanliness
function ChatMessageBubble({ message, themeColor }: { message: Message, themeColor: string }) {
  // ✅ Hardcoded display names for "Agent" and "User"
  const displayName = message.role === 'user' ? 'User' : 'Agent';
  const isUser = message.role === 'user';

  return (
    <div className={`message-wrapper ${message.role}`}>
      <div className="message-header">{displayName}</div>
      <div
        className={`message-bubble ${message.role}`}
        style={{ backgroundColor: isUser ? themeColor : undefined }}
      >
        <p dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, "<br />") }} />
      </div>
    </div>
  );
}


export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl,
  agentId,
  apiKey,
  welcomeMessage = "Hello! How can I help you today?",
  placeholderText = "Type your message...",
  themeColor = "#029690",
}) => {
  // ✅ NEW: State to manage if the chat pop-up is open or closed
  const [isOpen, setIsOpen] = useState(false);

  const { messages, input, isLoading, error, setInput, sendMessage, setMessages } = useChatAgent({
    apiUrl,
    agentId,
    apiKey,
    initialMessages: [{ role: "assistant", content: welcomeMessage }],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (isOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // ✅ THE FIX: This effect clears the chat history when the widget is closed.
  useEffect(() => {
    if (!isOpen) {
      // Reset to the initial state when the chat is closed
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    }
  }, [isOpen, welcomeMessage, setMessages]);


  return (
    // This is the main container for the pop-up button and the widget itself
    <div className="chat-widget-container">
      {/* The Chat Widget Window (only visible when isOpen is true) */}
      {isOpen && (
        <div className="chat-widget-root">
          <header className="chat-header" style={{ backgroundColor: themeColor }}>
            {/* Hardcoded Agent Name in Header */}
            <h2>Agent</h2>
            <button onClick={() => setIsOpen(false)} className="close-button">
              &times;
            </button>
          </header>
          <main className="chat-body">
            <div className="message-list">
              {messages.map((msg, index) => (
                <ChatMessageBubble key={index} message={msg} themeColor={themeColor} />
              ))}
              {isLoading && (
                <div className="message-wrapper assistant">
                  <div className="message-bubble assistant loading-bubble">
                    <div className="loading-dot"></div>
                    <div className="loading-dot" style={{ animationDelay: "0.1s" }}></div>
                    <div className="loading-dot" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              <div ref={chatEndRef} />
            </div>
          </main>
          <footer className="chat-footer">
            <form onSubmit={sendMessage} className="chat-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholderText}
                className="chat-input"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="send-button" style={{ backgroundColor: themeColor }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </form>
          </footer>
        </div>
      )}

      {/* Floating Action Button (FAB) to open the chat */}
      <button onClick={() => setIsOpen(true)} className="chat-fab" style={{ backgroundColor: themeColor }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </button>
    </div>
  );
};

