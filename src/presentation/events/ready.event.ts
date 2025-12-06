import { Discord, Once } from 'discordx';
import { injectable, inject } from 'tsyringe';
import type { Client } from 'discordx';
import { ActivityType } from 'discord.js';
import { TOKENS } from '@infrastructure/container/tokens.js';
import type { ILogger } from '@infrastructure/logging/index.js';

@Discord()
@injectable()
export class ReadyEvent {
  constructor(@inject(TOKENS.Logger) private readonly logger: ILogger) {}

  @Once({ event: 'ready' })
  async onReady([client]: [Client]): Promise<void> {
    // Register slash commands globally
    await client.initApplicationCommands();

    // Set bot status/activity
    client.user?.setPresence({
      status: 'online', // 'online' | 'idle' | 'dnd' | 'invisible'
      activities: [
        {
          name: 'with Clean Architecture',
          type: ActivityType.Playing, // Playing | Streaming | Listening | Watching | Competing
        },
      ],
    });

    this.logger.info('Bot is ready!', {
      username: client.user?.tag,
      guilds: client.guilds.cache.size,
      commands: client.applicationCommands.length,
    });
  }
}
