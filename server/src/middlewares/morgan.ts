import morgan from 'morgan';
import logger from './logger.js';

const morganMiddleware = morgan((tokens, req, res) => {
    return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTime: `${tokens['response-time'](req, res)}ms`,
        userAgent: tokens['user-agent'](req, res),
    });
}, {
    stream: {
        write: (message) => {
            const data = JSON.parse(message.trim());
            logger.info('http_request', data);
        },
    },
});

export default morganMiddleware;