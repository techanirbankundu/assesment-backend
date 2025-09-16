import winston from 'winston';
import { mkdirSync, existsSync } from 'fs';
import { config } from '../config/config.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Create transports array
const transports = [
  // Console transport
  new winston.transports.Console({
    format: config.nodeEnv === 'development' ? consoleFormat : logFormat
  })
];

// Add file transports only if logs directory exists
if (existsSync('logs')) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'ragilly-backend' },
  transports,
  
  // Handle exceptions and rejections
  exceptionHandlers: existsSync('logs') ? [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ] : [],
  rejectionHandlers: existsSync('logs') ? [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ] : []
});

// Create logs directory if it doesn't exist
if (!existsSync('logs')) {
  try {
    mkdirSync('logs', { recursive: true });
  } catch (error) {
    console.warn('Could not create logs directory:', error.message);
  }
}

export { logger };
