import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // ✅ Example: fetch raw HTML (replace with your real scraping logic)
    const res = await fetch(url);
    const html = await res.text();

    // For now, return first 500 chars (to avoid huge payloads)
    return NextResponse.json({ content: html.slice(0, 500) + "..." });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to scrape website" },
      { status: 500 }
    );
  }
}
