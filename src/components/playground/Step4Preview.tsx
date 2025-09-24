// "use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSync,
  faUser,
  faComments,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: ({ sourceUrl?: string } | null)[];
}

type Props = {
  color: string;
  agentName: string;
  avatar: string;
  welcomeMessage: string;
  placeholderText: string;
  agentId?: string | null;
};

function ChatMessage({
  message,
  agentName,
  agentAvatar,
  userColor,
}: {
  message: Message;
  agentName: string;
  agentAvatar: string;
  userColor: string;
}) {
  const isUser = message.role === "user";
  const displayName = isUser ? "User" : agentName || "Agent";

  const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
      {displayName ? (
        displayName.charAt(0).toUpperCase()
      ) : (
        <FontAwesomeIcon icon={faUser} />
      )}
    </div>
  );

  const AgentAvatar = () => (
    <Image
      src={agentAvatar}
      alt="Agent Avatar"
      width={32}
      height={32}
      className="w-8 h-8 rounded-full object-cover"
    />
  );

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && <AgentAvatar />}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <p className="text-xs font-semibold mb-1 text-gray-600">{displayName}</p>
        <div
          className="max-w-lg p-3 rounded-lg shadow-sm text-sm"
          style={{
            backgroundColor: isUser ? userColor : "#e5e7eb",
            color: isUser ? "#000000" : "#1f2937",
          }}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
}

export default function Step4Preview({
  color,
  agentName,
  avatar,
  welcomeMessage,
  placeholderText,
  agentId,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: welcomeMessage || "Hello! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(
      `[Step4Preview - Mount/Prop] Received agentId prop: ${agentId}`
    );
  }, [agentId]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([
        {
          role: "assistant",
          content: welcomeMessage || "Hello! How can I help you today?",
        },
      ]);
      setInput("");
      setIsLoading(false);
    }
  }, [isOpen, welcomeMessage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msgContent = input;

    const userMessage: Message = { role: "user", content: msgContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!agentId) {
        const missingMsg: Message = {
          role: "assistant",
          content:
            "❌ Agent ID is missing. Please save your agent before trying the preview.",
        };
        setMessages((prev) => [...prev, missingMsg]);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/rag-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msgContent,
          agentId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("[Step4Preview - API] Non-OK response", {
          status: response.status,
          body: errData,
        });
        throw new Error(
          errData.error || "Failed to get a response from the agent."
        );
      }

      const data = await response.json();
      console.log("[Step4Preview - API] Success response", data);
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "Sorry, the agent returned an empty response.",
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("[Step4Preview - API Error]", error);
      const message =
        error instanceof Error
          ? error.message
          : "Sorry, something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 100, x: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: 100, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-20 right-6 w-96 h-[70vh] bg-white shadow-xl rounded-lg flex flex-col border origin-bottom-right z-50"
          >
            {/* Header */}
            <div
              className="p-3 flex items-center gap-3 text-white rounded-t-lg shadow-md"
              style={{ backgroundColor: color }}
            >
              <Image
                src={avatar}
                alt="Agent Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
              />
              <div>
                <h3 className="font-bold">{agentName || "Your Agent"}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50"
            >
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  agentName={agentName}
                  agentAvatar={avatar}
                  userColor={color}
                />
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Image
                    src={avatar}
                    alt="Agent Avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col items-start">
                    <p className="text-xs font-semibold mb-1 text-gray-600">
                      {agentName || "Agent"}
                    </p>
                    <div className="p-3 rounded-lg bg-gray-200">
                      <FontAwesomeIcon
                        icon={faSync}
                        className="animate-spin text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholderText || "Ask a question..."}
                className="form-input flex-grow text-black"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ backgroundColor: color }}
                disabled={isLoading || !input.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-50"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faComments} size="lg" />
      </motion.button>
    </>
  );
}
