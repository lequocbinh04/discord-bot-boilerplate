import { Discord, On } from 'discordx';
import { injectable, inject } from 'tsyringe';
import type { Interaction } from 'discord.js';
import type { Client } from 'discordx';
import { TOKENS } from '../../infrastructure/container/tokens.js';
import type { ILogger } from '../../infrastructure/logging/index.js';
import { ApplicationError } from '../../application/errors/index.js';

@Discord()
@injectable()
export class InteractionCreateEvent {
  constructor(@inject(TOKENS.Logger) private readonly logger: ILogger) {}

  @On({ event: 'interactionCreate' })
  async onInteraction([interaction]: [Interaction], client: Client): Promise<void> {
    try {
      await client.executeInteraction(interaction);
    } catch (error) {
      this.logger.error('Interaction error', {
        interactionId: interaction.id,
        error: error instanceof Error ? error.message : String(error),
      });

      // Reply with error if possible
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        const message =
          error instanceof ApplicationError ? error.message : 'An unexpected error occurred';

        await interaction.reply({
          content: `Error: ${message}`,
          ephemeral: true,
        });
      }
    }
  }
}
