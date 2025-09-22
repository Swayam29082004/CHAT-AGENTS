import { NextRequest, NextResponse } from "next/server";
import { EmbeddingService } from "@/lib/services/embeddingService";
import { PineconeService } from "@/lib/services/pineconeService";
import OpenAI from "openai";
import { type RecordMetadata, type ScoredPineconeRecord } from "@pinecone-database/pinecone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { query, agentId } = await req.json();

    if (!query || !agentId) {
      return NextResponse.json({ error: "Query and agentId are required" }, { status: 400 });
    }

    const embeddingService = new EmbeddingService();
    const queryEmbedding = (await embeddingService.generateEmbeddings([query]))[0];

    const pineconeService = new PineconeService();
    // ✅ Call queryByAgentId instead of query
    const queryResult: ScoredPineconeRecord<RecordMetadata>[] =
      await pineconeService.queryByAgentId(queryEmbedding, 5, agentId);

    if (!queryResult || queryResult.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "I could not find an answer in the provided documents.",
        sources: [],
      });
    }

    // ✅ Build richer context for the model
    const context = queryResult
      .map((match: ScoredPineconeRecord<RecordMetadata>, i: number) => {
        const metadata = match.metadata as {
          textSnippet?: string;
          sourceUrl?: string;
          title?: string;
        };
        return `[[S${i + 1}]] ${metadata?.title || ""} ${metadata?.textSnippet || ""}`;
      })
      .join("\n\n");

    const systemPrompt = `You are an expert AI assistant. Use ONLY the provided CONTEXT below to answer the user's question.

RULES:
1. If the question has a **direct answer in the context** (e.g. "What is the price of X?"), return it concisely.
2. If the question is **general** (e.g. "summarize", "list books"), provide a short helpful summary of the content.
3. If the context does NOT contain relevant information, respond exactly with:
   "I could not find an answer in the provided documents."
4. NEVER use prior knowledge or make up answers.
5. Refer to information with inline tags like [S1], [S2] to show where it came from.

CONTEXT:
${context}
---
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    const sources = queryResult.map(
      (match: ScoredPineconeRecord<RecordMetadata>, i: number) => {
        const metadata = match.metadata as {
          sourceUrl?: string;
          title?: string;
        };
        return {
          id: `S${i + 1}`,
          sourceUrl: metadata?.sourceUrl,
          title: metadata?.title || null,
        };
      }
    );

    return NextResponse.json({
      success: true,
      answer,
      sources,
    });
  } catch (error: unknown) {
    console.error("[RAG Query API] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to process RAG query.", details: errorMessage },
      { status: 500 }
    );
  }
}
