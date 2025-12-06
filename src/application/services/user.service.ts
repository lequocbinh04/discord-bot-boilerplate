import { injectable, inject } from 'tsyringe';
import type { IUserRepository, IGuildRepository } from '../../domain/interfaces/index.js';
import { UserEntity, SnowflakeId } from '../../domain/index.js';
import { TOKENS } from '@infrastructure/container/tokens.js';
import { NotFoundError } from '../errors/index.js';

export interface UserWithGuild {
  user: UserEntity;
  guildName: string;
}

@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TOKENS.GuildRepository)
    private readonly guildRepository: IGuildRepository
  ) {}

  async getOrCreate(userId: string, username: string, guildId: string): Promise<UserEntity> {
    const uid = SnowflakeId.create(userId);
    const gid = SnowflakeId.create(guildId);

    const existing = await this.userRepository.findById(uid, gid);

    if (existing) {
      // Update username if changed
      if (existing.username !== username) {
        existing.updateUsername(username);
        return this.userRepository.save(existing);
      }
      return existing;
    }

    const user = UserEntity.create(uid, username, gid);
    return this.userRepository.save(user);
  }

  async getById(userId: string, guildId: string): Promise<UserEntity> {
    const uid = SnowflakeId.create(userId);
    const gid = SnowflakeId.create(guildId);

    const user = await this.userRepository.findById(uid, gid);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }

  async addXp(
    userId: string,
    guildId: string,
    amount: number
  ): Promise<{ user: UserEntity; leveledUp: boolean }> {
    const user = await this.getById(userId, guildId);
    const leveledUp = user.addXp(amount);
    const saved = await this.userRepository.save(user);

    return { user: saved, leveledUp };
  }

  async getLeaderboard(guildId: string, limit = 10): Promise<UserEntity[]> {
    const gid = SnowflakeId.create(guildId);
    return this.userRepository.findTopByXp(gid, limit);
  }

  async getUserWithGuild(userId: string, guildId: string): Promise<UserWithGuild> {
    const user = await this.getById(userId, guildId);
    const gid = SnowflakeId.create(guildId);
    const guild = await this.guildRepository.findById(gid);

    return {
      user,
      guildName: guild?.name ?? 'Unknown',
    };
  }
}
