import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Agent, { IAgent } from "@/lib/db/models/Agent";
import mongoose from "mongoose";

// A specific type for the PATCH request body for better type safety
type PatchRequestBody = Partial<IAgent> & {
  agentId: string;
};

// CREATE A NEW AGENT
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId:string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params;
    const body = await req.json();

    const {
      name,
      provider,
      modelName,
      avatar,
      avatarAssetUid,
      color,
      welcomeMessage,
      placeholderText,
    } = body;

    if (!name || !provider || !modelName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(userId.trim())) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    // This map ensures the value sent to Contentstack matches its enum choices
    const providerMap: Record<string, string> = {
      openai: "OpenAI",
      groq: "Groq",
      anthropic: "Anthropic",
      google: "Google",
    };

    const contentstackPayload = {
      entry: {
        title: name,
        provider: providerMap[provider.toLowerCase()] || provider,
        model_name: modelName,
        theme_color: color,
        welcome_message: welcomeMessage,
        placeholder_text: placeholderText,
        avatar: avatarAssetUid,
        user_id: userId,
      },
    };
    
    const { 
        CONTENTSTACK_API_KEY, 
        CONTENTSTACK_MANAGEMENT_TOKEN, 
        CONTENTSTACK_AGENT_CT_UID,
        CONTENTSTACK_REGION 
    } = process.env;
    
    const apiHost = CONTENTSTACK_REGION === 'eu' ? 'https://eu-api.contentstack.com' : 'https://api.contentstack.io';

    const csResponse = await fetch(`${apiHost}/v3/content_types/${CONTENTSTACK_AGENT_CT_UID}/entries`, {
        method: "POST",
        headers: {
            "api_key": CONTENTSTACK_API_KEY!,
            "authorization": CONTENTSTACK_MANAGEMENT_TOKEN!,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(contentstackPayload),
    });

    if (!csResponse.ok) {
        const errorData = await csResponse.json();
        console.error("Contentstack API Error:", errorData);
        throw new Error("Failed to create agent entry in Contentstack.");
    }
    
    const csData = await csResponse.json();
    const contentstackUid = csData.entry.uid;

    const newAgent = await Agent.create({
      userId: userId.trim(),
      name,
      provider,
      modelName,
      avatar,
      color,
      welcomeMessage,
      placeholderText,
      contentstackUid,
    });

    return NextResponse.json({ success: true, agent: newAgent }, { status: 201 });
    
  } catch (err: unknown) {
    console.error("Agent creation error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET ALL AGENTS FOR A USER
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(userId.trim())) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    const agents = await Agent.find({ userId: userId.trim() }).lean();
    return NextResponse.json({ success: true, agents });
  } catch (err: unknown) {
    console.error("Agent fetch error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// UPDATE AN AGENT
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params;
    const body: PatchRequestBody = await req.json();
    
    const { agentId, ...updates } = body;

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }

    const agentToUpdate = await Agent.findOne({ _id: agentId, userId });
    if (!agentToUpdate || !agentToUpdate.contentstackUid) {
        return NextResponse.json({ error: "Agent not found or is not synced with Contentstack." }, { status: 404 });
    }

    const contentstackPayload = {
      entry: {
        title: updates.name,
        theme_color: updates.color,
        welcome_message: updates.welcomeMessage,
        placeholder_text: updates.placeholderText,
      },
    };
    
    const { 
        CONTENTSTACK_API_KEY, 
        CONTENTSTACK_MANAGEMENT_TOKEN, 
        CONTENTSTACK_AGENT_CT_UID,
        CONTENTSTACK_REGION 
    } = process.env;
    const apiHost = CONTENTSTACK_REGION === 'eu' ? 'https://eu-api.contentstack.com' : 'https://api.contentstack.io';
    
    const csResponse = await fetch(`${apiHost}/v3/content_types/${CONTENTSTACK_AGENT_CT_UID}/entries/${agentToUpdate.contentstackUid}`, {
        method: "PUT",
        headers: {
            "api_key": CONTENTSTACK_API_KEY!,
            "authorization": CONTENTSTACK_MANAGEMENT_TOKEN!,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(contentstackPayload),
    });

    if (!csResponse.ok) {
        const errorData = await csResponse.json();
        console.error("Contentstack Update Error:", errorData);
        throw new Error("Failed to update agent entry in Contentstack.");
    }

    const updatedAgent = await Agent.findByIdAndUpdate(
      agentId,
      { $set: updates },
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json({ error: "Agent not found in MongoDB after Contentstack update." }, { status: 404 });
    }

    return NextResponse.json({ success: true, agent: updatedAgent });

  } catch (err: unknown) {
    console.error("Agent update error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE AN AGENT
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await context.params;
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }
    
    const agentToDelete = await Agent.findOne({ _id: agentId, userId });
    if (!agentToDelete) {
        return NextResponse.json({ error: "Agent not found or you don't have permission." }, { status: 404 });
    }

    // Delete from Contentstack first
    if (agentToDelete.contentstackUid) {
        const { CONTENTSTACK_API_KEY, CONTENTSTACK_MANAGEMENT_TOKEN, CONTENTSTACK_AGENT_CT_UID, CONTENTSTACK_REGION } = process.env;
        const apiHost = CONTENTSTACK_REGION === 'eu' ? 'https://eu-api.contentstack.com' : 'https://api.contentstack.io';
        
        await fetch(`${apiHost}/v3/content_types/${CONTENTSTACK_AGENT_CT_UID}/entries/${agentToDelete.contentstackUid}`, {
            method: "DELETE",
            headers: {
                "api_key": CONTENTSTACK_API_KEY!,
                "authorization": CONTENTSTACK_MANAGEMENT_TOKEN!,
            },
        });
        // We don't throw an error if this fails; maybe it was already deleted.
    }

    // Then delete from MongoDB
    await Agent.findByIdAndDelete(agentId);

    return NextResponse.json({ success: true, message: "Agent deleted successfully." });

  } catch (err: unknown) {
    console.error("Agent delete error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}