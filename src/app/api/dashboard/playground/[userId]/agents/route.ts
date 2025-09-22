// src/app/api/dashboard/playground/[userId]/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";
import mongoose from "mongoose";

// CREATE
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params; // ✅ await

    const body = await req.json();
    const {
      name,
      provider,
      modelName,
      avatar,
      color,
      welcomeMessage,
      placeholderText,
      visibility,
    } = body;

    if (!name || !provider || !modelName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(userId.trim())) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    const newAgent = await Agent.create({
      userId: userId.trim(),
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
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params; // ✅ await

    if (!mongoose.Types.ObjectId.isValid(userId.trim())) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    const agents = await Agent.find({ userId: userId.trim() }).lean();
    return NextResponse.json({ success: true, agents });
  } catch (err: any) {
    console.error("Agent fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params; // ✅ await

    let body = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    const { agentId, ...updates } = body as any;

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId.trim()) ||
      !mongoose.Types.ObjectId.isValid(agentId.trim())
    ) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const updatedAgent = await Agent.findOneAndUpdate(
      { _id: agentId.trim(), userId: userId.trim() },
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
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params; // ✅ await
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId.trim()) ||
      !mongoose.Types.ObjectId.isValid(agentId.trim())
    ) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const deletedAgent = await Agent.findOneAndDelete({
      _id: agentId.trim(),
      userId: userId.trim(),
    });

    if (!deletedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (err: any) {
    console.error("Agent delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
