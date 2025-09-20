import { pineconeIndex } from './pinecone-client';
import { type RecordMetadata, type ScoredPineconeRecord } from '@pinecone-database/pinecone';

export class PineconeService {
  /**
   * Upserts vectors into the Pinecone index.
   */
  async upsert(vectors: { id: string; values: number[]; metadata?: RecordMetadata }[]) {
    if (!vectors || vectors.length === 0) {
      console.log("No vectors to upsert.");
      return;
    }

    try {
      // Upsert in batches for better performance
      for (let i = 0; i < vectors.length; i += 100) {
        const batch = vectors.slice(i, i + 100);
        await pineconeIndex.upsert(batch);
      }
      console.log(`Successfully upserted ${vectors.length} vectors into Pinecone.`);
    } catch (error) {
      console.error("Error upserting vectors to Pinecone:", error);
      throw new Error("Failed to store vectors in Pinecone.");
    }
  }

  /**
   * Queries the Pinecone index to find vectors similar to the query vector.
   * @param queryEmbedding The vector embedding of the user's query.
   * @param topK The number of similar results to return.
   * @param userId The ID of the user to filter results for.
   * @returns A promise that resolves to an array of the most similar records.
   */
  async query(queryEmbedding: number[], topK: number, userId: string): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
    try {
      const queryResult = await pineconeIndex.query({
        vector: queryEmbedding,
        topK,
        // Filter results to only include vectors associated with the specific user
        filter: {
          userId: { '$eq': userId }
        },
      });
      
      return queryResult.matches || [];

    } catch (error) {
      console.error("Error querying Pinecone:", error);
      throw new Error("Failed to query vectors from Pinecone.");
    }
  }
}