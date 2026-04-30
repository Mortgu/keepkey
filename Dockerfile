FROM node:22-slim

RUN apt-get update && apt-get install -y libreoffice --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server/ ./server/
RUN cd server && npm run build

EXPOSE 3000
WORKDIR /app/server
CMD ["node", "dist/server.js"]
