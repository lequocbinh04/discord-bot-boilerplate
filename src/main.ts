import 'reflect-metadata';
import { setupContainer, container, TOKENS } from './infrastructure/index.js';
import { createDiscordClient, loadDiscordComponents } from './presentation/discord-client.js';
import { Bot } from './presentation/bot.js';
import type { ILogger } from './infrastructure/logging/index.js';

async function bootstrap(): Promise<void> {
  // Setup DI container
  setupContainer();

  // Get logger early for startup messages
  const logger = container.resolve<ILogger>(TOKENS.Logger);

  try {
    // Load Discord commands and events
    await loadDiscordComponents();

    // Create Discord client
    const client = createDiscordClient();

    // Get bot instance and start
    const bot = container.resolve(Bot);
    bot.setupGracefulShutdown(client);
    await bot.start(client);
  } catch (error) {
    logger.error('Failed to start bot', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

bootstrap();
