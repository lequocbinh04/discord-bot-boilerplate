import { container } from 'tsyringe';
import { TOKENS } from './tokens.js';
import { ConfigService } from '../config/index.js';
import { LoggerService, type ILogger } from '../logging/index.js';
import { PrismaService } from '../database/index.js';
import { GuildRepository, UserRepository } from '../database/repositories/index.js';
import { GuildService } from '@application/services/guild.service.js';
import { UserService } from '@application/services/user.service.js';

export function setupContainer() {
  // Config - must be first (validates env vars)
  container.registerSingleton(TOKENS.Config, ConfigService);

  // Logger
  container.registerSingleton<ILogger>(TOKENS.Logger, LoggerService);

  // Database
  container.registerSingleton(TOKENS.PrismaClient, PrismaService);

  // Repositories
  container.registerSingleton(TOKENS.GuildRepository, GuildRepository);
  container.registerSingleton(TOKENS.UserRepository, UserRepository);

  // Services
  container.registerSingleton(TOKENS.GuildService, GuildService);
  container.registerSingleton(TOKENS.UserService, UserService);

  return container;
}

export { container };
