// src/app/api/auth/2fa/verify/route.ts
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export async function POST(request: Request) {
  await connectDB();
  try {
    const { userId, token }: { userId: string; token: string } = await request.json();
    const user = await User.findById(userId);

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1, // allows 30s clock drift
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("2FA verify error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
