import winston from 'winston';

import env from '@/lib/env.js';

const { combine, json, timestamp, colorize, printf } = winston.format;

const consoleFormat = combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
    }),
);

const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json(),
    ),
    defaultMeta: { service: 'keepit' },
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
        /*new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),*/
    ],
});

if (env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }))
}

export default logger;