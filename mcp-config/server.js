// server.mjs
import dotenv from "dotenv";
import { BrightDataMCPServer } from "@brightdata/mcp-server";

dotenv.config();

const API_KEY = process.env.BRIGHT_DATA_API_KEY;
const ZONE_ID = process.env.BRIGHT_DATA_ZONE_ID;
const PORT = process.env.PORT || 3000;

if (!API_KEY || !ZONE_ID) {
  console.error("Missing env vars. Please set BRIGHT_DATA_API_KEY and BRIGHT_DATA_ZONE_ID.");
  process.exit(1);
}

async function start() {
  try {
    const server = new BrightDataMCPServer({
      apiKey: API_KEY,
      zoneId: ZONE_ID,
      port: Number(PORT),
    });

    await Promise.resolve(server.start && server.start());
    console.log(`[MCP] BrightData MCP Server started for zone ${ZONE_ID} (port ${PORT})`);

    const stop = async () => {
      console.log("[MCP] Shutting down...");
      try {
        await Promise.resolve(server.stop && server.stop());
      } catch (err) {
        console.error("[MCP] Error during stop:", err);
      }
      process.exit(0);
    };

    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
    process.on("uncaughtException", (err) => {
      console.error("uncaughtException", err);
      stop();
    });
  } catch (err) {
    console.error("[MCP] Failed to start MCP server:", err);
    process.exit(1);
  }
}

start();
