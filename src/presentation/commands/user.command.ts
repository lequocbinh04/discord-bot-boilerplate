import { Discord, Slash, SlashOption } from 'discordx';
import { injectable, inject } from 'tsyringe';
import {
  CommandInteraction,
  EmbedBuilder,
  ApplicationCommandOptionType,
  User,
} from 'discord.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';
import type { ILogger } from '../../infrastructure/logging/index.js';
import { UserService } from '../../application/services/index.js';
import { GuildService } from '../../application/services/index.js';

@Discord()
@injectable()
export class UserCommand {
  constructor(
    @inject(TOKENS.Logger) private readonly logger: ILogger,
    @inject(TOKENS.UserService) private readonly userService: UserService,
    @inject(TOKENS.GuildService) private readonly guildService: GuildService
  ) {}

  @Slash({ name: 'user', description: 'View user information and stats' })
  async user(
    @SlashOption({
      name: 'target',
      description: 'User to view (defaults to yourself)',
      type: ApplicationCommandOptionType.User,
      required: false,
    })
    target: User | undefined,
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

    const targetUser = target ?? interaction.user;

    try {
      // Ensure guild exists
      const guild = interaction.guild;
      if (guild) {
        await this.guildService.getOrCreate(guild.id, guild.name);
      }

      // Get or create user
      const user = await this.userService.getOrCreate(
        targetUser.id,
        targetUser.username,
        interaction.guildId
      );

      const embed = new EmbedBuilder()
        .setTitle(`${targetUser.username}'s Profile`)
        .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
        .setColor(0x5865f2)
        .addFields(
          { name: 'Level', value: `${user.level}`, inline: true },
          { name: 'XP', value: `${user.xp}`, inline: true },
          { name: 'XP to Next Level', value: `${user.getXpForNextLevel()}`, inline: true }
        )
        .setFooter({
          text: `User ID: ${targetUser.id}`,
        })
        .setTimestamp();

      this.logger.debug('User command executed', {
        executorId: interaction.user.id,
        targetId: targetUser.id,
        guildId: interaction.guildId,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('User command failed', {
        error: error instanceof Error ? error.message : String(error),
        targetId: targetUser.id,
        guildId: interaction.guildId,
      });

      await interaction.editReply({
        content: 'An error occurred while fetching user information.',
      });
    }
  }
}
