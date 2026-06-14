#!/usr/bin/env bash
# tools/mac-vault-publish.sh
# Runs by launchd every 10 min (see tools/launchd/io.marsdesigns.gardenos-vault-publish.plist).
#
# Watches the Obsidian vault and re-publishes the site whenever vault notes
# change. Idempotent: tools/sync.ts always writes content/, then git only
# commits + pushes if there is an actual diff. No-op runs are cheap.
#
# This closes the loop for the iOS update path:
#   iOS Claude → vault (via Drive MCP or direct write) → this job → site

set -euo pipefail

REPO="${GARDENOS_REPO:-$HOME/code/gardenos-web}"
VAULT="${GARDEN_VAULT_PATH:-$HOME/Documents/MaRs/Projects/Garden Monitor}"
LOG="$HOME/Library/Logs/gardenos-vault-publish.log"

log() { printf "[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG"; }

if [ ! -d "$REPO/.git" ]; then
  log "ERROR: repo not found at $REPO"
  exit 1
fi

if [ ! -d "$VAULT" ]; then
  log "ERROR: vault not found at $VAULT"
  exit 1
fi

cd "$REPO"

# Skip if working tree is dirty in a way the user is mid-editing — never
# auto-publish on top of unrelated uncommitted changes.
if [ -n "$(git status --porcelain -- content public/_assets)" ]; then
  log "skip: pending unstaged changes under content/ or public/_assets — user is mid-edit"
  exit 0
fi

# Make sure we're on main and up to date before publishing.
git fetch --quiet origin main
LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git rev-parse origin/main)
if [ "$LOCAL_SHA" != "$REMOTE_SHA" ]; then
  current=$(git rev-parse --abbrev-ref HEAD)
  if [ "$current" != "main" ]; then
    log "skip: not on main (on $current); won't auto-publish from a feature branch"
    exit 0
  fi
  git pull --quiet --ff-only origin main || { log "ERROR: pull failed"; exit 1; }
fi

GARDEN_VAULT_PATH="$VAULT" npm run publish 2>&1 | sed 's/^/  /' | tee -a "$LOG" >/dev/null
log "publish run complete"
