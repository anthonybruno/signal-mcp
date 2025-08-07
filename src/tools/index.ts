import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { logger } from '@/utils/logger';

import { handlers, tools } from './definitions';

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Registers all available tools with the MCP server.
 *
 * Sets up request handlers for listing tools and executing them dynamically.
 * Provides centralized error handling and logging for all tool operations.
 *
 * @param server - The MCP server instance to register tools with
 */
export function registerTools(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;
    logger.info('Tool called', { name });

    try {
      if (!(name in handlers)) {
        logger.error('Unknown tool requested', { toolName: name });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
      }

      const handler = handlers[name];
      const result = await handler();
      logger.info('Tool execution completed', { toolName: name });
      return result;
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Tool execution failed' }),
          },
        ],
        isError: true,
      };
    }
  });
}
