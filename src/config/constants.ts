// =============================================================================
// Hard-coded constants for the MCP server
// =============================================================================

export const SERVER_CONFIG = {
  name: 'signal-mcp-server',
  version: '1.0.0',
  port: 3001,
  transport: 'http' as const,
  corsOrigin: '*',
  logLevel: 'info' as const,
  enableCaching: true,
  cacheTtlSeconds: 300,
  rateLimitRequestsPerMinute: 60,
} as const;

export const PERSONAL_CONFIG = {
  githubUsername: 'anthonybruno',
  blogRssUrl: 'https://eastsycamore.com/rss.xml',
} as const;

export const MCP_CONFIG = {
  protocolVersion: '2024-11-05',
  serverName: 'Signal MCP',
} as const;
