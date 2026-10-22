import { createServer, type Server } from "node:net";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../lib/document-artifact-store.js", () => ({
    isS3Available: vi.fn(async () => true),
}));

/**
 * Minimaler Redis-Ersatz im Prozess: beantwortet INFO mit einer Version und
 * jeden anderen Befehl mit PONG. Ein echter Dienst wird nicht gebraucht.
 */
function startFakeRedis(): Promise<Server> {
    const server = createServer((socket) => {
        socket.on("data", (chunk) => {
            for (const command of chunk.toString().matchAll(/\*\d+\r\n\$\d+\r\n(\w+)\r\n/g)) {
                const name = command[1].toUpperCase();
                if (name === "INFO") {
                    const info = "redis_version:7.2.0\r\n";
                    socket.write(`$${info.length}\r\n${info}\r\n`);
                } else if (name === "QUIT") {
                    socket.end("+OK\r\n");
                } else {
                    socket.write("+PONG\r\n");
                }
            }
        });
    });

    return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

describe("getIntegrationStatus", () => {
    let server: Server;

    beforeAll(async () => {
        server = await startFakeRedis();
        const env = (await import("../lib/env.js")).default;
        Object.assign(env, { REDIS_URL: `redis://127.0.0.1:${(server.address() as AddressInfo).port}` });
    });

    afterAll(async () => {
        const { closeTaskQueue } = await import("../workers/task-queue.js");
        await closeTaskQueue();
        await new Promise((resolve) => server.close(resolve));
    });

    it("reports a reachable Redis as connected on the very first check", async () => {
        const { getIntegrationStatus } = await import("./integration.service.js");

        const status = await getIntegrationStatus();

        expect(status.redis).toMatchObject({ status: "connected" });
    });
});
