'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faCode } from "@fortawesome/free-solid-svg-icons";

// Define the shape of an agent object
interface Agent {
  _id: string;
  name: string;
  visibility: 'Public' | 'Private' | 'Unlisted';
  avatar: string;
}

export default function DeployPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
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
    // In a real app, you would call a PATCH /api/agents endpoint here
    console.log(`Updating agent ${agentId} to ${newVisibility}`);
    setAgents(agents.map(agent => 
      agent._id === agentId ? { ...agent, visibility: newVisibility as Agent['visibility'] } : agent
    ));
  };

  const handleDeleteAgent = async (agentId: string) => {
     if (confirm('Are you sure you want to delete this agent?')) {
        // In a real app, you would call a DELETE /api/agents endpoint here
        console.log(`Deleting agent ${agentId}`);
        setAgents(agents.filter(agent => agent._id !== agentId));
     }
  };

  if (isLoading) return <p>Loading your agents...</p>;
  if (error) return <div className="alert-error">{error}</div>;

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
              <div className="flex items-center gap-4">
                 <select
                    value={agent.visibility}
                    onChange={(e) => handleVisibilityChange(agent._id, e.target.value)}
                    className="form-input text-sm"
                  >
                    <option value="Private">Private</option>
                    <option value="Unlisted">Unlisted</option>
                    <option value="Public">Public</option>
                 </select>
                 <button title="Preview" className="text-gray-500 hover:text-indigo-600"><FontAwesomeIcon icon={faEye} /></button>
                 <button title="Get SDK/Embed Code" className="text-gray-500 hover:text-indigo-600"><FontAwesomeIcon icon={faCode} /></button>
                 <button title="Edit" className="text-gray-500 hover:text-blue-600"><FontAwesomeIcon icon={faEdit} /></button>
                 <button onClick={() => handleDeleteAgent(agent._id)} title="Delete" className="text-gray-500 hover:text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
              </div>
            </div>
          ))
        ) : (
          <p>You have not saved any agents yet. Go to the Playground to create your first one!</p>
        )}
      </div>
    </div>
  );
}