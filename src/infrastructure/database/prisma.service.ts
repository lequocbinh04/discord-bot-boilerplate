import { singleton, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { TOKENS } from '../container/tokens.js';
import type { ILogger } from '../logging/index.js';

@singleton()
export class PrismaService extends PrismaClient {
  constructor(@inject(TOKENS.Logger) private readonly logger: ILogger) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    // @ts-expect-error - Prisma event typing limitation
    this.$on('query', (e: { query: string; duration: number }) => {
      this.logger.debug('Prisma Query', { query: e.query, duration: e.duration });
    });

    // @ts-expect-error - Prisma event typing limitation
    this.$on('error', (e: { message: string }) => {
      this.logger.error('Prisma Error', { message: e.message });
    });
  }

  async connect(): Promise<void> {
    await this.$connect();
    this.logger.info('Database connected');
  }

  async disconnect(): Promise<void> {
    await this.$disconnect();
    this.logger.info('Database disconnected');
  }
}
