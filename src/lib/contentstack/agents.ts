// src/lib/contentstack/agents.ts
import stack from "./client";

export interface AgentEntry {
  uid: string;
  title: string;
  description?: string;
  provider?: string;
  model_name?: string;
  theme_color?: string;
  welcome_message?: string;
  [key: string]: unknown;
}

// ✅ CORRECTED LOGIC:
// This function now queries the "agent" content type and looks for a specific
// entry where the title matches the agentId from the URL.
export async function getAgentData(agentId: string): Promise<AgentEntry | null> {
  try {
    // Hardcoded to query the 'agent' Content Type, which matches your setup.
    const Query = stack.ContentType("agent").Query(); 
    
    // Find a single entry where the 'title' field matches the agentId from the URL.
    const result = await Query.where("title", agentId)
      .toJSON()
      .findOne();

    if (result) {
      return result as AgentEntry; // Return the found agent entry.
    }

    // If no matching entry is found, return null.
    return null;
  } catch (error) {
    console.error(` Error fetching agent entry data for ${agentId}:`, error);
    return null;
  }
}

