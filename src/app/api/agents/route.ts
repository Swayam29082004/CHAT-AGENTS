import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, provider, modelName, avatar, color, welcomeMessage, placeholderText, visibility } = body;

    if (!userId || !name || !provider || !modelName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAgent = await Agent.create({
      userId,
      name,
      provider,
      modelName,
      avatar,
      color,
      welcomeMessage,
      placeholderText,
      visibility: visibility || "Private",
    });

    return NextResponse.json({ success: true, agent: newAgent }, { status: 201 });
  } catch (err) {
    console.error("Agent creation error:", err);
    return NextResponse.json({ error: "Internal server error while creating agent" }, { status: 500 });
  }
}

// GET /api/agents?userId=xxx -> fetch agents for a user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const agents = await Agent.find({ userId }).lean();
    return NextResponse.json({ success: true, agents });
  } catch (err) {
    console.error("Agent fetch error:", err);
    return NextResponse.json({ error: "Internal server error while fetching agents" }, { status: 500 });
  }
}
