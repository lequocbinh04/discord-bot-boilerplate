export const TOKENS = {
  // Core
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),

  // Database
  PrismaClient: Symbol.for('PrismaClient'),

  // Repositories
  GuildRepository: Symbol.for('GuildRepository'),
  UserRepository: Symbol.for('UserRepository'),

  // Services
  GuildService: Symbol.for('GuildService'),
  UserService: Symbol.for('UserService'),
} as const;
