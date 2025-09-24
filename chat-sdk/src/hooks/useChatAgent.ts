import { useState, useCallback, useEffect } from "react";

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

interface ApiSuccessResponse {
  answer: string;
}

interface ApiErrorResponse {
  error: string;
}

export const useChatAgent = ({
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
          const errorData: ApiErrorResponse = await response
            .json()
            .catch(() => ({ error: "" }));
          throw new Error(errorData.error || "An API error occurred.");
        }

        const data: ApiSuccessResponse = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer || "Sorry, I could not get a response.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
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

  return {
    messages,
    input,
    isLoading,
    error,
    setInput,
    sendMessage,
    setMessages,
  };
};
