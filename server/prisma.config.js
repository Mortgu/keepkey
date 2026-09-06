import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_URL"),
        shadowDatabaseUrl: env("SHADOW_DATABASE_URL", env("DATABASE_URL").replace(/\/[^/]+$/, "/keepit_shadow")),
    },
});