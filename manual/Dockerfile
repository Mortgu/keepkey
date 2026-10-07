FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder
WORKDIR /manual
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project
COPY mkdocs.yml ./
COPY docs ./docs
RUN uv run mkdocs build --strict

FROM nginx:alpine
COPY --from=builder /manual/site /usr/share/nginx/html
EXPOSE 80
