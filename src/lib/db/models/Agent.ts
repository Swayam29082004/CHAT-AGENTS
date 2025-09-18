import mongoose, { Document, Schema } from 'mongoose';

export interface AgentDoc extends Document {
  uuid: string;
  userId: mongoose.Types.ObjectId;
  provider: 'openai' | 'anthropic' | 'groq';
  modelName: string;
  apiKeyHash: string;
  token?: string;
  theme: { color: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<AgentDoc>(
  {
    uuid: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['openai', 'anthropic', 'groq'], required: true },
    modelName: { type: String, required: true },
    apiKeyHash: { type: String, required: true },
    token: { type: String },
    theme: { color: { type: String, default: '#4f46e5' } },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Agent = mongoose.models.Agent || mongoose.model<AgentDoc>('Agent', AgentSchema);

export default Agent;
