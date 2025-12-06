import type { GuildEntity } from '../entities/index.js';
import type { GuildId } from '../value-objects/index.js';

export interface IGuildRepository {
  findById(id: GuildId): Promise<GuildEntity | null>;
  findAll(): Promise<GuildEntity[]>;
  save(guild: GuildEntity): Promise<GuildEntity>;
  delete(id: GuildId): Promise<void>;
  exists(id: GuildId): Promise<boolean>;
}
