// /src/app/api/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";

/**
 * POST -> save progress for a user: { userId, step, progress }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, step, progress } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    if (step === undefined || progress === undefined) {
      return NextResponse.json({ error: "Missing step or progress" }, { status: 400 });
    }

    // Upsert agent (or update existing) with progress.stepX
    const updatedAgent = await Agent.findOneAndUpdate(
      { userId },
      { $set: { [`progress.step${step}`]: progress } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET -> fetch saved progress by userId query param
 * e.g. GET /api/progress?userId=abcd
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const agent = await Agent.findOne({ userId }).lean();
    return NextResponse.json({ success: true, agent: agent || null });
  } catch (err) {
    console.error("Progress load error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
