#!/bin/sh
set -e

node scripts/migrate.mjs
node scripts/telegram.mjs webhook || echo "Telegram webhook was not registered"

exec node server.js
