import mongoose, { Document, Schema } from 'mongoose';

export interface IContentChunk extends Document {
  userId: mongoose.Types.ObjectId;
  sourceUrl: string;
  chunkId: string;
  text: string;
}

const ContentChunkSchema = new Schema<IContentChunk>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceUrl: { type: String, required: true },
  chunkId: { type: String, required: true, unique: true },
  text: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.ContentChunk || mongoose.model<IContentChunk>('ContentChunk', ContentChunkSchema);