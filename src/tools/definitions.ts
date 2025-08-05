import { getLatestBlogPost } from '@/tools/blog';
import { getGitHubActivity } from '@/tools/github';
import { getProjectInfo } from '@/tools/projectInfo';
import { getCurrentSpotifyTrack } from '@/tools/spotify';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ToolHandler {
  (): Promise<CallToolResult>;
}

export interface ToolHandlers {
  [key: string]: ToolHandler;
}

const createTool = (name: string, description: string): Tool => ({
  name,
  description,
  inputSchema: { type: 'object', properties: {}, required: [] },
});

export const tools: Tool[] = [
  createTool(
    'get_current_spotify_track',
    "Get the currently playing track from Anthony's Spotify account",
  ),
  createTool('get_github_activity', 'Get recent GitHub activity and profile information'),
  createTool('get_latest_blog_post', "Get the latest blog post from Anthony's blog"),
  createTool('get_project_info', 'Get information about this project'),
];

export const handlers: ToolHandlers = {
  get_current_spotify_track: getCurrentSpotifyTrack,
  get_github_activity: getGitHubActivity,
  get_latest_blog_post: getLatestBlogPost,
  get_project_info: getProjectInfo,
};
