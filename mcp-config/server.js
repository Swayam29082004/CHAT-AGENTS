import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import z from 'zod';

// --- Environment Variable Validation ---
const { BRIGHT_DATA_API_TOKEN, BRIGHT_DATA_ACCOUNT_ID, BRIGHT_DATA_ZONE_NAME } = process.env;

if (!BRIGHT_DATA_API_TOKEN || !BRIGHT_DATA_ACCOUNT_ID || !BRIGHT_DATA_ZONE_NAME) {
  console.error("❌ Missing Bright Data credentials in your environment variables.");
  process.exit(1);
}

// --- Main Server Logic ---
async function main() {
  // 1. Initialize the MCP Server
  const server = new McpServer({
    name: 'brightdata-scraper',
    version: '1.0.0',
    capabilities: { tools: {} },
  });

  // 2. Define the Scraping Tool
  server.registerTool(
    'scrape_website',
    {
      description: 'Scrapes a given URL using Bright Data Web Unlocker and returns its HTML content.',
      inputSchema: {
        url: z.string().describe('The full URL of the website to scrape (e.g., https://example.com)'),
      },
    },
    async (args) => {
      const { url } = args;
      console.log(`[MCP Server] Received request to scrape: ${url}`);

      try {
        // --- Axios Configuration for Bright Data Proxy ---
        const username = `brd-customer-${BRIGHT_DATA_ACCOUNT_ID}-zone-${BRIGHT_DATA_ZONE_NAME}`;
        const password = BRIGHT_DATA_API_TOKEN;
        const host = 'brd.superproxy.io';
        const port = 22225;

        const response = await axios.get(url, {
          proxy: {
            host,
            port,
            auth: {
              username,
              password,
            },
            protocol: 'http',
          },
        });

        console.log(`[MCP Server] Successfully scraped ${url}. Returning content.`);
        
        // Return the scraped HTML content
        return {
          content: [{
            type: 'text',
            text: response.data,
          }],
        };
      } catch (error) {
        console.error('[MCP Server] Scraping failed:', error.message);
        // Return a structured error message to the client
        return {
          content: [{
            type: 'text',
            text: `Error: Failed to scrape the URL. Reason: ${error.message}`,
          }],
        };
      }
    }
  );

  // 3. Connect the Server to a Transport (Stdio for Claude Desktop)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('✅ Bright Data MCP Server is running and connected via stdio.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});