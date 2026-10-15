#!/usr/bin/env bash
# Pull the latest main and restart Broadway Opticals in place.
#
#   ssh ubuntu@<host> 'bash /var/www/broadway/deploy/update.sh'
#
# Safe to re-run. It does not touch .env or the database contents; schema
# changes are applied with `prisma db push`.
set -euo pipefail

APP_DIR=/var/www/broadway
cd "$APP_DIR"

echo "→ pulling"
git pull --ff-only origin main

echo "→ installing dependencies"
npm ci --no-audit --no-fund

echo "→ syncing database schema"
npx prisma generate
npx prisma db push --skip-generate

echo "→ building"
# The instance has 908 MB of RAM plus swap; capping the heap keeps the build
# from being OOM-killed partway through.
NODE_OPTIONS='--max-old-space-size=1536' npm run build

# The standalone bundle resolves public/ and .next/static relative to its own
# directory, so both are copied in beside server.js on every build.
echo "→ preparing standalone bundle"
rm -rf .next/standalone/public .next/standalone/.next/static
cp -r public .next/standalone/public
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp .env .next/standalone/.env
chmod 600 .next/standalone/.env

echo "→ restarting"
pm2 reload broadway --update-env
pm2 save

sleep 2
curl -fsS -o /dev/null -w "→ health check: HTTP %{http_code}\n" http://127.0.0.1:3000/
echo "✓ deployed"
