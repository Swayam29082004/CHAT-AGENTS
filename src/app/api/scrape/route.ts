import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { chromium } from "playwright";
import connectDB from "@/lib/db/mongodb";
import { DataProcessor } from "@/lib/services/dataProcessor";
import { EmbeddingService } from "@/lib/services/embeddingService";
import { PineconeService } from "@/lib/services/pineconeService";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { url, userId, agentId }: { url: string; userId: string; agentId: string } = await req.json();

    if (!url || !userId || !agentId) {
      return NextResponse.json({ error: "URL, userId, and agentId are required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(agentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    let htmlContent: string | null = null;

    // 1. Try BrightData proxy (static/SSR path)
    try {
      const { BRIGHT_DATA_ACCOUNT_ID, BRIGHT_DATA_ZONE_NAME, BRIGHT_DATA_API_TOKEN } = process.env;
      if (BRIGHT_DATA_ACCOUNT_ID && BRIGHT_DATA_ZONE_NAME && BRIGHT_DATA_API_TOKEN) {
        const username = `brd-customer-${BRIGHT_DATA_ACCOUNT_ID}-zone-${BRIGHT_DATA_ZONE_NAME}`;
        const response = await axios.get(url, {
          proxy: { host: "brd.superproxy.io", port: 22225, auth: { username, password: BRIGHT_DATA_API_TOKEN }, protocol: "http" },
          timeout: 15000
        });
        htmlContent = response.data;
      }
    } catch {
      console.warn(`[Scrape API] BrightData failed, falling back to Playwright`);
    }

    // 2. Fallback to Playwright if needed (CSR path)
    if (!htmlContent || htmlContent.length < 1000) {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      htmlContent = await page.content();
      await browser.close();
    }

    // 3. Process chunks
    const processor = new DataProcessor();
    const chunks = processor.process(htmlContent, url);
    if (chunks.length === 0) {
      return NextResponse.json({ success: true, message: "No content to process." });
    }

    // 4. Generate embeddings
    const embeddingService = new EmbeddingService();
    const embeddings = await embeddingService.generateEmbeddings(chunks.map((c) => c.text));

    // 5. Store in Pinecone
    const pineconeService = new PineconeService();
    const vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      values: embeddings[i],
      metadata: {
        userId,
        agentId,
        sourceUrl: chunk.metadata.source,
        textSnippet: chunk.text.substring(0, 500)
      }
    }));
    await pineconeService.upsert(vectors);

    return NextResponse.json({
      success: true,
      message: `Scraped and stored ${chunks.length} chunks.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to scrape website.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
