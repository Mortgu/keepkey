import morgan from 'morgan';
import type { Request } from 'express';

import logger from '@/utils/logger.js';

const morganMiddleware = morgan<Request>((tokens, req, res) => {
    const status = Number(tokens.status(req, res));

    const data = {
        // Explizit statt über den Request-Kontext: morgan loggt erst beim
        // "finish"-Event, dort ist der AsyncLocalStorage nicht garantiert.
        requestId: req.id,
        userId: req.user?.id,
        method: tokens.method(req, res),
        url: tokens.url(req, res),
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
    return undefined;
}, {
    // Statische Client-Assets erzeugen sonst pro Seitenaufruf Dutzende Zeilen.
    skip: (req) => !req.originalUrl.startsWith('/api'),
    // Override default stream — we handle logging ourselves above
    stream: { write: () => { } },
});

export default morganMiddleware;
