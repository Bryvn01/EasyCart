#!/usr/bin/env sh
# wait-for-it.sh: Wait for a host and port to be available
# Usage: wait-for-it.sh host:port -- command args

set -e

HOST_PORT="$1"
shift
HOST="${HOST_PORT%%:*}"
PORT="${HOST_PORT##*:}"

while ! nc -z "$HOST" "$PORT"; do
  echo "Waiting for $HOST:$PORT..."
  sleep 1
done

echo "$HOST:$PORT is available. Starting command."
exec "$@"
