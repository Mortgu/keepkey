import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import "dotenv/config";

const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),

    TEMPLATES_DIR: z.string().min(1),
    OUTPUT_DIR: z.string().min(1),

    DATABASE_URL: z.url(),

    PORT: z.string(),
    NODE_ENV: z.string(),

    NEXTCLOUD_URL: z.url(),
    NEXTCLOUD_USER: z.string(),
    NEXTCLOUD_PASSWORD: z.string(),
    NEXTCLOUD_OFFER_PATH: z.string(),

    NEXTCLOUD_OFFER_PDF_PATH: z.string().default('/'),
    NEXTCLOUD_OFFER_ORIGINAL_PATH: z.string().default('/'),
    NEXTCLOUD_ORDER_PDF_PATH: z.string().default('/'),
    NEXTCLOUD_ORDER_ORIGINAL_PATH: z.string().default('/'),

    REDIS_URL: z.string().min(1),

    CORS_ORIGIN: z.string(),
  },

  experimental__runtimeEnv: {},
});

export default env;
