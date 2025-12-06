import { Discord, Slash, SlashOption } from 'discordx';
import { injectable, inject } from 'tsyringe';
import { CommandInteraction, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';
import type { ILogger } from '../../infrastructure/logging/index.js';
import { UserService } from '../../application/services/index.js';

@Discord()
@injectable()
export class LeaderboardCommand {
  constructor(
    @inject(TOKENS.Logger) private readonly logger: ILogger,
    @inject(TOKENS.UserService) private readonly userService: UserService
  ) {}

  @Slash({ name: 'leaderboard', description: 'View the server XP leaderboard' })
  async leaderboard(
    @SlashOption({
      name: 'limit',
      description: 'Number of users to show (default: 10, max: 25)',
      type: ApplicationCommandOptionType.Integer,
      required: false,
      minValue: 1,
      maxValue: 25,
    })
    limit: number | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guildId) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const topUsers = await this.userService.getLeaderboard(
        interaction.guildId,
        limit ?? 10
      );

      if (topUsers.length === 0) {
        await interaction.editReply({
          content: 'No users found in the leaderboard yet.',
        });
        return;
      }

      const leaderboardText = topUsers
        .map((user, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          return `${medal} **${user.username}** - Level ${user.level} (${user.xp} XP)`;
        })
        .join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`${interaction.guild?.name ?? 'Server'} Leaderboard`)
        .setDescription(leaderboardText)
        .setColor(0xffd700)
        .setFooter({ text: `Top ${topUsers.length} users by XP` })
        .setTimestamp();

      this.logger.debug('Leaderboard command executed', {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        resultCount: topUsers.length,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Leaderboard command failed', {
        error: error instanceof Error ? error.message : String(error),
        guildId: interaction.guildId,
      });

      await interaction.editReply({
        content: 'An error occurred while fetching the leaderboard.',
      });
    }
  }
}
