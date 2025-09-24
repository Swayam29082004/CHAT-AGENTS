// src/lib/contentstack/agents.ts
import stack from "./client";

export interface AgentEntry {
  uid: string;
  title: string;
  description?: string;
  [key: string]: unknown;
}

export async function getAgentData(contentTypeUid: string): Promise<AgentEntry | null> {
  try {
    const Query = stack.ContentType(contentTypeUid).Query();
    const result = await Query.toJSON().find();

    if (result && result[0].length > 0) {
      return result[0][0]; // first entry
    }

    return null;
  } catch (error) {
    console.error(`❌ Error fetching agent data for ${contentTypeUid}:`, error);
    return null;
  }
}
