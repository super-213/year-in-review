#!/usr/bin/env sh
set -eu
PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec node "$PROJECT_DIR/scripts/local-service.mjs" start "$@"
