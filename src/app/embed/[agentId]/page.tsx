"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";

// ✅ CORRECT NEW PATH
// This path goes up from the current file to the root and then into the chat-sdk folder.
import { ChatWidget } from "../../../../chat-sdk/src/components/ChatWidget";
import "../../../../chat-sdk/src/components/ChatWidget.css"; // Also import the CSS

export default function EmbedAgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [agent, setAgent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ... (The rest of the file does not need to change)
  // ... (useEffect and return statement remain the same)

  // This part of your component remains unchanged
  if (isLoading) return <div className="p-6 text-center">Loading Agent...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  const AgentHeader = (
    <div className="p-3 flex items-center gap-3 text-white rounded-t-lg" style={{ backgroundColor: agent?.color || '#4f46e5' }}>
      <img src={agent?.avatar} alt="Agent" className="w-8 h-8 rounded-full object-cover border" />
      <h3 className="font-semibold">{agent?.name}</h3>
    </div>
  );

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md h-[70vh]">
        <ChatWidget
          // Remember to replace with your actual API URL
          apiUrl="http://localhost:3000/api/rag-query" 
          agentId={agentId}
          agentName={agent?.name}
          welcomeMessage={agent?.welcomeMessage}
          placeholderText={agent?.placeholderText}
          themeColor={agent?.color}
        />
      </div>
    </div>
  );
}
