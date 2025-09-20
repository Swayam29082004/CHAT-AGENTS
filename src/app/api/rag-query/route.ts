import { NextRequest, NextResponse } from "next/server";
import { EmbeddingService } from "@/lib/services/embeddingService";
import { PineconeService } from "@/lib/services/pineconeService";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { query, userId } = await req.json();

    if (!query || !userId) {
      return NextResponse.json({ error: "Query and userId are required" }, { status: 400 });
    }

    const embeddingService = new EmbeddingService();
    const queryEmbedding = (await embeddingService.generateEmbeddings([query]))[0];

    const pineconeService = new PineconeService();
    const queryResult = await pineconeService.query(queryEmbedding, 3, userId);
    
    const context = queryResult.map(match => {
        const metadata = match.metadata as { textSnippet?: string; sourceUrl?: string };
        return `- Content: ${metadata?.textSnippet || ''}`;
    }).join("\n\n");

    // ✅ --- NEW, SMARTER SYSTEM PROMPT --- ✅
    const systemPrompt = `You are an expert AI assistant. Your user has provided content from a website. Use ONLY the provided context below to answer the user's question.

CONTEXT:
${context}

---
INSTRUCTIONS:
1.  **If the user asks a specific question** (e.g., "what is the price of book X"), find the specific answer in the context and provide it directly.
2.  **If the user asks a general or vague question** (e.g., "tell me the book titles", "what is this about?"), summarize the relevant information from the context to provide a helpful response. For example, you can list the book titles you find.
3.  **If the context does NOT contain any relevant information** to answer the question, you must respond with exactly: "I could not find an answer in the provided documents."
4.  Do not use any prior knowledge or make up information. Do not mention source URLs.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.2,
    });

    const answer = completion.choices[0]?.message?.content;
    const sources = queryResult.map(match => {
        const metadata = match.metadata as { sourceUrl?: string };
        return { sourceUrl: metadata?.sourceUrl };
    });

    return NextResponse.json({
      success: true,
      answer,
      sources,
    });

  } catch (error: unknown) {
    console.error("[RAG Query API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to process RAG query.", details: errorMessage },
      { status: 500 }
    );
  }
}