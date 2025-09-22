"use client";

import { useState, useCallback, useEffect } from 'react';

// Define the shape of a chat message for type safety
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { sourceUrl?: string }[];
}

// Define the props the hook will accept
interface UseChatProps {
  agentId: string;
  initialWelcomeMessage?: string;
}

/**
 * Custom React Hook to manage all chat functionality for the SDK.
 * @param props - The hook's parameters.
 * @returns The state and functions for controlling the chat.
 */
export function useChat({ agentId, initialWelcomeMessage }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set the initial welcome message when the component mounts
  useEffect(() => {
    if (initialWelcomeMessage && messages.length === 0) {
      setMessages([{ role: 'assistant', content: initialWelcomeMessage }]);
    }
  }, [initialWelcomeMessage, messages.length]);

  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // The API endpoint is the public-facing RAG query handler
      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The SDK sends the query and agentId.
        // The backend will treat the user as "guest" since no JWT is sent.
        body: JSON.stringify({ query: currentInput, agentId }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "An unknown error occurred." }));
        throw new Error(errData.error || `Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.answer, 
        sources: data.sources 
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      const errorMessage: Message = { 
        role: 'assistant', 
        content: error.message || 'Sorry, an error occurred.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, input, isLoading]);

  return {
    messages,
    input,
    isLoading,
    setInput,
    sendMessage,
  };
}