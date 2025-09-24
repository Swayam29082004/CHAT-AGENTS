// /src/app/api/sdk/download/route.ts
import {  NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";

async function addFilesToZip(zip: JSZip, dir: string, base: string) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    const zipPath = path.join(base, file);
    if (stat.isDirectory()) {
      const folder = zip.folder(file);
      if (folder) await addFilesToZip(folder, filePath, "");
    } else {
      const content = await fs.readFile(filePath);
      zip.file(zipPath, content);
    }
  }
}

export async function GET() {
  try {
    const zip = new JSZip();
    const sdkRoot = path.join(process.cwd(), "chat-sdk");
    await addFilesToZip(zip, sdkRoot, "");
    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="chat-sdk-source.zip"',
      },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to package SDK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
