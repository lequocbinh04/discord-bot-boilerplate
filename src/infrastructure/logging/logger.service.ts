import { injectable, inject } from 'tsyringe';
import pino, { type Logger as PinoLogger } from 'pino';
import { TOKENS } from '../container/tokens.js';
import { ConfigService } from '../config/index.js';
import type { ILogger } from './logger.interface.js';

@injectable()
export class LoggerService implements ILogger {
  private readonly logger: PinoLogger;

  constructor(@inject(TOKENS.Config) config: ConfigService) {
    this.logger = pino({
      level: config.app.logLevel,
      transport: config.app.isDevelopment
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    });
  }

  info(msg: string, data?: object) {
    this.logger.info(data, msg);
  }

  error(msg: string, data?: object) {
    this.logger.error(data, msg);
  }

  warn(msg: string, data?: object) {
    this.logger.warn(data, msg);
  }

  debug(msg: string, data?: object) {
    this.logger.debug(data, msg);
  }

  child(bindings: object): ILogger {
    const childLogger = this.logger.child(bindings);
    return {
      info: (msg, data) => childLogger.info(data, msg),
      error: (msg, data) => childLogger.error(data, msg),
      warn: (msg, data) => childLogger.warn(data, msg),
      debug: (msg, data) => childLogger.debug(data, msg),
      child: (b) => this.child({ ...bindings, ...b }),
    };
  }
}
