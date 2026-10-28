#!/usr/bin/env bash
# RabbitMQ 4.4 hangs during boot if management.load_definitions is set.
# Start the broker first, then import exchanges, queues, and bindings.
set -euo pipefail

docker-entrypoint.sh rabbitmq-server &
server_pid=$!

cleanup() {
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
}
trap cleanup TERM INT

# Diagnostics must run as the rabbitmq user. As root they create
# /var/lib/rabbitmq/.erlang.cookie with mode 400, and the broker cannot read it.
for _ in $(seq 1 60); do
    if gosu rabbitmq rabbitmq-diagnostics -q check_running; then
        break
    fi
    if ! kill -0 "$server_pid" 2>/dev/null; then
        echo "rabbitmq-server exited before it finished booting" >&2
        wait "$server_pid"
        exit 1
    fi
    sleep 2
done

if ! gosu rabbitmq rabbitmq-diagnostics -q check_running; then
    echo "rabbitmq did not finish booting" >&2
    exit 1
fi

gosu rabbitmq rabbitmqctl import_definitions /etc/rabbitmq/definitions.json
wait "$server_pid"
