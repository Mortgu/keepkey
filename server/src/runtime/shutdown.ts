import logger from "@/utils/logger.js";
import { flushLogger, isLoggerClosed } from "./bootstrap.js";

export type ShutdownStep = {
    name: string;
    run: () => Promise<unknown>;
};

/**
 * Führt die Schritte nacheinander aus und lässt den Prozess danach von selbst
 * enden. `process.exit()` greift nur als Fallback, falls ein Schritt hängt oder
 * ein vergessenes Handle den Event-Loop am Leben hält.
 */
export function createShutdown(steps: ShutdownStep[], options: { timeoutMs: number }) {
    let started = false;

    return async function shutdown(signal: string): Promise<void> {
        if (started) return;
        started = true;

        logger.info("shutdown_started", { signal });

        setTimeout(() => {
            if (!isLoggerClosed()) logger.error("shutdown_timeout", { timeoutMs: options.timeoutMs });
            process.exit(1);
        }, options.timeoutMs).unref();

        let failed = false;
        for (const step of steps) {
            try {
                await step.run();
            } catch (error) {
                failed = true;
                logger.error("shutdown_step_failed", { step: step.name, error });
            }
        }

        logger.info("shutdown_completed", { failed });
        process.exitCode = failed ? 1 : 0;
        await flushLogger();
    };
}

export function registerShutdown(steps: ShutdownStep[], options: { timeoutMs: number }): void {
    const shutdown = createShutdown(steps, options);
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
}
