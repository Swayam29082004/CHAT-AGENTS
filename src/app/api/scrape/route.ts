import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import connectDB from "@/lib/db/mongodb";
import { DataProcessor } from "@/lib/services/dataProcessor";
import { EmbeddingService } from "@/lib/services/embeddingService";
import { PineconeService } from "@/lib/services/pineconeService";
import mongoose from "mongoose";
// Options to scrape a React/CSR website Tools like Puppeteer or Playwright
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
    
    // --- 1. SCRAPE ---
    const accountId = process.env.BRIGHT_DATA_ACCOUNT_ID;
    const zoneName = process.env.BRIGHT_DATA_ZONE_NAME;
    const apiToken = process.env.BRIGHT_DATA_API_TOKEN;

    if (!accountId || !zoneName || !apiToken) {
        return NextResponse.json({ error: "Scraping service is not configured." }, { status: 500 });
    }

    const username = `brd-customer-${accountId}-zone-${zoneName}`;
    const password = apiToken;
    const host = 'brd.superproxy.io';
    const port = 22225;

    const response = await axios.get(url, {
      proxy: { host, port, auth: { username, password }, protocol: 'http' },
    });

    // --- 2. CHUNK ---
    const processor = new DataProcessor();
    const chunks = processor.process(response.data, url);
    
    if (chunks.length === 0) {
        return NextResponse.json({ success: true, message: "No content was found to process." });
    }

    // --- 3. EMBED ---
    const embeddingService = new EmbeddingService();
    const chunkTexts = chunks.map(chunk => chunk.text);
    const embeddings = await embeddingService.generateEmbeddings(chunkTexts);

    // --- 4. PREPARE & STORE VECTORS ---
    const pineconeService = new PineconeService();
    const vectorsToUpsert = chunks.map((chunk, index) => ({
      id: chunk.id,
      values: embeddings[index],
      metadata: {
        userId: userId, 
        // ✅ This is the critical piece: the agentId is stored with the data
        agentId: agentId,
        sourceUrl: chunk.metadata.source,
        textSnippet: chunk.text.substring(0, 500),
      },
    }));

    await pineconeService.upsert(vectorsToUpsert);

    console.log(`[Scrape API] Stored ${chunks.length} vectors in Pinecone for agentId: ${agentId}.`);
    
    return NextResponse.json({ 
        success: true, 
        message: `Successfully processed and stored ${chunks.length} document chunks.`,
    });

  } catch (err: unknown) {
    console.error("[Scrape API] Full error object:", err);
     if (axios.isAxiosError(err)) {
        console.error("[Scrape API] Axios error response:", err.response?.data);
        return NextResponse.json(
          { error: "Failed to scrape the website.", details: err.response?.data?.message || err.message },
          { status: err.response?.status || 500 }
        );
    }
    return NextResponse.json(
      { error: "An error occurred during the scrape and embed process." },
      { status: 500 }
    );
  }
}

