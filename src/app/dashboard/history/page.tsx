'use client';

import { useState, useEffect } from 'react';
import { fetchAgents, Agent } from '@/lib/services/agentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

export default function HistoryPage() {
  // State to hold the list of agents, loading status, and any errors
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect runs when the component mounts to fetch data
  useEffect(() => {
    const loadAgentHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user?.id) {
          throw new Error('You must be logged in to view history.');
        }
        const data = await fetchAgents(user.id);
        // Sort agents by most recently created
        const sortedAgents = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAgents(sortedAgents);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentHistory();
  }, []);

  // Show a loading message while fetching data
  if (isLoading) {
    return <div className="p-6">Loading agent history...</div>;
  }

  // Show an error message if something went wrong
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    // ✅ FIX: Replaced the gradient with a light, solid background color
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Agent History</h1>
      
      <div className="space-y-4">
        {agents.length > 0 ? (
          agents.map((agent) => (
            <div
              key={agent._id}
              // ✅ FIX: Simplified the card style for a cleaner look
              className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={agent.avatar}
                  alt="Agent Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">{agent.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created on: {new Date(agent.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <FontAwesomeIcon icon={faPlusCircle} className="h-12 w-12 text-gray-400 mb-4" />
            <p className="font-semibold text-gray-900 dark:text-white">No agents found.</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Go to the Playground to create your first one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}