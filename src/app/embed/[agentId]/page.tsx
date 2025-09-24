import React from "react";

interface AgentPageProps {
  params: {
    agentId: string;
  };
}

async function getAgentData(agentId: string) {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  const environment = process.env.CONTENTSTACK_ENVIRONMENT || "development";

  if (!apiKey || !deliveryToken) {
    console.warn(" Missing Contentstack credentials");
    return null;
  }

  try {
    const res = await fetch(
      `https://cdn.contentstack.io/v3/content_types/${agentId}/entries?environment=${environment}`,
      {
        headers: {
          api_key: apiKey,
          access_token: deliveryToken,
        },
        cache: "no-store", 
      }
    );

    if (!res.ok) {
      console.error(` Failed to fetch agent ${agentId}`, await res.text());
      return null;
    }

    const data = await res.json();
    return data.entries?.[0] ?? null;
  } catch (error) {
    console.error(" Error fetching agent data:", error);
    return null;
  }
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


export async function generateStaticParams() {
  return [
    { agentId: "travel_assistant" },
    { agentId: "conversation_history" },
    { agentId: "knowledge_source" },
  ];
}
