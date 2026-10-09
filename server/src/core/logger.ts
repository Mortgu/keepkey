import winston from 'winston';

import env from '@/config/env.js';
import { getRequestContext } from './request-context.js';

const { combine, json, timestamp, colorize, printf, errors } = winston.format;

/* Request-ID/User-ID des laufenden Requests an jede Logzeile hängen. */
const requestContextFormat = winston.format((info) => {
    const context = getRequestContext();
    if (context) {
        info.requestId ??= context.requestId;
        if (context.userId) info.userId ??= context.userId;
    }
    return info;
});

const serializeError = (error: Error) => ({
    name: error.name,
    message: error.message,
    ...((error as { code?: unknown }).code !== undefined && { code: (error as { code?: unknown }).code }),
    stack: error.stack,
});

/* Error-Objekte in Metadaten (`{ error }`) würden von JSON.stringify zu `{}`. */
const serializeErrorsFormat = winston.format((info) => {
    for (const [key, value] of Object.entries(info)) {
        if (value instanceof Error) {
            (info as Record<string, unknown>)[key] = serializeError(value);
        }
    }
    return info;
});

const baseFormat = combine(
    errors({ stack: true }),
    requestContextFormat(),
    serializeErrorsFormat(),
);

const prettyFormat = combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    printf(({ timestamp, level, message, stack, service: _service, ...meta }) => {
        // Stack aus `{ error }` herausziehen, damit er mehrzeilig lesbar bleibt.
        let errorStack: unknown;
        if (meta.error && typeof meta.error === 'object' && 'stack' in meta.error) {
            const { stack: nestedStack, ...error } = meta.error as { stack?: unknown };
            errorStack = nestedStack;
            meta.error = error;
        }
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        const stackValue = stack ?? errorStack;
        const stackStr = typeof stackValue === 'string' ? `\n${stackValue}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}${stackStr}`;
    }),
);

const jsonFormat = combine(timestamp(), json());

const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: baseFormat,
    defaultMeta: { service: 'keepit' },
    transports: [
        // stdout ist in jeder Umgebung der primäre Kanal — in Produktion liest
        // die Plattform (Railway/Docker) die Logs von dort.
        new winston.transports.Console({
            format: env.NODE_ENV === 'production' ? jsonFormat : prettyFormat,
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: jsonFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});

export default logger;
