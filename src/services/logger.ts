import * as winston from 'winston';

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

export const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports
})

export default logger;
