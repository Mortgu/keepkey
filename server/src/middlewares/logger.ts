import winston from 'winston';
import env from '../lib/env.js';

const {combine, json, timestamp} = winston.format;

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        json(),
    ),
    defaultMeta: {service: 'user-service'},
    transports: [
        new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
        //new winston.transports.File({filename: 'logs/combined.log'}),
    ],
});

if (env.NODE_ENV !== "production") {
    /*logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }))*/
}

export default logger;