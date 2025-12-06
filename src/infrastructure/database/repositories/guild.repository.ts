import { injectable, inject } from 'tsyringe';
import type { IGuildRepository } from '../../../domain/interfaces/index.js';
import { GuildEntity, SnowflakeId, type GuildId } from '../../../domain/index.js';
import { PrismaService } from '../prisma.service.js';
import { TOKENS } from '../../container/tokens.js';

@injectable()
export class GuildRepository implements IGuildRepository {
  constructor(@inject(TOKENS.PrismaClient) private readonly prisma: PrismaService) {}

  async findById(id: GuildId): Promise<GuildEntity | null> {
    const guild = await this.prisma.guild.findUnique({
      where: { id: id.toString() },
    });

    if (!guild) return null;

    return new GuildEntity({
      id: SnowflakeId.create(guild.id),
      name: guild.name,
      prefix: guild.prefix,
      createdAt: guild.createdAt,
      updatedAt: guild.updatedAt,
    });
  }

  async findAll(): Promise<GuildEntity[]> {
    const guilds = await this.prisma.guild.findMany();

    return guilds.map(
      (g) =>
        new GuildEntity({
          id: SnowflakeId.create(g.id),
          name: g.name,
          prefix: g.prefix,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        })
    );
  }

  async save(guild: GuildEntity): Promise<GuildEntity> {
    const data = {
      id: guild.id.toString(),
      name: guild.name,
      prefix: guild.prefix,
    };

    const saved = await this.prisma.guild.upsert({
      where: { id: data.id },
      create: data,
      update: { name: data.name, prefix: data.prefix },
    });

    return new GuildEntity({
      id: SnowflakeId.create(saved.id),
      name: saved.name,
      prefix: saved.prefix,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async delete(id: GuildId): Promise<void> {
    await this.prisma.guild.delete({
      where: { id: id.toString() },
    });
  }

  async exists(id: GuildId): Promise<boolean> {
    const count = await this.prisma.guild.count({
      where: { id: id.toString() },
    });
    return count > 0;
  }
}
