import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";

export async function GET() {
  try {
    const conn = await dbConnect();
    return NextResponse.json({
      success: true,
      message: "✅ MongoDB connected",
      host: conn.connection.host,
      name: conn.connection.name,
    });
  } catch (error) {
    console.error("DB connection error:", error);
    return NextResponse.json({ success: false, error: "❌ DB connection failed" }, { status: 500 });
  }
}
