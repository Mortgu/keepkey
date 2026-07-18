import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import logger from './logger.js';

declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
    (req as any).id = randomUUID();
    (req as any).logger = logger.child({ requestId: (req as any).id });
    next();
}