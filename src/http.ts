#!/usr/bin/env node

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { logger } from '@/utils/logger';
import { getCurrentSpotifyTrack } from '@/tools/spotify';
import { getGitHubActivity } from '@/tools/github';
import { getLatestBlogPost } from '@/tools/blog';
import { getProjectInfo } from '@/tools/projectInfo';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3001;

logger.info('Starting MCP HTTP server', {
  name: 'signal-mcp-server',
  version: '1.0.0',
  environment: 'production',
  port: PORT,
});

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    transport: 'http',
    timestamp: new Date().toISOString(),
    name: 'signal-mcp-server',
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Signal MCP',
    version: '1.0.0',
    transport: 'http',
    endpoints: {
      health: '/health',
      mcp: '/mcp',
    },
  });
});

// MCP protocol endpoint
app.post('/mcp', async (req, res) => {
  try {
    const request = req.body;
    logger.debug('Received MCP request', { method: request.method, id: request.id });

    let response;

    switch (request.method) {
      case 'initialize': {
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'signal-mcp-server',
              version: '1.0.0',
            },
          },
        };
        break;
      }

      case 'tools/list': {
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            tools: [
              {
                name: 'get_current_spotify_track',
                description: "Get the currently playing track from Anthony Bruno's Spotify account",
                inputSchema: { type: 'object', properties: {}, required: [] },
              },
              {
                name: 'get_github_activity',
                description: 'Get recent GitHub activity and profile information',
                inputSchema: { type: 'object', properties: {}, required: [] },
              },
              {
                name: 'get_latest_blog_post',
                description: "Get the latest blog post from Anthony Bruno's blog",
                inputSchema: { type: 'object', properties: {}, required: [] },
              },
              {
                name: 'get_project_info',
                description: 'Get information about this project',
                inputSchema: { type: 'object', properties: {}, required: [] },
              },
            ],
          },
        };
        break;
      }

      case 'tools/call': {
        const { name, arguments: args } = request.params;
        logger.info('Tool called', { name, args });

        let toolResult;
        switch (name) {
          case 'get_current_spotify_track':
            toolResult = await getCurrentSpotifyTrack();
            break;
          case 'get_github_activity':
            toolResult = await getGitHubActivity();
            break;
          case 'get_latest_blog_post':
            toolResult = await getLatestBlogPost();
            break;
          case 'get_project_info':
            toolResult = await getProjectInfo();
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: toolResult,
        };
        break;
      }

      default:
        throw new Error(`Unsupported MCP method: ${request.method}`);
    }

    logger.debug('Sending MCP response', { id: response.id, method: request.method });
    res.json(response);
  } catch (error) {
    logger.error('Error processing MCP request:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id ?? null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`MCP HTTP server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server terminated');
    process.exit(0);
  });
});

export default app;
