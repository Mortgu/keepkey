/**
 * Test bootstrap: provide safe defaults for required environment variables so
 * that importing modules which load `lib/env.ts` (which validates env at import
 * time) does not crash during tests. Only fills values that are not already set,
 * so a real local `.env` still wins.
 */
const defaults: Record<string, string> = {
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:3000",
  TEMPLATES_DIR: "./assets/templates",
  OUTPUT_DIR: "./uploads",
  DATABASE_URL: "postgres://user:pass@localhost:5432/test",
  PORT: "3000",
  NODE_ENV: "test",
  NEXTCLOUD_OFFER_PATH: "/",
  REDIS_URL: "redis://localhost:6379",
  CORS_ORIGIN: "http://localhost:5173",
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) process.env[key] = value;
}
