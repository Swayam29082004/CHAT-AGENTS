import { NextRequest, NextResponse } from "next/server";
import { EmbeddingService } from "@/lib/services/embeddingService";
import { PineconeService } from "@/lib/services/pineconeService";
import OpenAI from "openai";
import { type RecordMetadata, type ScoredPineconeRecord } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query, agentId }: { query: string; agentId: string } = await req.json();

    if (!query || !agentId) {
      return NextResponse.json({ error: "Query and agentId are required" }, { status: 400 });
    }

    const embeddingService = new EmbeddingService();
    const queryEmbedding = (await embeddingService.generateEmbeddings([query]))[0];

    const pineconeService = new PineconeService();
    const queryResult: ScoredPineconeRecord<RecordMetadata>[] = await pineconeService.queryByAgentId(
      queryEmbedding,
      5,
      agentId
    );

    if (!queryResult || queryResult.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "I could not find an answer in the provided documents.",
        sources: []
      });
    }

    const context = queryResult
      .map((match, i) => {
        const metadata = match.metadata as { textSnippet?: string; sourceUrl?: string; title?: string };
        return `[[S${i + 1}]] ${metadata?.title || ""} ${metadata?.textSnippet || ""}`;
      })
      .join("\n\n");

    const systemPrompt = `You are an expert AI assistant. Use ONLY the provided CONTEXT below to answer the user's question.

RULES:
1. If the question has a direct answer in the context, return it concisely.
2. If the question is general, provide a short helpful summary.
3. If the context does NOT contain relevant information, respond with:
   "I could not find an answer in the provided documents."
4. NEVER use prior knowledge or make up answers.
5. Refer to information with inline tags like [S1], [S2].

CONTEXT:
${context}
---`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    const sources = queryResult.map((match, i) => {
      const metadata = match.metadata as { sourceUrl?: string; title?: string };
      return { id: `S${i + 1}`, sourceUrl: metadata?.sourceUrl, title: metadata?.title || null };
    });

    return NextResponse.json({ success: true, answer, sources });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process RAG query.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
