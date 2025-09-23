import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { chromium } from "playwright";  // <-- add Playwright
import connectDB from "@/lib/db/mongodb";
import { DataProcessor } from "@/lib/services/dataProcessor";
import { EmbeddingService } from "@/lib/services/embeddingService";
import { PineconeService } from "@/lib/services/pineconeService";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { url, userId, agentId } = await req.json();

    if (!url || !userId || !agentId) {
      return NextResponse.json({ error: "URL, userId, and agentId are required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(agentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    let htmlContent: string | null = null;

    // --- 1. Try Axios + BrightData Proxy (static/SSR path) ---
    try {
      const accountId = process.env.BRIGHT_DATA_ACCOUNT_ID;
      const zoneName = process.env.BRIGHT_DATA_ZONE_NAME;
      const apiToken = process.env.BRIGHT_DATA_API_TOKEN;

      if (!accountId || !zoneName || !apiToken) {
        console.warn("[Scrape API] BrightData not configured, skipping proxy");
      } else {
        const username = `brd-customer-${accountId}-zone-${zoneName}`;
        const password = apiToken;
        const host = "brd.superproxy.io";
        const port = 22225;

        const response = await axios.get(url, {
          proxy: { host, port, auth: { username, password }, protocol: "http" },
          timeout: 15000,
        });
        htmlContent = response.data;
      }
    } catch (err) {
      console.warn(`[Scrape API] Axios fetch failed for ${url}, will fallback to Playwright`);
    }

    // --- 2. If Axios result is empty or short → fallback to Playwright (React/CSR path) ---
    if (!htmlContent || htmlContent.length < 1000) {
      console.log(`[Scrape API] Falling back to Playwright for ${url}`);
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      htmlContent = await page.content();
      await browser.close();
    }

    // --- 3. Process into chunks ---
    const processor = new DataProcessor();
    const chunks = processor.process(htmlContent, url);
    if (chunks.length === 0) {
      return NextResponse.json({ success: true, message: "No content was found to process." });
    }

    // --- 4. Embed with OpenAI ---
    const embeddingService = new EmbeddingService();
    const embeddings = await embeddingService.generateEmbeddings(chunks.map((c) => c.text));

    // --- 5. Store in Pinecone ---
    const pineconeService = new PineconeService();
    const vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      values: embeddings[i],
      metadata: {
        userId,
        agentId,
        sourceUrl: chunk.metadata.source,
        textSnippet: chunk.text.substring(0, 500),
      },
    }));
    await pineconeService.upsert(vectors);

    console.log(`[Scrape API] Stored ${chunks.length} vectors in Pinecone for agentId: ${agentId}`);
    return NextResponse.json({
      success: true,
      message: `Successfully scraped and stored ${chunks.length} chunks.`,
    });
  } catch (err: unknown) {
    console.error("[Scrape API] Error:", err);
    return NextResponse.json(
      { error: "Failed to scrape website.", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
