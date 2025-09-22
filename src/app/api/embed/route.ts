// src/app/api/agents/[agentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Agent from "@/lib/db/models/Agent";
import connectDB from "@/lib/db/mongodb";

export async function GET(req: NextRequest, { params }: { params: { agentId: string } }) {
  await connectDB();
  const { agentId } = params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const agent = await Agent.findById(agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (agent.visibility === "Private") {
    return NextResponse.json({ error: "Agent is private" }, { status: 403 });
  }

  if (agent.visibility === "Unlisted" && agent.shareToken !== token) {
    return NextResponse.json({ error: "Invalid or missing token" }, { status: 403 });
  }

  return NextResponse.json({ agent }, { status: 200 });
}
