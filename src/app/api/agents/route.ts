import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";

// GET all agents for a specific user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const agents = await Agent.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, agents });
  } catch (err) {
    console.error("Agent fetch error:", err);
    return NextResponse.json({ error: "Internal server error while fetching agents" }, { status: 500 });
  }
}

// POST (create) a new agent from the playground
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Ensure required fields from the frontend are present
    if (!body.userId || !body.name) {
        return NextResponse.json({ error: "Missing required fields to create an agent." }, { status: 400 });
    }

    const newAgent = new Agent(body);
    await newAgent.save();

    return NextResponse.json({ success: true, agent: newAgent }, { status: 201 });
  } catch (err) {
    console.error("Agent creation error:", err);
    return NextResponse.json({ error: "Internal server error while creating agent" }, { status: 500 });
  }
}