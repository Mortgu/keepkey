import { AsyncLocalStorage } from "node:async_hooks";

type RequestContext = { actorId: string | null };

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
    return storage.run(ctx, fn);
}

export function currentActorId(): string | null {
    return storage.getStore()?.actorId ?? null;
}