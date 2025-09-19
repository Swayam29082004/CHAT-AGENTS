import { pineconeIndex } from './pinecone-client';
import { type RecordMetadata } from '@pinecone-database/pinecone';

export class PineconeService {
  async upsert(vectors: { id: string; values: number[]; metadata?: RecordMetadata }[]) {
    if (!vectors || vectors.length === 0) {
      console.log("No vectors to upsert.");
      return;
    }

    try {
      await pineconeIndex.upsert(vectors);
      console.log(`Successfully upserted ${vectors.length} vectors into Pinecone.`);
    } catch (error) {
      console.error("Error upserting vectors to Pinecone:", error);
      throw new Error("Failed to store vectors in Pinecone.");
    }
  }
}