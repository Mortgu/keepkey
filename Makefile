.PHONY: dev install build build-shared docker-build docker-up docker-down docker-logs docker-clean bucket-cors bucket-cors-dry db-generate db-migrate db-seed db-reset db-studio lint test clean

# ── Development ──

dev:
	pnpm dev

# ── Dependencies ──

install:
	pnpm install --frozen-lockfile

# ── Build ──

build-shared:
	pnpm --filter @keepit/schemas build

# Baut shared zuerst (Produktions-Builds konsumieren shared/dist), danach Client und Server.
build:
	pnpm build

# ── Docker ──

docker-build:
	docker build -t keepit:latest .

docker-up:
	docker compose --project-directory dev up -d

docker-down:
	docker compose --project-directory dev down

docker-logs:
	docker compose --project-directory dev logs -f

docker-clean:
	docker compose --project-directory dev down -v
	docker rmi keepit:latest || true

# ── Object storage ──

bucket-cors:
	pnpm --filter server cors:apply

bucket-cors-dry:
	pnpm --filter server cors:apply -- --dry-run

# ── Database ──

db-generate:
	pnpm --filter server exec prisma generate

db-migrate:
	pnpm --filter server exec prisma migrate dev

db-seed:
	pnpm --filter server seed

db-reset: db-migrate db-seed

db-studio:
	pnpm --filter server exec prisma studio

# ── Quality ──

lint:
	pnpm --filter client lint || true
	pnpm --filter server exec tsc --noEmit --project tsconfig.json

test:
	pnpm test

# ── Cleanup ──

clean:
	rm -rf shared/dist
	rm -rf server/dist server/dist-seed server/prisma/schema/openapi
	rm -rf client/dist
