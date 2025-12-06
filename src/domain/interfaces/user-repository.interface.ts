import type { UserEntity } from '../entities/index.js';
import type { UserId, GuildId } from '../value-objects/index.js';

export interface IUserRepository {
  findById(id: UserId, guildId: GuildId): Promise<UserEntity | null>;
  findByGuild(guildId: GuildId): Promise<UserEntity[]>;
  findTopByXp(guildId: GuildId, limit: number): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<UserEntity>;
  delete(id: UserId, guildId: GuildId): Promise<void>;
  exists(id: UserId, guildId: GuildId): Promise<boolean>;
}
