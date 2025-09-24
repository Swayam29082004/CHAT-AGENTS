"use client";

import { useState, useCallback, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { sourceUrl?: string }[];
}

interface UseChatProps {
  agentId: string;
  initialWelcomeMessage?: string;
}

export function useChat({ agentId, initialWelcomeMessage }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialWelcomeMessage && messages.length === 0) {
      setMessages([{ role: "assistant", content: initialWelcomeMessage }]);
    }
  }, [initialWelcomeMessage, messages.length]);

  const sendMessage = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: Message = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);

      const currentInput = input;
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/rag-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: currentInput, agentId }),
        });

        if (!response.ok) {
          const errData: { error?: string } = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const data: { answer: string; sources?: { sourceUrl?: string }[] } =
          await response.json();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer, sources: data.sources },
        ]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Sorry, an unexpected error occurred.";
        setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      } finally {
        setIsLoading(false);
      }
    },
    [agentId, input, isLoading]
  );

  return {
    messages,
    input,
    isLoading,
    setInput,
    sendMessage,
  };
}
