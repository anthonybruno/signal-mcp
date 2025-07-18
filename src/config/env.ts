import { z } from 'zod';

// Minimal schema - only sensitive tokens
const envSchema = z.object({
  // API Keys (required)
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_REFRESH_TOKEN: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Simple getter - no caching, no complex logic
export function getEnv(): EnvConfig {
  return envSchema.parse(process.env);
}
