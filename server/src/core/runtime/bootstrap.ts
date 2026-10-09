/**
 * Gemeinsamer Prozess-Bootstrap für alle Entry-Points (API, Worker, kombiniert).
 * Muss als erster Import stehen, damit Umgebung und Fehlerbehandlung vor allem
 * anderen greifen.
 */
import "dotenv/config";

import logger from "../logger.js";

let loggerClosed = false;

/** Schreibt ausstehende Logzeilen weg; danach nimmt der Logger nichts mehr an. */
export function flushLogger(): Promise<void> {
    if (loggerClosed) return Promise.resolve();
    loggerClosed = true;
    return new Promise((resolve) => {
        logger.on("finish", () => resolve());
        logger.end();
    });
}

export function isLoggerClosed(): boolean {
    return loggerClosed;
}

process.on("unhandledRejection", (reason) => {
    logger.error("unhandled_rejection", { error: reason });
});

process.on("uncaughtException", (error) => {
    logger.error("uncaught_exception", { error });
    // Prozesszustand ist danach undefiniert — Plattform startet neu.
    void flushLogger().then(() => process.exit(1));
    setTimeout(() => process.exit(1), 2000).unref();
});
