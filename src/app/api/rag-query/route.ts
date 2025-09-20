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
        return metadata?.textSnippet || '';
    }).join("\n\n");

    // --- PROMPT UPDATED WITH SPECIFIC FORMATTING RULE ---
    const systemPrompt = `You are a factual answering engine. Your instructions are:
1. Answer the user's question directly and concisely using ONLY the provided context.
2. When you refer to the main subject of the user's question in your answer, enclose it in double quotes. For example: The price of "Soumission" is £50.10.
3. Do not add any conversational phrases, greetings, or explanations.
4. If the context does not contain the answer, reply ONLY with the text: "I could not find an answer in the provided documents."

CONTEXT:
${context}`;

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