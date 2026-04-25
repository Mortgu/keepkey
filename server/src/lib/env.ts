import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import 'dotenv/config';

const env = createEnv({
    server: {
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.string().url(),

        TEMPLATES_DIR: z.string().min(1),
        OUTPUT_DIR: z.string().min(1),

        DATABASE_URL: z.url(),

        PORT: z.string(),
        NODE_ENV: z.string(),
    },

    experimental__runtimeEnv: {}
});

export default env;