import { pineconeIndex } from './pinecone-client';
import { type RecordMetadata, type ScoredPineconeRecord } from '@pinecone-database/pinecone';

export class PineconeService {
  async upsert(vectors: { id: string; values: number[]; metadata?: RecordMetadata }[]) {
    if (!vectors || vectors.length === 0) {
      console.log("No vectors to upsert.");
      return;
    }
    try {
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
   * ✅ Queries the index to find vectors filtered by a specific agent ID.
   */
  async queryByAgentId(
    queryEmbedding: number[],
    topK: number,
    agentId: string
  ): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
    try {
      const queryResult = await pineconeIndex.query({
        vector: queryEmbedding,
        topK,
        filter: {
          agentId: { '$eq': agentId },
        },
        includeMetadata: true,
      });

      return queryResult.matches || [];
    } catch (error) {
      console.error("Error querying Pinecone by agentId:", error);
      throw new Error("Failed to query vectors from Pinecone.");
    }
  }
}
