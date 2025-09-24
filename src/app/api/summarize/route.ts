import { NextRequest, NextResponse } from "next/server";
import axios, { isAxiosError } from "axios";
import { DataProcessor } from "@/lib/services/dataProcessor";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { url }: { url: string } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. Scrape website content with BrightData
    const { BRIGHT_DATA_ACCOUNT_ID, BRIGHT_DATA_ZONE_NAME, BRIGHT_DATA_API_TOKEN } = process.env;
    if (!BRIGHT_DATA_ACCOUNT_ID || !BRIGHT_DATA_ZONE_NAME || !BRIGHT_DATA_API_TOKEN) {
      return NextResponse.json({ error: "Scraping service is not configured." }, { status: 500 });
    }
    const username = `brd-customer-${BRIGHT_DATA_ACCOUNT_ID}-zone-${BRIGHT_DATA_ZONE_NAME}`;
    const scrapeResponse = await axios.get(url, {
      proxy: { host: "brd.superproxy.io", port: 22225, auth: { username, password: BRIGHT_DATA_API_TOKEN }, protocol: "http" }
    });
    const htmlContent = scrapeResponse.data;

    // 2. Process & extract readable text
    const processor = new DataProcessor();
    const cleanText = processor
      .process(htmlContent, url)
      .map((chunk) => chunk.text)
      .join(" ");

    if (!cleanText || cleanText.trim().length === 0) {
      return NextResponse.json({ error: "No readable text extracted from URL." }, { status: 400 });
    }

    // 3. Summarize with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert assistant that provides clear and concise summaries of web page content." },
        { role: "user", content: `Summarize this page (${url}):\n\n"${cleanText.substring(0, 4000)}"` }
      ],
      temperature: 0.3,
      max_tokens: 250
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    return NextResponse.json({ success: true, summary });
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      return NextResponse.json(
        { error: "Failed to scrape website.", details: err.message },
        { status: err.response?.status || 500 }
      );
    }
    const msg = err instanceof Error ? err.message : "Unexpected error generating summary.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
