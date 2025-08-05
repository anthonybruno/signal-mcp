/* eslint-disable no-process-env */

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { getEnv } from '@/config/env';
import { handlers, tools } from '@/tools/definitions';
import { logger } from '@/utils/logger';

dotenv.config();
const env = getEnv();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

/**
 * MCP HTTP Server - For Production Deployment
 *
 * This server runs as an HTTP API for production deployment.
 * It provides the same tools as the stdio server but exposes them
 * via HTTP endpoints for web integration and remote access.
 *
 */

/**
 * Handles MCP server initialization requests.
 * Returns server capabilities and protocol information.
 */
const handleInitialize = (id: string, res: express.Response) => {
  res.json({
    jsonrpc: '2.0',
    id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'signal-mcp-server', version: '1.0.0' },
    },
  });
};

/**
 * Handles tool listing requests.
 * Returns the list of available tools with their schemas.
 */
const handleToolsList = (id: string, res: express.Response) => {
  res.json({ jsonrpc: '2.0', id, result: { tools } });
};

/**
 * Handles tool execution requests.
 * Dynamically calls the appropriate tool function based on the tool name.
 *
 * @param id - The JSON-RPC request ID
 * @param name - The name of the tool to execute
 * @param res - Express response object
 */
const handleToolCall = async (id: string, name: string, res: express.Response) => {
  logger.info('Tool execution requested', { toolName: name });

  try {
    if (!(name in handlers)) {
      logger.error('Unknown tool requested', { toolName: name });
      res.status(400).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown tool: ${name}` },
      });
      return;
    }

    const handler = handlers[name];
    const result = await handler();
    logger.info('Tool execution completed', { toolName: name });
    res.json({ jsonrpc: '2.0', id, result });
  } catch (error) {
    logger.error('Tool execution failed', { toolName: name, error });
    res.status(500).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: 'Tool execution failed' },
    });
  }
};

/**
 * Handles unsupported MCP method requests.
 * Returns a JSON-RPC error response.
 */
const handleUnsupportedMethod = (id: string, method: string, res: express.Response) => {
  res.status(400).json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Unsupported method: ${method}` },
  });
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Main MCP endpoint that handles all JSON-RPC requests.
 * Supports initialization, tool listing, and tool execution.
 *
 * Expected request body: { method, id, params? }
 * - method: 'initialize' | 'tools/list' | 'tools/call'
 * - id: JSON-RPC request ID
 * - params: Optional parameters (required for 'tools/call')
 */
app.post('/mcp', (req, res) => {
  const { method, id, params } = req.body as {
    method: string;
    id: string;
    params?: { name: string };
  };

  const handleRequest = async () => {
    try {
      if (method === 'initialize') {
        handleInitialize(id, res);
        return;
      }

      if (method === 'tools/list') {
        handleToolsList(id, res);
        return;
      }

      if (method === 'tools/call') {
        if (!params?.name) {
          res.status(400).json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Missing tool name in params' },
          });
          return;
        }
        await handleToolCall(id, params.name, res);
        return;
      }

      handleUnsupportedMethod(id, method, res);
    } catch (error) {
      logger.error('MCP request failed:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: 'Internal error' },
      });
    }
  };

  void handleRequest();
});

app.listen(env.PORT, () => {
  logger.info('Server started successfully', { port: env.PORT });
});

export { app };
