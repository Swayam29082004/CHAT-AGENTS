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

    // 1. Create Embedding for the User's Query
    const embeddingService = new EmbeddingService();
    const queryEmbedding = (await embeddingService.generateEmbeddings([query]))[0];

    // 2. Query Pinecone for Similar Context
    const pineconeService = new PineconeService();
    // Retrieve the top 3 most relevant chunks of text for the user
    const queryResult = await pineconeService.query(queryEmbedding, 3, userId);
    
    // 3. Construct the Augmented Prompt
    const context = queryResult.map(match => {
        const metadata = match.metadata as { textSnippet?: string; sourceUrl?: string };
        return `- Source: ${metadata?.sourceUrl || 'N/A'}\n- Content: ${metadata?.textSnippet || ''}`;
    }).join("\n\n");

    const systemPrompt = `You are a helpful AI assistant. Your user has scraped content from various websites, which is stored in a vector database.
Use the provided context below to answer the user's question.
- If the context contains the answer, use it and cite the source URL.
- If the context does not contain the answer, state that you couldn't find the information in the provided documents.
- Do not make up answers.

CONTEXT:
${context}`;

    // 4. Generate the Final Response with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // A powerful and fast model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.5,
    });

    const answer = completion.choices[0]?.message?.content;
    const sources = queryResult.map(match => match.metadata as { sourceUrl?: string });

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