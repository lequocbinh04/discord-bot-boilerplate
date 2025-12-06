import { BaseEntity } from './base-entity.js';
import type { UserId, GuildId } from '../value-objects/index.js';

export interface UserProps {
  id: UserId;
  username: string;
  guildId: GuildId;
  xp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity extends BaseEntity<UserId> {
  public username: string;
  public readonly guildId: GuildId;
  public xp: number;
  public level: number;

  private static readonly XP_PER_LEVEL = 100;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.username = props.username;
    this.guildId = props.guildId;
    this.xp = props.xp;
    this.level = props.level;
  }

  static create(id: UserId, username: string, guildId: GuildId): UserEntity {
    const now = new Date();
    return new UserEntity({
      id,
      username,
      guildId,
      xp: 0,
      level: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  addXp(amount: number): boolean {
    if (amount < 0) {
      throw new Error('XP amount cannot be negative');
    }

    this.xp += amount;
    this.touch();

    // Check for level up
    const newLevel = Math.floor(this.xp / UserEntity.XP_PER_LEVEL) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      return true; // Level up occurred
    }

    return false;
  }

  getXpForNextLevel(): number {
    return this.level * UserEntity.XP_PER_LEVEL - this.xp;
  }

  updateUsername(newUsername: string): void {
    this.username = newUsername;
    this.touch();
  }
}
