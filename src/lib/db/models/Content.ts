import mongoose, { Document, Schema } from 'mongoose';

export interface ContentDoc extends Document {
  userId: mongoose.Types.ObjectId;
  contentType: string;
  uuid: string;      // Contentstack Entry UID
  cssUuid: string;   // Contentstack Entry UID for CSS
}

const ContentSchema = new Schema<ContentDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentType: { type: String, required: true },
  uuid: { type: String, required: true },
  cssUuid: { type: String, required: true },
});

export default mongoose.models.Content || mongoose.model('Content', ContentSchema);
