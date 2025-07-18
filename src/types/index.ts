// MCP Server Types
export interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { name: string };
  external_urls: { spotify: string };
  played_at: string;
}

export interface BlogPost {
  title: string;
  link: string;
  publishedAt: string;
}

// MCP Tool parameter schemas (for validation)
export const SpotifyToolParams = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['get_current_track', 'get_recent_tracks'],
      description: 'The Spotify action to perform',
    },
  },
  required: ['action'],
};

export const GitHubToolParams = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['get_activity', 'get_profile'],
      description: 'The GitHub action to perform',
    },
  },
  required: ['action'],
};

export const BlogToolParams = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['get_recent_posts'],
      description: 'The blog action to perform',
    },
  },
  required: ['action'],
};
