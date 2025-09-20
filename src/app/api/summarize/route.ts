import { NextRequest, NextResponse } from "next/server";
import axios, { isAxiosError } from 'axios';
import { DataProcessor } from "@/lib/services/dataProcessor";
import OpenAI from "openai";

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    
    // --- 1. SCRAPE WEBSITE CONTENT ---
    // Using the same robust Bright Data proxy setup
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

    const scrapeResponse = await axios.get(url, {
      proxy: { host, port, auth: { username, password }, protocol: 'http' },
    });
    const htmlContent = scrapeResponse.data;

    // --- 2. PROCESS AND EXTRACT TEXT ---
    const processor = new DataProcessor();
    // The process method returns chunks; we join them to get the full text.
    const cleanText = processor.process(htmlContent, url)
                               .map(chunk => chunk.text)
                               .join(" ");
    
    if (!cleanText || cleanText.trim().length === 0) {
        return NextResponse.json({ error: "Could not extract any readable text from the URL." }, { status: 400 });
    }

    // --- 3. SUMMARIZE WITH OPENAI ---
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Cost-effective model for summarization
      messages: [
        {
          role: "system",
          content: "You are an expert assistant that provides clear, concise, and easy-to-read summaries of web page content.",
        },
        {
          role: "user",
          // Truncate text to stay within model context limits
          content: `Please summarize the following text from the website ${url}:\n\n"${cleanText.substring(0, 4000)}"`,
        },
      ],
      temperature: 0.3, // Lower temperature for more factual summaries
      max_tokens: 250,  // Limit the length of the summary
    });

    const summary = completion.choices[0]?.message?.content;

    return NextResponse.json({ 
        success: true, 
        summary: summary,
    });

  } catch (err: unknown) {
    console.error("[Summarize API] Error:", err);

    if (isAxiosError(err)) {
        return NextResponse.json(
          { error: "Failed to scrape the website for summarization.", details: err.message },
          { status: err.response?.status || 500 }
        );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred while generating the summary." },
      { status: 500 }
    );
  }
}