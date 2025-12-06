import { BaseEntity } from './base-entity.js';
import type { GuildId } from '../value-objects/index.js';

export interface GuildProps {
  id: GuildId;
  name: string;
  prefix: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GuildEntity extends BaseEntity<GuildId> {
  public name: string;
  public prefix: string;

  constructor(props: GuildProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.prefix = props.prefix;
  }

  static create(id: GuildId, name: string, prefix = '!'): GuildEntity {
    const now = new Date();
    return new GuildEntity({
      id,
      name,
      prefix,
      createdAt: now,
      updatedAt: now,
    });
  }

  updatePrefix(newPrefix: string): void {
    if (newPrefix.length > 5) {
      throw new Error('Prefix cannot exceed 5 characters');
    }
    this.prefix = newPrefix;
    this.touch();
  }

  updateName(newName: string): void {
    this.name = newName;
    this.touch();
  }
}
