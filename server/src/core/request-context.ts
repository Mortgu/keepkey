import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Kontext des laufenden HTTP-Requests. Wird vom requestIdMiddleware angelegt
 * und vom Logger gelesen, damit jede Logzeile — auch aus Services, Pipelines
 * oder Prisma-Callbacks — Request-ID und User-ID trägt, ohne dass diese durch
 * alle Funktionsaufrufe gereicht werden müssen.
 */
export interface RequestContext {
    requestId: string;
    userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = (): RequestContext | undefined => requestContext.getStore();
