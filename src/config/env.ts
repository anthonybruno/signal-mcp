import { z } from 'zod';

const envSchema = z.object({
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_REFRESH_TOKEN: z.string().min(1),
  GH_TOKEN: z.string().min(1),

  MCP_SERVER_NAME: z.string().min(1),
  MCP_SERVER_VERSION: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z
    .string()
    .default('3001')
    .transform((val) => parseInt(val, 10)),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getEnv(): EnvConfig {
  // eslint-disable-next-line no-process-env
  return envSchema.parse(process.env);
}
