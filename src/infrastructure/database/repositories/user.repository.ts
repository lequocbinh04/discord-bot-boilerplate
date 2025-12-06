import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from '../../../domain/interfaces/index.js';
import { UserEntity, SnowflakeId, type UserId, type GuildId } from '../../../domain/index.js';
import { PrismaService } from '../prisma.service.js';
import { TOKENS } from '../../container/tokens.js';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(@inject(TOKENS.PrismaClient) private readonly prisma: PrismaService) {}

  async findById(id: UserId, guildId: GuildId): Promise<UserEntity | null> {
    const guildUser = await this.prisma.guildUser.findUnique({
      where: {
        guildId_userId: {
          guildId: guildId.toString(),
          userId: id.toString(),
        },
      },
      include: { user: true },
    });

    if (!guildUser) return null;

    return this.toDomain(guildUser);
  }

  async findByGuild(guildId: GuildId): Promise<UserEntity[]> {
    const guildUsers = await this.prisma.guildUser.findMany({
      where: { guildId: guildId.toString() },
      include: { user: true },
    });

    return guildUsers.map((gu) => this.toDomain(gu));
  }

  async findTopByXp(guildId: GuildId, limit: number): Promise<UserEntity[]> {
    const guildUsers = await this.prisma.guildUser.findMany({
      where: { guildId: guildId.toString() },
      orderBy: { xp: 'desc' },
      take: limit,
      include: { user: true },
    });

    return guildUsers.map((gu) => this.toDomain(gu));
  }

  async save(user: UserEntity): Promise<UserEntity> {
    // Ensure User record exists
    await this.prisma.user.upsert({
      where: { id: user.id.toString() },
      create: {
        id: user.id.toString(),
        username: user.username,
      },
      update: { username: user.username },
    });

    // Upsert GuildUser record
    const guildUser = await this.prisma.guildUser.upsert({
      where: {
        guildId_userId: {
          guildId: user.guildId.toString(),
          userId: user.id.toString(),
        },
      },
      create: {
        guildId: user.guildId.toString(),
        userId: user.id.toString(),
        xp: user.xp,
        level: user.level,
      },
      update: {
        xp: user.xp,
        level: user.level,
      },
      include: { user: true },
    });

    return this.toDomain(guildUser);
  }

  async delete(id: UserId, guildId: GuildId): Promise<void> {
    await this.prisma.guildUser.delete({
      where: {
        guildId_userId: {
          guildId: guildId.toString(),
          userId: id.toString(),
        },
      },
    });
  }

  async exists(id: UserId, guildId: GuildId): Promise<boolean> {
    const count = await this.prisma.guildUser.count({
      where: {
        guildId: guildId.toString(),
        userId: id.toString(),
      },
    });
    return count > 0;
  }

  private toDomain(guildUser: {
    guildId: string;
    userId: string;
    xp: number;
    level: number;
    joinedAt: Date;
    updatedAt: Date;
    user: { id: string; username: string; createdAt: Date; updatedAt: Date };
  }): UserEntity {
    return new UserEntity({
      id: SnowflakeId.create(guildUser.userId),
      username: guildUser.user.username,
      guildId: SnowflakeId.create(guildUser.guildId),
      xp: guildUser.xp,
      level: guildUser.level,
      createdAt: guildUser.joinedAt,
      updatedAt: guildUser.updatedAt,
    });
  }
}
