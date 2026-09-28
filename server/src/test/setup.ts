// Unit tests never use workspace credentials or connect to external services.
import { vi } from "vitest";
vi.mock("../lib/env.js", () => ({
    default: {
        NODE_ENV: "test",
        LOG_LEVEL: "error",
        TEMPLATES_DIR: "assets/templates",
        DATABASE_URL: "postgresql://test:test@127.0.0.1:1/test",
        WORKER_CONCURRENCY: 1,
        // Port 1 ist geschlossen — Redis-Zugriffe scheitern, statt irgendwohin zu verbinden.
        REDIS_URL: "redis://127.0.0.1:1",
        PORT: 0,
        CORS_ORIGIN: "http://localhost",
        TASK_ENQUEUE_TIMEOUT_MS: 300,
        SHUTDOWN_TIMEOUT_MS: 1_000,
    },
}));
