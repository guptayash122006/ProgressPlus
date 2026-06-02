/**
 * src/utils/logger.js — Winston Logger
 * Structured logging with timestamps.
 * In production, logs are written as JSON; in development they are colourized.
 */

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

export default logger;
