import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, step, progress } = await req.json();

    if (!userId || step === undefined || !progress) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Update agent progress or create new if not exists
    const updatedAgent = await Agent.findOneAndUpdate(
      { userId },
      { $set: { [`progress.step${step}`]: progress } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
