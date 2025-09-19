// File: mcp-config/server.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import CJS module safely
const { BrightDataMCPServer } = require("@brightdata/mcp/index.cjs");

import { Server } from "@modelcontextprotocol/sdk"; // this one is ESM

async function startServer() {
  console.log("MCP SDK Server loaded:", typeof Server);

  const server = new BrightDataMCPServer({
    apiKey: process.env.BRIGHT_DATA_API_KEY,
    zoneId: process.env.BRIGHT_DATA_ZONE_ID,
  });

  server.addTool({
    name: "scrape_page_title",
    description: "Scrapes the title of a webpage given a URL.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL of the page to scrape.",
        },
      },
      required: ["url"],
    },
    async run({ url }) {
      console.log(`Scraping URL: ${url}`);
      return { title: "Dummy Website Title" };
    },
  });

  await server.start();
  console.log("✅ BrightData MCP Server started");
}

startServer();
