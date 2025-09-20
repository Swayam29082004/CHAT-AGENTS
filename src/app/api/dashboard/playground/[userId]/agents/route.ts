import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";
import mongoose from "mongoose";

// CREATE
export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB();
    const { userId } = params;
    const body = await req.json();
    const { name, provider, modelName, avatar, color, welcomeMessage, placeholderText, visibility } = body;

    if (!name || !provider || !modelName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
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
  } catch (err: any) {
    console.error("Agent creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// READ ALL
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB();
    const { userId } = params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    const agents = await Agent.find({ userId }).lean();
    return NextResponse.json({ success: true, agents });
  } catch (err: any) {
    console.error("Agent fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE
export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB();
    const { userId } = params;
    const body = await req.json();
    const { agentId, ...updates } = body;

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(agentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const updatedAgent = await Agent.findOneAndUpdate(
      { _id: agentId, userId },
      { $set: updates },
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (err: any) {
    console.error("Agent update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB();
    const { userId } = params;
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(agentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const deletedAgent = await Agent.findOneAndDelete({ _id: agentId, userId });

    if (!deletedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (err: any) {
    console.error("Agent delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
