// src/app/api/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";
import { encrypt } from "@/lib/crypto";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, provider, modelName, apiKey } = await req.json();

    if (!userId || !provider || !modelName || !apiKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const encryptedKey = encrypt(apiKey);

    const agent = await Agent.create({
      uuid: uuidv4(),
      userId,
      provider,
      modelName,
      apiKeyEncrypted: encryptedKey,
    });

    return NextResponse.json({ success: true, agent }, { status: 201 });
  } catch (error) {
    console.error("Agent creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
