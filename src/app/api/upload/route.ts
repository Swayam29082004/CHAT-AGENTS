import { NextRequest, NextResponse } from "next/server";

function base64ToBuffer(base64: string) {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = Buffer.from(parts[1], "base64");
  return { buffer: raw, contentType };
}

export async function POST(req: NextRequest) {
  try {
    const { file: base64File }: { file: string } = await req.json();
    if (!base64File) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { buffer, contentType } = base64ToBuffer(base64File);


    const form = new FormData();
    form.append("asset[upload]", new Blob([buffer], { type: contentType }), `agent-avatar-${Date.now()}`);

    const { CONTENTSTACK_API_KEY, CONTENTSTACK_MANAGEMENT_TOKEN, CONTENTSTACK_REGION } = process.env;
    const apiHost =
      CONTENTSTACK_REGION === "eu"
        ? "https://eu-api.contentstack.com"
        : "https://api.contentstack.io";

    const response = await fetch(`${apiHost}/v3/assets`, {
      method: "POST",
      headers: {
        api_key: CONTENTSTACK_API_KEY ?? "",
        authorization: CONTENTSTACK_MANAGEMENT_TOKEN ?? ""
        
      },
      body: form
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Contentstack Asset Upload Error:", errorData);
      throw new Error("Failed to upload asset to Contentstack.");
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      url: data.asset.url,
      uid: data.asset.uid
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error uploading file.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
