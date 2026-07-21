FROM node:22-slim AS builder
WORKDIR /app

COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/
RUN cd server && npm install && npx prisma generate --schema prisma/schema

COPY client/package*.json ./client/
RUN cd client && npm install

COPY . .
RUN cd client && npm run generate:types && VITE_API_BASE_URL="" npx vite build
RUN cd server && npx tsc --project tsconfig.json && npx tsc-alias --project tsconfig.json && npx tsc --project tsconfig.seed.json && npx tsc-alias --project tsconfig.seed.json && npm prune --production


FROM node:22-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    default-jre \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/dist-seed ./dist-seed
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./package.json
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/assets ./assets
COPY --from=builder /app/server/prisma.config.js ./prisma.config.js
COPY --from=builder /app/client/dist ../client/dist
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]