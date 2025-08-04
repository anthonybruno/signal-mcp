import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { logger } from '@/utils/logger';

// Tool parameter schemas (for validation)
const SpotifyToolParams = {
  type: 'object',
  properties: {},
  required: [],
} as const;

const GitHubToolParams = {
  type: 'object',
  properties: {},
  required: [],
} as const;

const BlogToolParams = {
  type: 'object',
  properties: {},
  required: [],
} as const;
import { getLatestBlogPost } from './blog';
import { getGitHubActivity } from './github';
import { getProjectInfo } from './projectInfo';
import { getCurrentSpotifyTrack } from './spotify';

export async function registerTools(server: Server): Promise<void> {
  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Listing available tools');

    return {
      tools: [
        {
          name: 'get_current_spotify_track',
          description: "Get the currently playing track from Anthony Bruno's Spotify account",
          inputSchema: SpotifyToolParams,
        },
        {
          name: 'get_github_activity',
          description: 'Get recent GitHub activity and profile information',
          inputSchema: GitHubToolParams,
        },
        {
          name: 'get_latest_blog_post',
          description: "Get the latest blog post from Anthony Bruno's blog",
          inputSchema: BlogToolParams,
        },
        {
          name: 'get_project_info',
          description: 'Get information about this project',
          inputSchema: {},
        },
      ],
    };
  });

  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info('Tool called', { name, args });

    try {
      switch (name) {
      case 'get_current_spotify_track':
        return await getCurrentSpotifyTrack();
      case 'get_github_activity':
        return await getGitHubActivity();
      case 'get_latest_blog_post':
        return await getLatestBlogPost();
      case 'get_project_info':
        return await getProjectInfo();

      default:
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, error);

      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  logger.info('MCP tools registered successfully');
}
