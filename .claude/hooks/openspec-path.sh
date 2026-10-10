#!/usr/bin/env bash
# SessionStart hook: put the repo's pinned CLIs (node_modules/.bin) on PATH
# for the agent's Bash commands. The openspec-* skills run plain `openspec`, so
# without this an agent gets whatever global version is installed, or none.
set -euo pipefail

bin="${CLAUDE_PROJECT_DIR:-$PWD}/node_modules/.bin"

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

if [ ! -x "$bin/openspec" ]; then
  echo "openspec isn't installed in node_modules; run \`npm install\` before using the openspec-* skills."
fi
