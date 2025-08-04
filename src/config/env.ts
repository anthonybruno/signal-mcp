import { z } from 'zod';

// Schema including all required environment variables
const envSchema = z.object({
  // API Keys (required)
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_REFRESH_TOKEN: z.string().min(1),
  GH_TOKEN: z.string().min(1),

  // Server configuration (required)
  MCP_SERVER_NAME: z.string().min(1),
  MCP_SERVER_VERSION: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Simple getter - no caching, no complex logic

export function getEnv(): EnvConfig {
  // eslint-disable-next-line no-process-env
  return envSchema.parse(process.env);
}
