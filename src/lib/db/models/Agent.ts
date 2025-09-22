// src/lib/db/models/Agent.ts
import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IAgent extends Document {
  userId: mongoose.Types.ObjectId;
  uuid: string;
  name: string;
  provider: string;
  modelName: string;
  avatar?: string;
  color?: string;
  welcomeMessage?: string;
  placeholderText?: string;
}

const AgentSchema = new Schema<IAgent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uuid: { type: String, unique: true, required: true, default: () => uuidv4() }, // ✅ fixed
    name: { type: String, required: true },
    provider: { type: String, required: true },
    modelName: { type: String, required: true },
    avatar: { type: String, default: "/PHOTO_AGENT.jpg" },
    color: { type: String, default: "#4f46e5" },
    welcomeMessage: { type: String, default: "Hello! How can I help you today?" },
    placeholderText: { type: String, default: "Ask a question..." },
  },
  { timestamps: true }
);

const Agent = mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);
export default Agent;
