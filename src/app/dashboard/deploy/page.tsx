"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faCode,
  faDownload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  fetchAgents,
  deleteAgent,
  editAgent,
  Agent,
} from "@/lib/services/agentService";
import { EmbedCodeModal } from "@/components/dashboard/EmbedCodeModal";

export default function DeployPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [embeddingAgent, setEmbeddingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        setError("You must be logged in to view agents.");
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchAgents(user.id);
        setAgents(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unexpected error fetching agents.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    loadAgents();
  }, []);

  const handleDelete = async (agentId: string) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    try {
      await deleteAgent(user.id, agentId);
      setAgents((prev) => prev.filter((a) => a._id !== agentId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "❌ Failed to delete agent";
      alert(msg);
    }
  };

  const handleEditStart = (agent: Agent) => {
    setEditingId(agent._id);
    setEditName(agent.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleEditSave = async (agentId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    try {
      const updated = await editAgent(user.id, agentId, { name: editName });
      setAgents((prev) =>
        prev.map((a) => (a._id === agentId ? updated : a))
      );
      handleEditCancel();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "❌ Failed to update agent";
      alert(msg);
    }
  };

  const handleDownloadSource = async (agentId: string) => {
    setDownloadingId(agentId);
    try {
      const response = await fetch(`/api/sdk/download`);
      if (!response.ok) throw new Error("Failed to download SDK source.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-sdk-source.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not download the SDK source.";
      console.error(msg);
      alert(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) return <div className="p-6">Loading your agents...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <>
      <div className="min-h-screen bg-white p-6">
        <h1 className="text-3xl font-bold mb-4">Deploy Your Agents</h1>
        <p className="text-gray-600 mb-8">
          Manage your agents or embed them in your application using the SDK.
        </p>

        <div className="space-y-4">
          {agents.length > 0 ? (
            agents.map((agent) => (
              <div
                key={agent._id}
                className="bg-gray-50 border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={agent.avatar}
                    alt="Agent Avatar"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {editingId === agent._id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="form-input text-sm"
                    />
                  ) : (
                    <span className="font-semibold text-lg">{agent.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {editingId === agent._id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(agent._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditStart(agent)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(agent._id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                  <div className="border-l h-6 mx-2"></div>

                  <button
                    onClick={() => setEmbeddingAgent(agent)}
                    className="btn-primary flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <FontAwesomeIcon icon={faCode} />
                    Embed
                  </button>

                  <button
                    onClick={() => handleDownloadSource(agent._id)}
                    disabled={downloadingId === agent._id}
                    className="btn-primary flex items-center gap-2"
                  >
                    {downloadingId === agent._id ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faDownload} />
                    )}
                    {downloadingId === agent._id
                      ? "Packaging..."
                      : "Download Source"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="font-semibold">No agents found.</p>
              <p className="text-gray-600 mt-1">
                Go to the Playground to create your first one!
              </p>
            </div>
          )}
        </div>
      </div>

      {embeddingAgent && (
        <EmbedCodeModal
          agent={embeddingAgent}
          onClose={() => setEmbeddingAgent(null)}
        />
      )}
    </>
  );
}
