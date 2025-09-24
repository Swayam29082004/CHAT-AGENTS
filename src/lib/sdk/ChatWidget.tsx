"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ChatWidget.css";

export interface ChatWidgetProps {
  apiUrl: string;
  agentId: string;
  agentName?: string;
  welcomeMessage?: string;
  placeholderText?: string;
  themeColor?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseChatAgentProps {
  apiUrl: string;
  agentId: string;
  apiKey?: string;
  initialMessages?: Message[];
}

const useChatAgent = ({
  apiUrl,
  agentId,
  apiKey,
  initialMessages,
}: UseChatAgentProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMessages && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages]);

  const sendMessage = useCallback(
    async (e?: React.FormEvent, messageContent?: string) => {
      if (e) e.preventDefault();
      const currentInput = messageContent || input;
      if (!currentInput.trim() || isLoading) return;

      const userMessage: Message = { role: "user", content: currentInput };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({ query: currentInput, agentId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error((errorData as { error?: string }).error || "An API error occurred.");
        }

        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: (data as { answer?: string }).answer || "Sorry, I could not get a response.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${errorMessage}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, agentId, apiKey, input, isLoading]
  );

  return { messages, input, isLoading, error, setInput, sendMessage, setMessages };
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl,
  agentId,
  agentName,
  welcomeMessage = "Hello! How can I help you today?",
  placeholderText = "Type your message...",
  themeColor = "#3B82F6",
}) => {
  const { messages, input, isLoading, setInput, sendMessage, setMessages } =
    useChatAgent({
      apiUrl,
      agentId,
      initialMessages: [{ role: "assistant", content: welcomeMessage }],
    });

  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([{ role: "assistant", content: welcomeMessage }]);
      setInput("");
    }
  }, [isOpen, setMessages, setInput, welcomeMessage]);

  return (
    <>
      {!isOpen && (
        <button
          className="chat-toggle-button"
          style={{ backgroundColor: themeColor }}
          onClick={() => setIsOpen(true)}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          className="chat-widget-root"
          style={{ "--theme-color": themeColor } as React.CSSProperties}
        >
          <header className="chat-header">
            <div className="status-indicator"></div>
            <h2>{agentName || "Agent"}</h2>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </header>

          <main className="chat-body">
            <div className="message-list">
              {messages.map((msg: Message, index: number) => (
                <div key={index} className={`message-wrapper ${msg.role}`}>
                  <div className={`message-bubble ${msg.role}`}>
                    <strong className="message-sender">
                      {msg.role === "assistant" ? agentName || "Agent" : "User"}
                    </strong>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: msg.content.replace(/\n/g, "<br />"),
                      }}
                    />
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
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="send-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
};
