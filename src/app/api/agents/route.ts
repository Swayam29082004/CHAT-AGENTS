// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/db/mongodb";
// import Agent from "@/lib/db/models/Agent";
// import mongoose from "mongoose";

// // ✅ CREATE (POST)
// export async function POST(
//   req: NextRequest,
//   context: { params: { uuid: string } }
// ) {
//   try {
//     await connectDB();
//     const { uuid } = context.params;
//     const body = await req.json();
//     const { name, provider, modelName, avatar, color, welcomeMessage, placeholderText, visibility } = body;

//     if (!uuid || !name || !provider || !modelName) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     if (!mongoose.Types.ObjectId.isValid(uuid)) {
//       return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
//     }

//     const newAgent = await Agent.create({
//       userId: uuid,
//       name,
//       provider,
//       modelName,
//       avatar,
//       color,
//       welcomeMessage,
//       placeholderText,
//       visibility: visibility || "Private",
//     });

//     return NextResponse.json({ success: true, agent: newAgent }, { status: 201 });
//   } catch (err: any) {
//     console.error("Agent creation error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // ✅ READ ALL (GET)
// export async function GET(
//   req: NextRequest,
//   context: { params: { uuid: string } }
// ) {
//   try {
//     await connectDB();
//     const { uuid } = context.params;

//     if (!uuid) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

//     const agents = await Agent.find({ userId: uuid }).lean();
//     return NextResponse.json({ success: true, agents });
//   } catch (err: any) {
//     console.error("Agent fetch error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // ✅ UPDATE (PATCH)
// export async function PATCH(
//   req: NextRequest,
//   context: { params: { uuid: string } }
// ) {
//   try {
//     await connectDB();
//     const { uuid } = context.params;
//     const body = await req.json();

//     if (!uuid) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

//     // expects body to contain agentId + fields to update
//     const { agentId, ...updates } = body;

//     if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 });

//     const updatedAgent = await Agent.findOneAndUpdate(
//       { _id: agentId, userId: uuid },
//       { $set: updates },
//       { new: true }
//     );

//     if (!updatedAgent) {
//       return NextResponse.json({ error: "Agent not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, agent: updatedAgent });
//   } catch (err: any) {
//     console.error("Agent update error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // ✅ DELETE
// export async function DELETE(
//   req: NextRequest,
//   context: { params: { uuid: string } }
// ) {
//   try {
//     await connectDB();
//     const { uuid } = context.params;
//     const { searchParams } = new URL(req.url);
//     const agentId = searchParams.get("agentId");

//     if (!uuid || !agentId) {
//       return NextResponse.json({ error: "Missing userId or agentId" }, { status: 400 });
//     }

//     const deletedAgent = await Agent.findOneAndDelete({ _id: agentId, userId: uuid });

//     if (!deletedAgent) {
//       return NextResponse.json({ error: "Agent not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, message: "Agent deleted" });
//   } catch (err: any) {
//     console.error("Agent delete error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
