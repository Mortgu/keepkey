.PHONY: dev install build docker-build docker-up docker-down docker-logs docker-clean db-generate db-migrate db-seed db-reset db-studio generate-types lint clean

# ── Development ──

dev:
	npm --prefix server run dev & npm --prefix client run dev & wait

# ── Dependencies ──

install:
	npm --prefix server ci
	npm --prefix client install

# ── Build ──

build: generate-types
	npm --prefix server run build
	npm --prefix client run build

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

# ── Database ──

db-generate:
	npm --prefix server run build

db-migrate:
	npx --prefix server prisma migrate dev

db-seed:
	npm --prefix server run seed

db-reset: db-migrate db-seed

db-studio:
	npx --prefix server prisma studio --schema prisma/schema

# ── Code Generation ──

generate-types:
	npm --prefix client run generate:types

# ── Linting ──

lint:
	npm --prefix client run lint || true
	npx --prefix server tsc --noEmit --project tsconfig.json

# ── Cleanup ──

clean:
	rm -rf server/dist server/prisma/schema/openapi
	rm -rf client/dist
