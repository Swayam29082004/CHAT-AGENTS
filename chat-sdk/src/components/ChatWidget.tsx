import React, { useEffect, useRef } from "react";
import { useChatAgent } from "../hooks/useChatAgent";
import './ChatWidget.css'; // Import the CSS

interface ChatWidgetProps {
  apiUrl: string;
  agentId: string;
  apiKey?: string;
  agentName?: string;
  welcomeMessage?: string;
  placeholderText?: string;
  themeColor?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl,
  agentId,
  apiKey,
  agentName = "Chat Assistant",
  welcomeMessage = "Hello! How can I help you today?",
  placeholderText = "Type your message...",
  themeColor = "#3B82F6",
}) => {
  const {
    messages,
    input,
    isLoading,
    setInput,
    sendMessage,
    setMessages,
  } = useChatAgent({
    apiUrl,
    agentId,
    apiKey,
    initialMessages: [{ role: "assistant", content: welcomeMessage }],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chat-widget-root" style={{ "--theme-color": themeColor } as React.CSSProperties}>
      <header className="chat-header">
        <div className="status-indicator"></div>
        <h2>{agentName}</h2>
      </header>
      <main className="chat-body">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br />") }} />
              </div>
            </div>
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
          <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
};