import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const flushLogger = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("./bootstrap.js", () => ({
    flushLogger,
    isLoggerClosed: () => false,
}));

import { createShutdown } from "./shutdown.js";

describe("createShutdown", () => {
    let exitSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.useFakeTimers();
        flushLogger.mockClear();
        exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
    });

    afterEach(() => {
        vi.useRealTimers();
        exitSpy.mockRestore();
        process.exitCode = undefined;
    });

    it("runs steps in order, flushes the logger and exits without process.exit()", async () => {
        const calls: string[] = [];
        const shutdown = createShutdown([
            { name: "http", run: async () => { calls.push("http"); } },
            { name: "queue", run: async () => { calls.push("queue"); } },
        ], { timeoutMs: 1_000 });

        await shutdown("SIGTERM");

        expect(calls).toEqual(["http", "queue"]);
        expect(flushLogger).toHaveBeenCalledOnce();
        expect(process.exitCode).toBe(0);
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it("continues after a failing step and reports a non-zero exit code", async () => {
        const later = vi.fn(async () => undefined);
        const shutdown = createShutdown([
            { name: "broken", run: async () => { throw new Error("boom"); } },
            { name: "later", run: later },
        ], { timeoutMs: 1_000 });

        await shutdown("SIGTERM");

        expect(later).toHaveBeenCalledOnce();
        expect(process.exitCode).toBe(1);
    });

    it("runs only once for repeated signals", async () => {
        const step = vi.fn(async () => undefined);
        const shutdown = createShutdown([{ name: "step", run: step }], { timeoutMs: 1_000 });

        await Promise.all([shutdown("SIGTERM"), shutdown("SIGINT")]);

        expect(step).toHaveBeenCalledOnce();
    });

    it("forces process.exit(1) when a step hangs past the timeout", async () => {
        const shutdown = createShutdown([
            { name: "hangs", run: () => new Promise(() => undefined) },
        ], { timeoutMs: 1_000 });

        void shutdown("SIGTERM");
        await vi.advanceTimersByTimeAsync(1_000);

        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});
