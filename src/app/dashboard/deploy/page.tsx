"use client";

import React, { useState, useEffect } from 'react';

//================================================================
// Component 1: Step1APIModel
// For selecting API provider and model in the playground.
//================================================================

type Step1APIModelProps = {
  apiKey: string;
  setApiKey: (val: string) => void;
  provider: string;
  setProvider: (val: string) => void;
  modelName: string;
  setModelName: (val: string) => void;
};

export function Step1APIModel({
  apiKey,
  setApiKey,
  provider,
  setProvider,
  modelName,
  setModelName,
}: Step1APIModelProps) {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Step 1: API & Model</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Provider</option>
          <option value="openai">OpenAI (GPT)</option>
          <option value="groq">Groq</option>
          <option value="anthropic">Anthropic</option>
        </select>
        <select
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Model</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5">GPT-3.5</option>
          <option value="mcp">MCP Model</option>
        </select>
      </div>
    </section>
  );
}


//================================================================
// Component 2: DeployPage
// For displaying and managing all created agents.
//================================================================

// Helper components for SVG icons
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
    </svg>
);
const CodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-code-slash" viewBox="0 0 16 16">
        <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/>
    </svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
    </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
    </svg>
);


interface Agent {
  _id: string;
  name: string;
  visibility: 'Public' | 'Private' | 'Unlisted';
  avatar: string;
}

export function DeployPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setConfirmDeleteId(null);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        setError("You must be logged in to view agents.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/agents?userId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch agents.");
        const data = await res.json();
        setAgents(data.agents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const handleVisibilityChange = async (agentId: string, newVisibility: string) => {
    console.log(`Updating agent ${agentId} to ${newVisibility}`);
    setAgents(agents.map(agent =>
      agent._id === agentId ? { ...agent, visibility: newVisibility as Agent['visibility'] } : agent
    ));
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirmDeleteId === agentId) {
      console.log(`Deleting agent ${agentId}`);
      setAgents(agents.filter(agent => agent._id !== agentId));
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(agentId);
    }
  };

  if (isLoading) return <p className="p-6">Loading your agents...</p>;
  if (error) return <div className="p-6 alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Deployed Agents</h1>
      <p className="text-gray-600 mb-8">
        Manage your saved agents, update their visibility, and get the code to embed them on your website.
      </p>

      <div className="space-y-4">
        {agents.length > 0 ? (
          agents.map((agent) => (
            <div key={agent._id} className="bg-gray-50 border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={agent.avatar} alt="Agent Avatar" className="w-12 h-12 rounded-full object-cover" />
                <span className="font-semibold text-lg">{agent.name}</span>
              </div>
              <div className="flex items-center gap-3">
                 <select
                    value={agent.visibility}
                    onChange={(e) => handleVisibilityChange(agent._id, e.target.value)}
                    className="form-input text-sm w-32"
                  >
                    <option value="Private">Private</option>
                    <option value="Unlisted">Unlisted</option>
                    <option value="Public">Public</option>
                 </select>
                 <button title="Preview" className="text-gray-500 hover:text-indigo-600 p-2"><EyeIcon /></button>
                 <button title="Get SDK/Embed Code" className="text-gray-500 hover:text-indigo-600 p-2"><CodeIcon /></button>
                 <button title="Edit" className="text-gray-500 hover:text-blue-600 p-2"><EditIcon /></button>
                 
                 <button 
                    onClick={() => handleDeleteAgent(agent._id)} 
                    title="Delete" 
                    className={`p-2 rounded transition-colors ${confirmDeleteId === agent._id ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-red-600'}`}
                 >
                   {confirmDeleteId === agent._id ? 'Confirm?' : <TrashIcon />}
                 </button>
              </div>
            </div>
          ))
        ) : (
          <p>You havenot saved any agents yet. Go to the Playground to create your first one!</p>
        )}
      </div>
    </div>
  );
}

