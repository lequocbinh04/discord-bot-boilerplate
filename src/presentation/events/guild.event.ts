import { Discord, On } from 'discordx';
import { injectable, inject } from 'tsyringe';
import type { Guild } from 'discord.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';
import type { ILogger } from '../../infrastructure/logging/index.js';
import { GuildService } from '../../application/services/index.js';

@Discord()
@injectable()
export class GuildEvent {
  constructor(
    @inject(TOKENS.Logger) private readonly logger: ILogger,
    @inject(TOKENS.GuildService) private readonly guildService: GuildService
  ) {}

  @On({ event: 'guildCreate' })
  async onGuildCreate([guild]: [Guild]): Promise<void> {
    this.logger.info('Joined guild', { guildId: guild.id, guildName: guild.name });

    await this.guildService.getOrCreate(guild.id, guild.name);
  }

  @On({ event: 'guildDelete' })
  async onGuildDelete([guild]: [Guild]): Promise<void> {
    this.logger.info('Left guild', { guildId: guild.id, guildName: guild.name });
    // Note: We keep guild data for audit purposes
    // Implement deletion if needed
  }
}
