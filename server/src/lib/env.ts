import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import "dotenv/config";

const env = createEnv({
    server: {
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.url(),

        TEMPLATES_DIR: z.string().min(1),

        S3_ENDPOINT: z.url(),
        S3_PUBLIC_ENDPOINT: z.url().optional(),
        S3_REGION: z.string().min(1).default("auto"),
        S3_BUCKET: z.string().min(1),
        S3_ACCESS_KEY_ID: z.string().min(1),
        S3_SECRET_ACCESS_KEY: z.string().min(1),
        S3_FORCE_PATH_STYLE: z.string().default("true").transform((value) => value === "true"),

        DATABASE_URL: z.url(),

        PORT: z.coerce.number(),
        NODE_ENV: z.enum(["development", "production", "test"]),
        LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),

        NEXTCLOUD_URL: z.string().url().optional(),
        NEXTCLOUD_USER: z.string().optional(),
        NEXTCLOUD_PASSWORD: z.string().optional(),
        NEXTCLOUD_OFFER_PATH: z.string(),

        NEXTCLOUD_TEMPLATES_PATH: z.string().default('/Templates'),

        NEXTCLOUD_OFFER_PDF_PATH: z.string().default('/'),
        NEXTCLOUD_OFFER_ORIGINAL_PATH: z.string().default('/'),
        NEXTCLOUD_ORDER_PDF_PATH: z.string().default('/'),
        NEXTCLOUD_ORDER_ORIGINAL_PATH: z.string().default('/'),

        REDIS_URL: z.string().min(1),
        WORKER_CONCURRENCY: z.coerce.number().default(2),

        CORS_ORIGIN: z.string(),
    },

    runtimeEnv: process.env,
});

export default env;
