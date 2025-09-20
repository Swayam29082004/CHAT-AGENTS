import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// This interface defines the structure of your agent document
export interface IAgent extends Document {
  userId: mongoose.Types.ObjectId;
  uuid: string;
  name: string;
  visibility: 'Public' | 'Private' | 'Unlisted';
  
  // Config
  provider?: "openai" | "anthropic" | "groq";
  modelName?: string; // Renamed from 'model' to avoid conflicts
  
  // Customization
  avatar: string;
  color: string;
  welcomeMessage: string;
  placeholderText: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // ✅ Use uuidv4 to automatically generate a unique ID on creation
    uuid: { type: String, unique: true, default: () => uuidv4() }, 
    name: { type: String, required: true, default: "Untitled Agent" },
    visibility: { 
      type: String, 
      enum: ['Public', 'Private', 'Unlisted'], 
      default: 'Private' 
    },
    provider: { type: String, enum: ["openai", "anthropic", "groq"] },
    modelName: { type: String },
    avatar: { type: String, default: "/PHOTO_AGENT.jpg" },
    color: { type: String, default: "#4f46e5" },
    welcomeMessage: { type: String, default: "Hello! How can I help you today?" },
    placeholderText: { type: String, default: "Ask a question..." },
  },
  { timestamps: true }
);

const Agent = mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);

export default Agent;