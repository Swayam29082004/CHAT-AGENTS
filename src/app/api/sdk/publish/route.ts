import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";
// You might need a way to get the authenticated user ID here
// For this example, we'll assume a placeholder function
// import { getUserIdFromRequest } from "@/lib/auth";

const execPromise = promisify(exec);

async function runCommand(command: string, cwd: string) {
  try {
    const { stdout, stderr } = await execPromise(command, { cwd });
    if (stderr) {
      console.warn(`[SDK PUBLISH] STDERR for '${command}':`, stderr);
    }
    console.log(`[SDK PUBLISH] STDOUT for '${command}':`, stdout);
    return { success: true, output: stdout };
  } catch (error: any) {
    console.error(`[SDK PUBLISH] Error executing '${command}':`, error);
    throw new Error(error.stderr || error.stdout || error.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { agentId, userId } = body; // Assume userId is passed for verification

    if (!agentId || !userId) {
      return NextResponse.json({ error: "Agent ID and User ID are required." }, { status: 400 });
    }
    
    // 1. Authenticate and verify ownership (CRITICAL)
    const agent = await Agent.findOne({ _id: agentId, userId: userId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found or you do not have permission." }, { status: 404 });
    }

    const sdkDirectory = path.join(process.cwd(), "chat-sdk");
    const packageJsonPath = path.join(sdkDirectory, "package.json");

    // 2. Read and update package.json version
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const currentVersion = packageJson.version;
    const versionParts = currentVersion.split(".").map(Number);
    versionParts[2] += 1; // Increment patch version (e.g., 1.0.0 -> 1.0.1)
    const newVersion = versionParts.join(".");
    packageJson.version = newVersion;
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`[SDK PUBLISH] Version bumped to ${newVersion} for agent ${agentId}`);

    // 3. Run build and publish commands sequentially
    console.log("[SDK PUBLISH] Installing dependencies...");
    await runCommand("npm install", sdkDirectory);
    
    console.log("[SDK PUBLISH] Building SDK...");
    await runCommand("npm run build", sdkDirectory);

    console.log("[SDK PUBLISH] Publishing to NPM...");
    await runCommand("npm publish --access public", sdkDirectory);

    return NextResponse.json({
      success: true,
      message: `Successfully published version ${newVersion} to NPM!`,
      version: newVersion,
    });

  } catch (error: any) {
    console.error("[SDK PUBLISH] A critical error occurred:", error);
    return NextResponse.json({
      error: "Failed to publish SDK.",
      details: error.message,
    }, { status: 500 });
  }
}
