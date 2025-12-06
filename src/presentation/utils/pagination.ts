import {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ComponentType,
  type CommandInteraction,
  type Message,
  type ButtonInteraction,
} from 'discord.js';

// ==================== SHARED ====================

interface BaseOptions<T> {
  itemsPerPage?: number;
  formatter: (item: T, index: number) => string;
  title: string;
  color?: number;
  description?: string;
  timeout?: number;
}

abstract class BasePaginatedEmbed<T> {
  protected readonly itemsPerPage: number;
  protected readonly formatter: (item: T, index: number) => string;
  protected readonly title: string;
  protected readonly color: number;
  protected readonly description?: string;
  protected readonly timeout: number;
  protected readonly instanceId: string;
  protected currentPage = 0;
  protected abstract readonly totalPages: number;

  constructor(options: BaseOptions<T>) {
    this.itemsPerPage = options.itemsPerPage ?? 10;
    this.formatter = options.formatter;
    this.title = options.title;
    this.color = options.color ?? 0x5865f2;
    this.description = options.description;
    this.timeout = options.timeout ?? 60000;
    this.instanceId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  protected abstract getCurrentPageItems(): Promise<T[]> | T[];

  protected async buildEmbed(): Promise<EmbedBuilder> {
    const pageItems = await this.getCurrentPageItems();
    const startIndex = this.currentPage * this.itemsPerPage;

    const content = pageItems
      .map((item, i) => this.formatter(item, startIndex + i))
      .join('\n');

    return new EmbedBuilder()
      .setTitle(this.title)
      .setColor(this.color)
      .setDescription(this.description ? `${this.description}\n\n${content}` : content || 'No items.')
      .setFooter({ text: `Page ${this.currentPage + 1} of ${this.totalPages}` })
      .setTimestamp();
  }

  protected buildButtons(): ActionRowBuilder<ButtonBuilder> {
    const id = (action: string) => `${action}_${this.instanceId}`;

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(id('first'))
        .setLabel('<<')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId(id('prev'))
        .setLabel('<')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId(id('next'))
        .setLabel('>')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage >= this.totalPages - 1),
      new ButtonBuilder()
        .setCustomId(id('last'))
        .setLabel('>>')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage >= this.totalPages - 1),
    );
  }

  protected handleAction(action: string): void {
    switch (action) {
      case 'first':
        this.currentPage = 0;
        break;
      case 'prev':
        this.currentPage = Math.max(0, this.currentPage - 1);
        break;
      case 'next':
        this.currentPage = Math.min(this.totalPages - 1, this.currentPage + 1);
        break;
      case 'last':
        this.currentPage = this.totalPages - 1;
        break;
    }
  }

  async send(interaction: CommandInteraction): Promise<void> {
    if (this.totalPages === 0) {
      await interaction.editReply({ content: 'No items to display.' });
      return;
    }

    const message = (await interaction.editReply({
      embeds: [await this.buildEmbed()],
      components: this.totalPages > 1 ? [this.buildButtons()] : [],
    })) as Message;

    if (this.totalPages <= 1) return;

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id && i.customId.endsWith(this.instanceId),
      time: this.timeout,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      const action = i.customId.split('_')[0];
      this.handleAction(action);

      await i.update({
        embeds: [await this.buildEmbed()],
        components: [this.buildButtons()],
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch {
        // Message may have been deleted
      }
    });
  }
}

// ==================== STATIC MODE ====================

export interface PaginationOptions<T> extends BaseOptions<T> {
  items: T[];
}

export class PaginatedEmbed<T> extends BasePaginatedEmbed<T> {
  private readonly items: T[];
  protected readonly totalPages: number;

  constructor(options: PaginationOptions<T>) {
    super(options);
    this.items = options.items;
    this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
  }

  protected getCurrentPageItems(): T[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.items.slice(start, start + this.itemsPerPage);
  }
}

// ==================== DYNAMIC MODE (LAZY) ====================

export interface LazyPaginationOptions<T> extends BaseOptions<T> {
  fetcher: (skip: number, take: number) => Promise<T[]>;
  totalCount: number;
  cachePages?: boolean;
}

export class LazyPaginatedEmbed<T> extends BasePaginatedEmbed<T> {
  private readonly fetcher: (skip: number, take: number) => Promise<T[]>;
  private readonly totalCount: number;
  private readonly cachePages: boolean;
  private readonly cache: Map<number, T[]> = new Map();
  protected readonly totalPages: number;

  constructor(options: LazyPaginationOptions<T>) {
    super(options);
    this.fetcher = options.fetcher;
    this.totalCount = options.totalCount;
    this.cachePages = options.cachePages ?? false;
    this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
  }

  protected async getCurrentPageItems(): Promise<T[]> {
    // Check cache first
    if (this.cachePages && this.cache.has(this.currentPage)) {
      return this.cache.get(this.currentPage)!;
    }

    const skip = this.currentPage * this.itemsPerPage;
    const items = await this.fetcher(skip, this.itemsPerPage);

    // Cache if enabled
    if (this.cachePages) {
      this.cache.set(this.currentPage, items);
    }

    return items;
  }
}
