#!/usr/bin/env bash
# =============================================================================
# AgentBond — Post Demo Jobs
# Posts 6 realistic jobs from the poster wallet so bots have work to do.
# Run from repo root: bash scripts/post-jobs.sh
# =============================================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYS_DIR="$HOME/.config/agentbond/keys"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[jobs]${NC} $1"; }
warn() { echo -e "${YELLOW}[jobs]${NC} $1"; }

POSTER_KEY="$KEYS_DIR/poster-bot.json"
[[ -f "$POSTER_KEY" ]] || { warn "Poster keypair not found — run bash scripts/setup.sh first"; exit 1; }

log "Posting demo jobs from poster wallet..."
log "Poster: $(solana-keygen pubkey "$POSTER_KEY")"
echo ""

cd "$ROOT/bots"
KEYPAIR_PATH="$POSTER_KEY" npx ts-node ../scripts/seed-demo.ts

echo ""
log "Done! Check job status:"
echo ""
echo "  cd bots && npx ts-node ../scripts/list-jobs.ts"
echo "  http://localhost:3000/jobs"
echo ""
