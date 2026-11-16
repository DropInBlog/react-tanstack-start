#!/usr/bin/env bash
# Installs the packed package into a fresh TanStack Start fixture app on the given
# @tanstack/react-start version, checks which server-function input method the
# installer chose, then boots the dev server and requests /blog.
#
#   scripts/smoke-fixture.sh <react-start-version> <expected-method>
#   scripts/smoke-fixture.sh 1.168.61 inputValidator
#   scripts/smoke-fixture.sh latest validator
#
# With DROPINBLOG_BLOG_ID and DROPINBLOG_API_KEY set, /blog must return 200.
# Without them /blog returns 500 from the credential check, so the script checks
# that the server function ran far enough to reach that check.
set -euo pipefail

version="$1"
expected="$2"
repo="$(cd "$(dirname "$0")/.." && pwd)"
app="$(mktemp -d)/start-app"
port="${PORT:-3100}"

npm run build --prefix "$repo" >/dev/null
tarball="$(cd "$repo" && npm pack --silent --pack-destination "$(dirname "$app")")"

cp -R "$repo/tests/fixtures/start-app" "$app"
cd "$app"
cat > package.json <<EOF
{ "name": "start-fixture", "private": true, "type": "module" }
EOF
# Use the exact router version this react-start release was built against.
router="$(npm view "@tanstack/react-start@$version" 'dependencies.@tanstack/react-router')"
npm install --no-audit --no-fund --loglevel=error \
  "@tanstack/react-start@$version" "@tanstack/react-router@$router" react@19 react-dom@19 \
  vite @vitejs/plugin-react @dropinblog/react-core "../$tarball"

installed="$(node -p "require('./node_modules/@tanstack/react-start/package.json').version")"
echo "Fixture uses @tanstack/react-start $installed"

npx dropinblog-tanstack install

method="$(sed -nE 's/^[[:space:]]*\.(validator|inputValidator)\(.*/\1/p' src/routes/blog/-data.ts)"
if [ "$method" != "$expected" ]; then
  echo "FAIL: expected .$expected(...) in -data.ts, got .${method:-none}(...)"
  exit 1
fi
echo "OK: -data.ts uses .$method(...)"

./node_modules/.bin/vite dev --port "$port" --strictPort >"$app/dev.log" 2>&1 &
server=$!
trap 'kill $server 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  curl -s -o /dev/null "http://localhost:$port/" && break
  sleep 1
done

status="$(curl -s -o "$app/blog.html" -w '%{http_code}' "http://localhost:$port/blog")"
echo "GET /blog -> $status"

if grep -q 'is not a function' "$app/blog.html" "$app/dev.log"; then
  echo "FAIL: server function method is not supported by this version"
  grep -h 'is not a function' "$app/blog.html" "$app/dev.log" | head -3
  exit 1
fi

if [ -n "${DROPINBLOG_BLOG_ID:-}" ] && [ -n "${DROPINBLOG_API_KEY:-}" ]; then
  if [ "$status" != "200" ]; then
    echo "FAIL: expected 200 from /blog"
    tail -30 "$app/dev.log"
    exit 1
  fi
elif grep -q 'DROPINBLOG_BLOG_ID environment variable is required' "$app/blog.html"; then
  echo "DropInBlog credentials not set; the server function ran and reached the credential check."
else
  echo "FAIL: /blog did not reach the server function"
  tail -30 "$app/dev.log"
  exit 1
fi
echo "OK"
