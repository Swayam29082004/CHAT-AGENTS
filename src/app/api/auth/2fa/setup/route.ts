// /src/app/api/auth/2fa/setup/route.ts
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export async function POST(request: Request) {
  await connectDB();
  try {
    const { userId }: { userId: string } = await request.json();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const secret = speakeasy.generateSecret({ name: "MyApp (2FA)" });
    user.twoFactorSecret = secret.base32;
    await user.save();
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    return NextResponse.json({ qrCode, secret: secret.base32 }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
