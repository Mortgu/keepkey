.PHONY: dev install build docker-build docker-up docker-down docker-logs docker-clean bucket-cors bucket-cors-dry db-generate db-migrate db-seed db-reset db-studio lint clean

# ── Development ──

dev:
	npm --prefix server run dev & npm --prefix client run dev & wait

# ── Dependencies ──

install:
	npm --prefix server ci
	npm --prefix client install

# ── Build ──

build:
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

# ── Object storage ──

bucket-cors:
	npm --prefix server run cors:apply

bucket-cors-dry:
	npm --prefix server run cors:apply -- --dry-run

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

# ── Linting ──

lint:
	npm --prefix client run lint || true
	npx --prefix server tsc --noEmit --project tsconfig.json

# ── Cleanup ──

clean:
	rm -rf server/dist server/prisma/schema/openapi
	rm -rf client/dist
