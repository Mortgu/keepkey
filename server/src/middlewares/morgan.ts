import morgan from 'morgan';
import logger from './logger.js';

const morganMiddleware = morgan((tokens, req, res) => {
    const status = Number(tokens.status(req, res));
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);

    const data = {
        requestId: (req as any).id,
        method,
        url,
        status,
        responseTime: `${tokens['response-time'](req, res)}ms`,
        contentLength: tokens.res(req, res, 'content-length'),
        userAgent: tokens['user-agent'](req, res),
    };

    let level: 'info' | 'warn' | 'error';
    if (status >= 500) {
        level = 'error';
    } else if (status >= 400) {
        level = 'warn';
    } else {
        level = 'info';
    }

    logger.log(level, 'http_request', data);
}, {
    // Override default stream — we handle logging ourselves above
    stream: { write: () => {} },
});

export default morganMiddleware;