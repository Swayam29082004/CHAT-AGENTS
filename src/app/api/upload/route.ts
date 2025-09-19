// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file } = body;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: "chat-agent-avatars",
    });

    return NextResponse.json({ success: true, url: uploadResponse.secure_url });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
