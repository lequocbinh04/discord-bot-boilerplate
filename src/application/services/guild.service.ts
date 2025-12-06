import { injectable, inject } from 'tsyringe';
import type { IGuildRepository } from '../../domain/interfaces/index.js';
import { GuildEntity, SnowflakeId } from '../../domain/index.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';
import { NotFoundError } from '../errors/index.js';

@injectable()
export class GuildService {
  constructor(
    @inject(TOKENS.GuildRepository)
    private readonly guildRepository: IGuildRepository
  ) {}

  async getOrCreate(guildId: string, guildName: string): Promise<GuildEntity> {
    const id = SnowflakeId.create(guildId);
    const existing = await this.guildRepository.findById(id);

    if (existing) {
      // Update name if changed
      if (existing.name !== guildName) {
        existing.updateName(guildName);
        return this.guildRepository.save(existing);
      }
      return existing;
    }

    const guild = GuildEntity.create(id, guildName);
    return this.guildRepository.save(guild);
  }

  async getById(guildId: string): Promise<GuildEntity> {
    const id = SnowflakeId.create(guildId);
    const guild = await this.guildRepository.findById(id);

    if (!guild) {
      throw new NotFoundError('Guild', guildId);
    }

    return guild;
  }

  async updatePrefix(guildId: string, prefix: string): Promise<GuildEntity> {
    const guild = await this.getById(guildId);
    guild.updatePrefix(prefix);
    return this.guildRepository.save(guild);
  }
}
