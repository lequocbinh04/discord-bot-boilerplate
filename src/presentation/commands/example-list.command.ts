import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { injectable, inject } from 'tsyringe';
import { CommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import { TOKENS } from '@infrastructure/container/tokens.js';
import type { ILogger } from '@infrastructure/logging/index.js';
import { PaginatedEmbed, LazyPaginatedEmbed } from '@presentation/utils/index.js';

interface ExampleItem {
  id: number;
  name: string;
  description: string;
}

// Simulate async DB fetch
const simulateFetch = async (
  allItems: ExampleItem[],
  skip: number,
  take: number
): Promise<ExampleItem[]> => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 100));
  return allItems.slice(skip, skip + take);
};

@Discord()
@injectable()
export class ExampleListCommand {
  constructor(@inject(TOKENS.Logger) private readonly logger: ILogger) {}

  @Slash({ name: 'example-list', description: 'Demo paginated list (static or lazy mode)' })
  async exampleList(
    @SlashChoice({ name: 'Static (full array)', value: 'static' })
    @SlashChoice({ name: 'Lazy (DB fetch per page)', value: 'lazy' })
    @SlashOption({
      name: 'mode',
      description: 'Pagination mode',
      type: ApplicationCommandOptionType.String,
      required: false,
    })
    mode: 'static' | 'lazy' = 'static',

    @SlashOption({
      name: 'limit',
      description: 'Number of items (1-100)',
      type: ApplicationCommandOptionType.Integer,
      required: false,
      minValue: 1,
      maxValue: 100,
    })
    limit: number = 50,

    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    try {
      // Generate mock data
      const allItems: ExampleItem[] = Array.from({ length: limit }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        description: `Description for item #${i + 1}`,
      }));

      const formatter = (item: ExampleItem, index: number) =>
        `**${index + 1}.** ${item.name}\n   > ${item.description}`;

      if (mode === 'lazy') {
        // LAZY MODE: Fetch per page from "DB"
        const paginator = new LazyPaginatedEmbed<ExampleItem>({
          fetcher: (skip, take) => simulateFetch(allItems, skip, take),
          totalCount: allItems.length,
          itemsPerPage: 10,
          formatter,
          title: 'Example List (Lazy Mode)',
          color: 0xe67e22,
          description: `Total: ${allItems.length} items | Fetches per page`,
          cachePages: true,
        });

        this.logger.debug('Example list (lazy) executed', {
          userId: interaction.user.id,
          itemCount: allItems.length,
        });

        await paginator.send(interaction);
      } else {
        // STATIC MODE: Full array
        const paginator = new PaginatedEmbed<ExampleItem>({
          items: allItems,
          itemsPerPage: 10,
          formatter,
          title: 'Example List (Static Mode)',
          color: 0x5865f2,
          description: `Total: ${allItems.length} items | Pre-loaded`,
        });

        this.logger.debug('Example list (static) executed', {
          userId: interaction.user.id,
          itemCount: allItems.length,
        });

        await paginator.send(interaction);
      }
    } catch (error) {
      this.logger.error('Example list command failed', {
        error: error instanceof Error ? error.message : String(error),
        userId: interaction.user.id,
      });

      await interaction.editReply({
        content: 'An error occurred while generating the list.',
      });
    }
  }
}
