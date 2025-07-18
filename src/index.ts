#!/usr/bin/env node

import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';
import { registerTools } from '@/tools/index';

// Load environment variables from root .env file
dotenv.config({ path: '../../.env' });

async function main() {
  try {
    const env = getEnv();

    logger.info('Starting MCP server (stdio transport)', {
      name: env.MCP_SERVER_NAME,
      version: env.MCP_SERVER_VERSION,
      environment: env.NODE_ENV,
    });

    // Create MCP server
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

    // Register all tools
    await registerTools(mcpServer);

    // Set up error handling
    mcpServer.onerror = (error) => {
      logger.error('MCP server error:', error);
    };

    // Start stdio transport
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    logger.info('MCP server started successfully with stdio transport');

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      shutdown();
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      shutdown();
    });
  } catch (error) {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  logger.info('Shutting down gracefully...');
  process.exit(0);
}

main().catch((error) => {
  logger.error('Main function error:', error);
  process.exit(1);
});
