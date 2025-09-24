export interface Agent {
  _id: string;
  name: string;
  avatar: string;
  createdAt: string;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errMessage = "Request failed";
    try {
      const errData = await res.json();
      errMessage = errData.error || errMessage;
    } catch {
      // ignore if not JSON
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export async function fetchAgents(userId: string): Promise<Agent[]> {
  const res = await fetch(`/api/dashboard/playground/${userId}/agents`);
  const data = await handleResponse(res);
  return data.agents || [];
}

export async function deleteAgent(
  userId: string,
  agentId: string
): Promise<void> {
  const res = await fetch(
    `/api/dashboard/playground/${userId}/agents?agentId=${agentId}`,
    { method: "DELETE" }
  );
  await handleResponse(res);
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
  const data = await handleResponse(res);
  return data.agent as Agent;
}