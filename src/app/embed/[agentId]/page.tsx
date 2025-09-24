"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { ChatWidget } from "../../../../chat-sdk/src/components/ChatWidget";
import "../../../../chat-sdk/src/components/ChatWidget.css";

interface Agent {
  _id: string;
  name: string;
  avatar: string;
  color: string;
  welcomeMessage: string;
  placeholderText: string;
}

export default function EmbedAgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(
          `/api/dashboard/playground/${agentId}/agents`
        );
        if (!response.ok) throw new Error("Failed to load agent data");
        const data = await response.json();
        setAgent(data?.agent ?? null);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Unexpected error loading agent.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgent();
  }, [agentId, token]);

  if (isLoading) return <div className="p-6 text-center">Loading Agent...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md h-[70vh]">
        <ChatWidget
          apiUrl="http://localhost:3000/api/rag-query"
          agentId={agentId}
          agentName={agent?.name} // ✅ Now supported in ChatWidget
          welcomeMessage={agent?.welcomeMessage}
          placeholderText={agent?.placeholderText}
          themeColor={agent?.color}
        />
      </div>
    </div>
  );
}
