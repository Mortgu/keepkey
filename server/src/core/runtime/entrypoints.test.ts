import net from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redisInstances = vi.hoisted(() => [] as unknown[]);
const workerInstances = vi.hoisted(() => [] as unknown[]);

vi.mock("ioredis", () => {
    class Redis {
        constructor() {
            redisInstances.push(this);
        }
        quit = vi.fn(async () => "OK");
        disconnect = vi.fn();
    }
    return { Redis, default: Redis };
});

vi.mock("bullmq", async (importOriginal) => {
    const actual = await importOriginal<typeof import("bullmq")>();
    class Worker {
        constructor() {
            workerInstances.push(this);
        }
        on = vi.fn();
        close = vi.fn(async () => undefined);
    }
    return { ...actual, Worker };
});

vi.mock("@/modules/documents/storage/artifact-store.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/modules/documents/storage/artifact-store.js")>()),
    initDocumentArtifactStore: vi.fn(async () => undefined),
}));

vi.mock("@/modules/integrations/nextcloud.client.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/modules/integrations/nextcloud.client.js")>()),
    initNextcloud: vi.fn(async () => false),
}));

describe("entry points", () => {
    let listenSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        redisInstances.length = 0;
        workerInstances.length = 0;
        listenSpy = vi.spyOn(net.Server.prototype, "listen");
    });

    afterEach(() => {
        listenSpy.mockRestore();
    });

    it("createApp() opens neither a port nor a Redis connection", async () => {
        const { createApp } = await import("@/app.js");

        createApp();

        expect(listenSpy).not.toHaveBeenCalled();
        expect(redisInstances).toHaveLength(0);
        expect(workerInstances).toHaveLength(0);
    });

    it("startApi() serves HTTP without registering a worker or connecting to Redis", async () => {
        const { startApi } = await import("./api-runtime.js");

        const { server, shutdownSteps } = await startApi();

        try {
            expect(server.listening).toBe(true);
            expect(workerInstances).toHaveLength(0);
            // Die Producer-Queue entsteht erst beim ersten Enqueue.
            expect(redisInstances).toHaveLength(0);
        } finally {
            for (const step of shutdownSteps) await step.run();
        }

        expect(server.listening).toBe(false);
    });

    it("startWorker() registers the worker without opening an HTTP port", async () => {
        const { startWorker } = await import("./worker-runtime.js");

        const { worker, shutdownSteps } = await startWorker();
        for (const step of shutdownSteps) await step.run();

        expect(workerInstances).toEqual([worker]);
        expect(listenSpy).not.toHaveBeenCalled();
        expect(worker.close).toHaveBeenCalledOnce();
        expect((redisInstances[0] as { quit: () => void }).quit).toHaveBeenCalledOnce();
    });
});
