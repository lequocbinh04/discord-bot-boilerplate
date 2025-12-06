export interface ILogger {
  info(msg: string, data?: object): void;
  error(msg: string, data?: object): void;
  warn(msg: string, data?: object): void;
  debug(msg: string, data?: object): void;
  child(bindings: object): ILogger;
}
