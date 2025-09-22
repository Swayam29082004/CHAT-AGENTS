"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import ChatWidget from "@/components/widgets/ChatWidget"; // Use the new SDK

export default function EmbedAgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [agent, setAgent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const url = token ? `/api/agents/${agentId}?token=${token}` : `/api/agents/${agentId}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load agent");
        }
        setAgent(data.agent);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgent();
  }, [agentId, token]);

  if (isLoading) return <div className="p-6 text-center">Loading Agent...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  // Custom header for the embedded page
  const AgentHeader = (
    <div className="p-3 flex items-center gap-3 text-white rounded-t-lg" style={{ backgroundColor: agent.color }}>
      <img src={agent.avatar} alt="Agent" className="w-8 h-8 rounded-full object-cover border" />
      <h3 className="font-semibold">{agent.name}</h3>
    </div>
  );

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md h-[70vh]">
        <ChatWidget
          agentId={agentId}
          initialMessages={[{ role: 'assistant', content: agent.welcomeMessage }]}
          placeholderText={agent.placeholderText}
          header={AgentHeader}
        />
      </div>
    </div>
  );
}