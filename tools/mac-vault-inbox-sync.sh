#!/usr/bin/env bash
# tools/mac-vault-inbox-sync.sh
# Run by launchd every 5 min (see tools/launchd/io.marsdesigns.gardenos-inbox-sync.plist)
#
# What it does:
#   1. cd into a dedicated mirror clone of gardenos-web
#   2. git pull from main
#   3. If HEAD changed since last run, rsync vault-inbox/* into the Obsidian vault
#   4. Update state file with new HEAD SHA

set -euo pipefail

MIRROR="${GARDENOS_MIRROR:-$HOME/code/gardenos-web-mirror}"
VAULT="${GARDEN_VAULT_PATH:-$HOME/Documents/MaRs/Projects/Garden Monitor}"
STATE="$HOME/.gardenos-inbox-state"
LOG="$HOME/Library/Logs/gardenos-inbox-sync.log"
INBOX_TARGET="$VAULT/_AI Inbox"

log() { printf "[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG"; }

if [ ! -d "$MIRROR/.git" ]; then
  log "ERROR: mirror clone not found at $MIRROR; clone with: git clone git@github.com:Sierra458/gardenos-web.git $MIRROR"
  exit 1
fi

if [ ! -d "$VAULT" ]; then
  log "ERROR: vault not found at $VAULT"
  exit 1
fi

mkdir -p "$INBOX_TARGET"

cd "$MIRROR"
git fetch --quiet origin main
NEW_SHA=$(git rev-parse origin/main)
LAST_SHA=""
[ -f "$STATE" ] && LAST_SHA=$(cat "$STATE")

if [ "$NEW_SHA" = "$LAST_SHA" ]; then
  exit 0   # nothing new
fi

git pull --quiet --ff-only origin main || { log "ERROR: pull failed"; exit 1; }

if [ -d "$MIRROR/vault-inbox" ]; then
  # rsync new + changed files; do NOT delete (vault-inbox is append-only in the repo)
  rsync -a --include='*/' --include='*.md' --include='*.jpg' --include='*.png' --exclude='*' \
    "$MIRROR/vault-inbox/" "$INBOX_TARGET/"
  log "rsync'd vault-inbox/ into $INBOX_TARGET (from $LAST_SHA to $NEW_SHA)"
else
  log "no vault-inbox/ in repo this run"
fi

echo "$NEW_SHA" > "$STATE"
