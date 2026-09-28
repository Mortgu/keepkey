#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until node --input-type=commonjs -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect().then(() => { client.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done
echo "PostgreSQL is ready."

echo "Waiting for Redis..."
until node --input-type=commonjs -e "
  const { createClient } = require('redis');
  const client = createClient({ url: process.env.REDIS_URL });
  client.connect().then(() => { client.quit(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done
echo "Redis is ready."

# Migrationen und Seeding laufen nicht mehr bei jedem Start, sondern als
# eigener Deployment-Schritt mit demselben Image, z. B.:
#   docker run --rm <image> npx prisma migrate deploy --schema prisma/schema
#   docker run --rm <image> node dist-seed/prisma/seed.js
exec "$@"
