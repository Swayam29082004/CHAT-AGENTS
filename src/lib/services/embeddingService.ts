import axios, { isAxiosError } from 'axios';

// Define the structure of the response from the OpenAI API for better type safety
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
    this.model = 'text-embedding-3-small'; // Powerful and cost-effective model

    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured in environment variables.");
    }
  }

  /**
   * Generates vector embeddings for an array of texts.
   * @param texts An array of strings to be converted into embeddings.
   * @returns A promise that resolves to an array of vector embeddings.
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
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
        return response.data.data.map((item) => item.embedding);
      } else {
        return [];
      }
    } catch (error) {
      // Improve error handling by checking if the error is from Axios
      if (isAxiosError(error)) {
        console.error("Error generating OpenAI embeddings:", error.response?.data || error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
      throw new Error("Failed to generate vector embeddings.");
    }
  }
}