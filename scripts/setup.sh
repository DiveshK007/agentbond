#!/usr/bin/env bash
# =============================================================================
# AgentBond — One-Shot Devnet Setup
# Run from repo root: bash scripts/setup.sh
# =============================================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYS_DIR="$HOME/.config/agentbond/keys"
ENV_FILE="$ROOT/.env"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[setup]${NC} $1"; }
warn() { echo -e "${YELLOW}[setup]${NC} $1"; }
die()  { echo -e "${RED}[setup] ERROR:${NC} $1"; exit 1; }

echo ""
echo "  AgentBond Devnet Setup"
echo "  ======================"
echo ""

# ─── Check prerequisites ──────────────────────────────────────────────────────

log "Checking prerequisites..."

command -v node   >/dev/null 2>&1 || die "Node.js not found. Install from https://nodejs.org (v18+)"
command -v solana >/dev/null 2>&1 || die "Solana CLI not found. Install from https://docs.solana.com/cli/install-solana-cli-tools"
command -v npx    >/dev/null 2>&1 || die "npx not found (should come with Node.js)"

NODE_VERSION=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
[[ "$NODE_VERSION" -ge 18 ]] || die "Node.js 18+ required (found v$NODE_VERSION)"

log "Node $(node --version) ✓"
log "Solana $(solana --version) ✓"

# ─── Create keys directory ────────────────────────────────────────────────────

mkdir -p "$KEYS_DIR"
log "Keys directory: $KEYS_DIR"

# ─── Generate keypairs ────────────────────────────────────────────────────────

log "Generating bot keypairs..."

BOTS=("price" "swap" "portfolio" "oracle" "crosschain" "fail" "poster")

for BOT in "${BOTS[@]}"; do
  KEYFILE="$KEYS_DIR/$BOT-bot.json"
  if [[ -f "$KEYFILE" ]]; then
    warn "$BOT-bot keypair already exists — skipping"
  else
    solana-keygen new --no-bip39-passphrase --silent -o "$KEYFILE"
    log "Generated $BOT-bot: $(solana-keygen pubkey "$KEYFILE")"
  fi
done

# ─── Airdrop devnet SOL ───────────────────────────────────────────────────────

log "Airdropping devnet SOL (this takes ~60 seconds)..."
warn "If any airdrop fails, re-run: solana airdrop 2 <pubkey> --url devnet"

for BOT in "${BOTS[@]}"; do
  KEYFILE="$KEYS_DIR/$BOT-bot.json"
  PUBKEY=$(solana-keygen pubkey "$KEYFILE")
  BALANCE=$(solana balance "$PUBKEY" --url devnet 2>/dev/null | awk '{print $1}' || echo "0")

  if (( $(echo "$BALANCE > 1" | bc -l 2>/dev/null || echo 0) )); then
    warn "$BOT-bot already has ${BALANCE} SOL — skipping airdrop"
  else
    echo -n "  Airdropping to $BOT-bot ($PUBKEY)... "
    if solana airdrop 2 "$PUBKEY" --url devnet >/dev/null 2>&1; then
      echo "✓"
    else
      echo "failed (rate limited — try again in 60s)"
    fi
    sleep 1
  fi
done

# ─── Create .env ──────────────────────────────────────────────────────────────

if [[ -f "$ENV_FILE" ]]; then
  warn ".env already exists — not overwriting. Check it manually."
else
  log "Creating .env from .env.example..."
  cp "$ROOT/.env.example" "$ENV_FILE"
  log ".env created at $ENV_FILE"
  warn "Optional: add HELIUS_API_KEY, ZERION_API_KEY, LIFI_API_KEY for full functionality"
fi

# ─── Install dependencies ─────────────────────────────────────────────────────

log "Installing API dependencies..."
(cd "$ROOT/api" && npm install --silent)

log "Installing bot dependencies..."
(cd "$ROOT/bots" && npm install --silent)

log "Installing frontend dependencies..."
(cd "$ROOT/app" && npm install --silent)

# ─── Print wallet summary ─────────────────────────────────────────────────────

echo ""
echo "  ─────────────────────────────────────────"
echo "  Wallet Summary"
echo "  ─────────────────────────────────────────"
for BOT in "${BOTS[@]}"; do
  KEYFILE="$KEYS_DIR/$BOT-bot.json"
  PUBKEY=$(solana-keygen pubkey "$KEYFILE")
  printf "  %-15s %s\n" "$BOT-bot" "$PUBKEY"
done
echo ""

log "Setup complete! Next step:"
echo ""
echo "  bash scripts/start-all.sh"
echo ""
