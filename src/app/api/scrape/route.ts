import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import connectDB from "@/lib/db/mongodb";
import { DataProcessor } from "@/lib/services/dataProcessor";
import { EmbeddingService } from "@/lib/services/embeddingService"; 
import { PineconeService } from "@/lib/services/pineconeService";
import ContentChunk from "@/lib/db/models/ContentChunk";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { url, userId } = await req.json();

    if (!url || !userId) {
      return NextResponse.json({ error: "URL and userId are required" }, { status: 400 });
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
    const port = 33335;
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

    // --- 4. STORE METADATA IN MONGODB ---
    const chunkDocumentsToStore = chunks.map(chunk => ({
        userId: userId,
        sourceUrl: chunk.metadata.source,
        chunkId: chunk.id,
        text: chunk.text,
    }));
    const storedDocuments = await ContentChunk.insertMany(chunkDocumentsToStore);

    // --- 5. PREPARE & STORE VECTORS IN PINECONE ---
    const pineconeService = new PineconeService();
    const vectorsToUpsert = storedDocuments.map((doc, index) => ({
      id: doc._id.toString(),
      values: embeddings[index],
      metadata: {
        sourceUrl: doc.sourceUrl,
        textSnippet: doc.text.substring(0, 200),
      },
    }));

    await pineconeService.upsert(vectorsToUpsert);

    console.log(`[Scrape API] Stored ${storedDocuments.length} chunks in MongoDB and Pinecone.`);
    
    return NextResponse.json({ 
        success: true, 
        message: `Successfully processed and stored ${storedDocuments.length} document chunks.`,
        summary: chunks[0].text.slice(0, 500) + '...',
    });

  } catch (err: unknown) { // <-- Better type than 'any'
    console.error("[Scrape API] Full error object:", err);
    return NextResponse.json(
      { error: "An error occurred during the scrape and embed process." },
      { status: 500 }
    );
  }
}