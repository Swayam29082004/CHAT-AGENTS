import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { username, email, password }: { username: string; email: string; password: string } =
      await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: newUser._id.toString(), username: newUser.username, email: newUser.email },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Register error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
