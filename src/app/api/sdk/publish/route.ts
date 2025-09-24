// /src/app/api/sdk/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import connectDB from "@/lib/db/mongodb";
import Agent from "@/lib/db/models/Agent";

const execPromise = promisify(exec);

async function runCommand(command: string, cwd: string) {
  try {
    const { stdout, stderr } = await execPromise(command, { cwd });
    if (stderr) {
      console.warn(`[SDK PUBLISH] STDERR for '${command}':`, stderr);
    }
    console.log(`[SDK PUBLISH] STDOUT for '${command}':`, stdout);
    return { success: true, output: stdout };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Unknown error during command execution");
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { agentId, userId }: { agentId: string; userId: string } =
      await req.json();
    if (!agentId || !userId) {
      return NextResponse.json(
        { error: "Agent ID and User ID are required." },
        { status: 400 }
      );
    }
    const agent = await Agent.findOne({ _id: agentId, userId });
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found or no permission." },
        { status: 404 }
      );
    }
    const sdkDirectory = path.join(process.cwd(), "chat-sdk");
    const packageJsonPath = path.join(sdkDirectory, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const versionParts = packageJson.version.split(".").map(Number);
    versionParts[2] += 1;
    const newVersion = versionParts.join(".");
    packageJson.version = newVersion;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(
      `[SDK PUBLISH] Version bumped to ${newVersion} for agent ${agentId}`
    );
    await runCommand("npm install", sdkDirectory);
    await runCommand("npm run build", sdkDirectory);
    await runCommand("npm publish --access public", sdkDirectory);
    return NextResponse.json({
      success: true,
      message: `Published v${newVersion}`,
      version: newVersion,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to publish SDK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
