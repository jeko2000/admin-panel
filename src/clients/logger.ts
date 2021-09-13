import * as winston from 'winston';
import { config } from './config';

const DEFAULT_LOGGER_LEVER = 'debug';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSS' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level.toUpperCase()} ${info.message}`,
  )
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'log/admin-panel.log'
  })
]

const level = config.getStringOrElse('logger.level', DEFAULT_LOGGER_LEVER);

export const logger = winston.createLogger({
  level,
  levels,
  format,
  transports
});

export default logger;
