#!/bin/sh
set -e

DATA_DIR="${DATA_DIR:-/app/data}"
mkdir -p "$DATA_DIR"

if [ ! -s "$DATA_DIR/guests.json" ]; then
  if [ -f /app/data.seed/guests.json ]; then
    cp /app/data.seed/guests.json "$DATA_DIR/guests.json"
  else
    printf '[]\n' > "$DATA_DIR/guests.json"
  fi
fi

exec node server.js
