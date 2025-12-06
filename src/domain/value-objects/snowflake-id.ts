/**
 * Discord Snowflake ID value object
 * Provides type safety for Discord IDs
 */
export class SnowflakeId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): SnowflakeId {
    if (!SnowflakeId.isValid(value)) {
      throw new Error(`Invalid Snowflake ID: ${value}`);
    }
    return new SnowflakeId(value);
  }

  static isValid(value: string): boolean {
    // Discord snowflakes are 17-19 digit numbers
    return /^\d{17,19}$/.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: SnowflakeId): boolean {
    return this.value === other.value;
  }
}

// Type aliases for clarity
export type UserId = SnowflakeId;
export type GuildId = SnowflakeId;
export type ChannelId = SnowflakeId;
