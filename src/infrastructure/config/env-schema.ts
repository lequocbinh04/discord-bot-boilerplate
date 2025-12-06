import { z } from 'zod';

export const envSchema = z.object({
  // Discord
  DISCORD_TOKEN: z.string().min(1, 'Discord token required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'Discord client ID required'),

  // Database
  DATABASE_URL: z.string().min(1, 'Database URL required'),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;
