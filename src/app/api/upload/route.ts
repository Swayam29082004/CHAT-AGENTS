import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";
import { Readable } from "stream";

// Helper to convert base64 to a buffer
function base64ToBuffer(base64: string) {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = Buffer.from(parts[1], 'base64');
  return { buffer: raw, contentType };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file: base64File } = body; // Expecting a base64 string

    if (!base64File) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    const { buffer, contentType } = base64ToBuffer(base64File);

    const form = new FormData();
    form.append("asset[upload]", Readable.from(buffer), {
        filename: `agent-avatar-${Date.now()}`,
        contentType: contentType
    });

    const { CONTENTSTACK_API_KEY, CONTENTSTACK_MANAGEMENT_TOKEN, CONTENTSTACK_REGION } = process.env;
    const apiHost = CONTENTSTACK_REGION === 'eu' ? 'https://eu-api.contentstack.com' : 'https://api.contentstack.io';

    const response = await fetch(`${apiHost}/v3/assets`, {
      method: "POST",
      headers: {
        "api_key": CONTENTSTACK_API_KEY!,
        "authorization": CONTENTSTACK_MANAGEMENT_TOKEN!,
        ...form.getHeaders()
      },
      body: form,
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Contentstack Asset Upload Error:", errorData);
        throw new Error("Failed to upload asset to Contentstack.");
    }

    const data = await response.json();

    // Return the URL for preview and the UID for saving
    return NextResponse.json({
      success: true,
      url: data.asset.url,
      uid: data.asset.uid, // This is the ID we need to save in the entry
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}