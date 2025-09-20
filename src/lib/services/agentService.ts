// src/lib/services/agentService.ts

export interface Agent {
  _id: string;
  name: string;
  visibility: 'Public' | 'Private' | 'Unlisted';
  avatar: string;
}

export async function fetchAgents(userId: string): Promise<Agent[]> {
  const res = await fetch(`/api/dashboard/playground/${userId}/agents`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to fetch your agents.");
  }
  const data = await res.json();
  return data.agents || [];
}

export async function deleteAgent(userId: string, agentId: string): Promise<void> {
  const res = await fetch(`/api/dashboard/playground/${userId}/agents?agentId=${agentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to delete agent.");
  }
}

export async function editAgent(
  userId: string,
  agentId: string,
  updates: Partial<Agent>
): Promise<Agent> {
  const res = await fetch(`/api/dashboard/playground/${userId}/agents`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, ...updates }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to update agent.");
  }

  const data = await res.json();
  return data.agent;
}
