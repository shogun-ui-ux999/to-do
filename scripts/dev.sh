#!/bin/sh
# Preview runtime for this project: the app needs the local Convex backend
# (functions, database, auth) in addition to the Vite dev server.
set -u

bun convex dev &
convex_pid=$!

cleanup() {
  kill "$convex_pid" 2>/dev/null
}
trap cleanup EXIT TERM INT

bun run dev -- --host 0.0.0.0
