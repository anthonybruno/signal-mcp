import { z } from 'zod';

// Simple schema - only what we actually need
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MCP_SERVER_NAME: z.string().default('signal-mcp-server'),
  MCP_SERVER_VERSION: z.string().default('1.0.0'),
  PORT: z.string().default('3001').transform(Number),

  // Transport Configuration
  MCP_TRANSPORT: z.enum(['stdio', 'http']).default('stdio'),

  // API Keys (required)
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_REFRESH_TOKEN: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
  GITHUB_USERNAME: z.string().min(1),
  BLOG_RSS_URL: z.string().url(),

  // Optional with defaults
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_CACHING: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  CACHE_TTL_SECONDS: z.string().default('300').transform(Number),
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.string().default('60').transform(Number),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Simple getter - no caching, no complex logic
export function getEnv(): EnvConfig {
  return envSchema.parse(process.env);
}
