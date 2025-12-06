import { singleton } from 'tsyringe';
import { config as dotenvConfig } from 'dotenv';
import { envSchema, type EnvConfig } from './env-schema.js';

@singleton()
export class ConfigService {
  private readonly config: EnvConfig;

  constructor() {
    dotenvConfig();

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Configuration validation failed:\n${errors}`);
    }

    this.config = result.data;
  }

  get discord() {
    return {
      token: this.config.DISCORD_TOKEN,
      clientId: this.config.DISCORD_CLIENT_ID,
    };
  }

  get database() {
    return {
      url: this.config.DATABASE_URL,
    };
  }

  get app() {
    return {
      nodeEnv: this.config.NODE_ENV,
      logLevel: this.config.LOG_LEVEL,
      isDevelopment: this.config.NODE_ENV === 'development',
      isProduction: this.config.NODE_ENV === 'production',
      isTest: this.config.NODE_ENV === 'test',
    };
  }
}
