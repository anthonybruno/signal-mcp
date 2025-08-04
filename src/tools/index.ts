import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { logger } from '@/utils/logger';

import { getLatestBlogPost } from './blog';
import { getGitHubActivity } from './github';
import { getProjectInfo } from './projectInfo';
import { getCurrentSpotifyTrack } from './spotify';

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

const emptySchema = { type: 'object', properties: {}, required: [] };

const tools = [
  {
    name: 'get_current_spotify_track',
    description: "Get the currently playing track from Anthony Bruno's Spotify account",
    inputSchema: emptySchema,
  },
  {
    name: 'get_github_activity',
    description: 'Get recent GitHub activity and profile information',
    inputSchema: emptySchema,
  },
  {
    name: 'get_latest_blog_post',
    description: "Get the latest blog post from Anthony Bruno's blog",
    inputSchema: emptySchema,
  },
  {
    name: 'get_project_info',
    description: 'Get information about this project',
    inputSchema: {},
  },
];

const handlers = {
  get_current_spotify_track: getCurrentSpotifyTrack,
  get_github_activity: getGitHubActivity,
  get_latest_blog_post: getLatestBlogPost,
  get_project_info: getProjectInfo,
};

export function registerTools(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;
    logger.info('Tool called', { name });

    try {
      const handler = handlers[name as keyof typeof handlers];
      return await handler();
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });
}
