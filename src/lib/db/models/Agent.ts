import mongoose, { Document, Schema } from "mongoose";

export interface AgentProgress {
  step0?: {
    apiKey: string;
    provider: "openai" | "anthropic" | "groq";
    model: string;
  };
  step1?: {
    agentName: string;
    avatar: string;
    color: string;
    welcomeMessage: string;
    placeholderText: string;
  };
  step2?: {
    scrapingEnabled: boolean;
  };
}

export interface AgentDoc extends Document {
  progress: AgentProgress;
}

const ProgressSchema = new Schema(
  {
    step0: {
      apiKey: String,
      provider: { type: String, enum: ["openai", "anthropic", "groq"] },
      model: String,
    },
    step1: {
      agentName: String,
      avatar: String,
      color: String,
      welcomeMessage: String,
      placeholderText: String,
    },
    step2: {
      scrapingEnabled: Boolean,
    },
  },
  { _id: false }
);

const AgentSchema = new Schema<AgentDoc>(
  {
    uuid: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: {
      type: String,
      enum: ["openai", "anthropic", "groq"],
      required: true,
    },
    modelName: { type: String, required: true },
    apiKeyEncrypted: { type: String, required: true },
    theme: { color: { type: String, default: "#4f46e5" } },
    isActive: { type: Boolean, default: true },
    progress: { type: ProgressSchema, default: {} },
  },
  { timestamps: true }
);

const Agent =
  mongoose.models.Agent || mongoose.model<AgentDoc>("Agent", AgentSchema);
export default Agent;