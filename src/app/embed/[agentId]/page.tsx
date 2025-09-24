// src/app/embed/[agentId]/page.tsx
import React from "react";
import { getAgentData } from "@/lib/contentstack/agents";

interface AgentPageProps {
  params: {
    agentId: string;
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { agentId } = params;
  const agent = await getAgentData(agentId);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Embedded Agent</h1>

      <p className="mb-4">
        Agent ID: <span className="font-mono">{agentId}</span>
      </p>

      {agent ? (
        <div className="p-4 rounded-md border bg-gray-50">
          <h2 className="text-xl font-semibold">{agent.title}</h2>
          <p className="mt-2 text-gray-700">
            {agent.description || "No description available."}
          </p>
        </div>
      ) : (
        <p className="text-red-600">No data found for this agent.</p>
      )}
    </main>
  );
}

// ✅ Pre-generate known agent routes
export async function generateStaticParams() {
  return [
    { agentId: "travel_assistant" },
    { agentId: "conversation_history" },
    { agentId: "knowledge_source" },
  ];
}
