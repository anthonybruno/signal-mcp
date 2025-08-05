import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';

import { getEnv } from '@/config/env';
import { registerTools } from '@/tools/index';
import { logger } from '@/utils/logger';

dotenv.config();

/**
 * MCP Stdio Server - For Local Development
 *
 * This server runs via stdio transport for local MCP clients like Cursor.
 * It provides the same tools as the HTTP server but communicates through
 * standard input/output for direct integration with AI development tools.
 *
 * Usage: npm run dev (for local development)
 *
 * @throws Error if server fails to start or environment is misconfigured
 */
async function main() {
  try {
    const env = getEnv();

    const mcpServer = new Server(
      {
        name: env.MCP_SERVER_NAME,
        version: env.MCP_SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    registerTools(mcpServer);

    mcpServer.onerror = (error) => {
      logger.error('MCP server error:', error);
    };

    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    // Graceful shutdown
    const shutdown = () => process.exit(0);
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Main function error:', error);
  process.exit(1);
});
