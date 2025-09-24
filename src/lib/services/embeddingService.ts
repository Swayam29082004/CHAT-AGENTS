import axios, { isAxiosError } from "axios";

interface OpenAIEmbeddingItem {
  object: string;
  embedding: number[];
  index: number;
}

interface OpenAIEmbeddingResponse {
  data: OpenAIEmbeddingItem[];
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class EmbeddingService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY ?? "";
    this.model = "text-embedding-3-small";
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post<OpenAIEmbeddingResponse>(
        "https://api.openai.com/v1/embeddings",
        { input: texts, model: this.model },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data?.data?.map((item) => item.embedding) ?? [];
    } catch (err) {
      if (isAxiosError(err)) {
        console.error("OpenAI embeddings error:", err.response?.data || err.message);
      } else {
        console.error("Unexpected embeddings error:", err);
      }
      throw new Error("Failed to generate embeddings.");
    }
  }
}
