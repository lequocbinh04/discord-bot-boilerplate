import { Discord, Slash } from 'discordx';
import { injectable, inject } from 'tsyringe';
import { CommandInteraction } from 'discord.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';
import type { ILogger } from '../../infrastructure/logging/index.js';

@Discord()
@injectable()
export class PingCommand {
  constructor(@inject(TOKENS.Logger) private readonly logger: ILogger) {}

  @Slash({ name: 'ping', description: 'Check bot latency' })
  async ping(interaction: CommandInteraction): Promise<void> {
    const start = Date.now();

    await interaction.deferReply();

    const latency = Date.now() - start;
    const apiLatency = Math.round(interaction.client.ws.ping);

    this.logger.debug('Ping command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      latency,
      apiLatency,
    });

    await interaction.editReply({
      content: `Pong! Latency: ${latency}ms | API Latency: ${apiLatency}ms`,
    });
  }
}
