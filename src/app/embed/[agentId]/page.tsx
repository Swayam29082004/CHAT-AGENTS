// src/app/embed/[agentId]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAgentData } from "@/lib/contentstack"; // ✅ import from lib

export default async function AgentPage(props: any) {
  const agentId = props?.params?.agentId ?? "unknown";

  // You can use getAgentData here if you want:
  // const agent = await getAgentData(agentId);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Embedded Agent (fallback)</h1>

      <p className="mb-4">
        Agent ID: <span className="font-mono">{agentId}</span>
      </p>

      <p className="text-gray-600">
        This is a lightweight fallback page to avoid build-time type errors.
      </p>
    </main>
  );
}
