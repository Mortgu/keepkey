import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { requestContext } from '../request-context.js';

declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    req.id = randomUUID();
    // Header, damit der Client die ID in Fehlermeldungen anzeigen kann.
    res.setHeader('X-Request-Id', req.id);
    requestContext.run({ requestId: req.id }, next);
}
