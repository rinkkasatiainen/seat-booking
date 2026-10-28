#!/usr/bin/env bash
# Start Postgres, RabbitMQ, api, and bookings in Docker.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$root"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

compose=(docker compose -f docker-compose-dev.yaml)

echo "Starting Postgres, RabbitMQ, api, and bookings..."
"${compose[@]}" up --build -d

echo "Waiting until the health checks answer..."
for _ in $(seq 1 60); do
  if curl -fsS "http://localhost:4000/health/check" >/dev/null \
    && curl -fsS "http://localhost:4100/health/check" >/dev/null; then
    cat <<'EOF'

API        http://localhost:4000/health/check
Bookings   http://localhost:4100/health/check
RabbitMQ   http://localhost:8881   guest / guest
Postgres   localhost:5432          user1 / pass1

Stop with: docker compose -f docker-compose-dev.yaml down
EOF
    exit 0
  fi
  sleep 2
done

echo "Services did not become ready. Recent logs:" >&2
"${compose[@]}" logs --tail 40 api bookings rabbit-dev postgres >&2
exit 1
