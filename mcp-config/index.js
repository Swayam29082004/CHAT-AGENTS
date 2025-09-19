import { BrightDataMCPServer } from "@brightdata/mcp";
import { Server } from "@modelcontextprotocol/sdk/server";
import dotenv from "dotenv";

dotenv.config({ path: "../.env.local" });

const server = new BrightDataMCPServer({
  apiKey: process.env.BRIGHT_DATA_API_KEY,
  zoneId: process.env.BRIGHT_DATA_ZONE_ID,
});

server.start().then(() => {
  console.log("🚀 Bright Data MCP Server is running...");
});
