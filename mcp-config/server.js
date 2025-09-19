const { BrightDataMCPServer } = require('@brightdata/mcp-server');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');

const server = new BrightDataMCPServer({
  apiKey: process.env.BRIGHT_DATA_API_KEY,
  zoneId: process.env.BRIGHT_DATA_ZONE_ID,
});

server.start();
