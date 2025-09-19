import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { file } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: "chat-agents/avatars",
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload" },
      { status: 500 }
    );
  }
}
