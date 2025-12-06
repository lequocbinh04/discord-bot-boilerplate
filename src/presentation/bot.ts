import { injectable, inject } from 'tsyringe';
import type { Client } from 'discordx';
import { TOKENS } from '@infrastructure/container/tokens.js';
import type { ILogger } from '@infrastructure/logging/index.js';
import { ConfigService } from '@infrastructure/config/index.js';
import { PrismaService } from '@infrastructure/database/index.js';

@injectable()
export class Bot {
  constructor(
    @inject(TOKENS.Logger) private readonly logger: ILogger,
    @inject(TOKENS.Config) private readonly config: ConfigService,
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaService
  ) {}

  async start(client: Client): Promise<void> {
    this.logger.info('Starting bot...');

    // Connect to database
    await this.prisma.connect();

    // Login to Discord
    await client.login(this.config.discord.token);

    this.logger.info('Bot started successfully');
  }

  async stop(client: Client): Promise<void> {
    this.logger.info('Stopping bot...');

    // Logout from Discord
    client.destroy();

    // Disconnect from database
    await this.prisma.disconnect();

    this.logger.info('Bot stopped');
  }

  setupGracefulShutdown(client: Client): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, shutting down gracefully...`);
      await this.stop(client);
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      this.logger.error('Unhandled rejection', { reason: String(reason) });
    });
  }
}
