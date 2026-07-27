FROM node:22-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Copy workspace manifests first for layer cache
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY server/prisma ./server/prisma

RUN pnpm install --frozen-lockfile
RUN pnpm --filter server exec prisma generate --schema prisma/schema

COPY . .
RUN pnpm --filter @keepit/schemas build
RUN pnpm --filter client run generate:types && VITE_API_BASE_URL="" pnpm --filter client exec vite build
RUN pnpm --filter server exec tsc --project tsconfig.json && \
    pnpm --filter server exec tsc-alias --project tsconfig.json && \
    pnpm --filter server exec tsc --project tsconfig.seed.json && \
    pnpm --filter server exec tsc-alias --project tsconfig.seed.json

# Prune to production deps only (hoisted -> root node_modules)
RUN pnpm install --frozen-lockfile --prod


FROM node:22-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    default-jre \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

COPY --from=builder /app/node_modules ../node_modules
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/shared/dist ../shared/dist
COPY --from=builder /app/shared/package.json ../shared/package.json
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/dist-seed ./dist-seed
COPY --from=builder /app/server/package.json ./package.json
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/assets ./assets
COPY --from=builder /app/server/prisma.config.js ./prisma.config.js
COPY --from=builder /app/client/dist ../client/dist
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
