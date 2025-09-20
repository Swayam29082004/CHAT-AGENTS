import * as cheerio from 'cheerio';

export interface ContentChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
  };
}

export class DataProcessor {
  // Increased chunk size for better context
  private maxChunkSize: number;
  private overlapSize: number;

  constructor(maxChunkSize = 2000, overlapSize = 200) {
    this.maxChunkSize = maxChunkSize;
    this.overlapSize = overlapSize;
  }

  public process(html: string, sourceUrl: string): ContentChunk[] {
    const cleanText = this.extractTextFromHtml(html);
    const textChunks = this.chunkText(cleanText);

    return textChunks.map((text, index) => ({
      id: `${sourceUrl}_chunk_${index}`,
      text: text,
      metadata: {
        source: sourceUrl,
        chunkIndex: index,
      },
    }));
  }

  private extractTextFromHtml(html: string): string {
    const $ = cheerio.load(html);
    // Remove common non-content elements
    $('script, style, nav, footer, header, aside, form, noscript').remove();
    const mainContent = $('body').text();
    // Consolidate whitespace
    return mainContent.replace(/\s\s+/g, ' ').trim();
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    if (!text) {
      return chunks;
    }

    let startIndex = 0;
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + this.maxChunkSize, text.length);
      chunks.push(text.slice(startIndex, endIndex));
      startIndex += this.maxChunkSize - this.overlapSize;
      if (endIndex === text.length) {
        break;
      }
    }
    return chunks;
  }
}