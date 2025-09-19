import axios, { isAxiosError } from 'axios';

// 1. Define the structure of the response from the OpenAI API
// This tells TypeScript exactly what to expect.
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
    this.apiKey = process.env.OPENAI_API_KEY!;
    this.model = 'text-embedding-3-small';

    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured in environment variables.");
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // 2. Apply the 'OpenAIEmbeddingResponse' type to the axios post request.
      const response = await axios.post<OpenAIEmbeddingResponse>(
        'https://api.openai.com/v1/embeddings',
        {
          input: texts,
          model: this.model,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.data) {
        // 3. The 'item' is now correctly typed as 'OpenAIEmbeddingItem'.
        return response.data.data.map((item) => item.embedding);
      } else {
        return [];
      }
    } catch (error) {
      // 4. Improve error handling by checking if the error is from Axios.
      // This gives us access to more specific error information.
      if (isAxiosError(error)) {
        console.error("Error generating OpenAI embeddings:", error.response?.data || error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
      throw new Error("Failed to generate vector embeddings.");
    }
  }
}