'use client'; // ✅ Add this directive for hooks

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faCode } from "@fortawesome/free-solid-svg-icons";

// Define the shape of an agent object, matching our model
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
        if (!res.ok) throw new Error("Failed to fetch your agents.");
        
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

  if (isLoading) return <div className="p-6"><p>Loading your agents...</p></div>;
  if (error) return <div className="p-6 alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Saved Agents</h1>
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
                    defaultValue={agent.visibility}
                    className="form-input text-sm"
                  >
                    <option value="Private">Private</option>
                    <option value="Unlisted">Unlisted</option>
                    <option value="Public">Public</option>
                  </select>
                  <button title="Preview" className="text-gray-500 hover:text-indigo-600"><FontAwesomeIcon icon={faEye} /></button>
                  <button title="Get SDK/Embed Code" className="text-gray-500 hover:text-indigo-600"><FontAwesomeIcon icon={faCode} /></button>
                  <button title="Edit" className="text-gray-500 hover:text-blue-600"><FontAwesomeIcon icon={faEdit} /></button>
                  <button title="Delete" className="text-gray-500 hover:text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="font-semibold">No agents found.</p>
            <p className="text-gray-600 mt-1">Go to the Playground to create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}