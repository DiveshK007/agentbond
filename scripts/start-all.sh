#!/usr/bin/env bash
# =============================================================================
# AgentBond — Start All Services
# Starts: API server + Frontend + PriceBot + SwapBot + PortfolioBot
# Logs go to logs/<service>.log — tail them to watch activity
#
# Run from repo root: bash scripts/start-all.sh
# Stop everything:    bash scripts/stop-all.sh
# =============================================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYS_DIR="$HOME/.config/agentbond/keys"
LOGS_DIR="$ROOT/logs"
PIDS_FILE="$ROOT/.pids"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[start]${NC} $1"; }
warn() { echo -e "${YELLOW}[start]${NC} $1"; }
info() { echo -e "${CYAN}[start]${NC} $1"; }

echo ""
echo "  AgentBond — Starting All Services"
echo "  ==================================="
echo ""

# ─── Pre-flight checks ────────────────────────────────────────────────────────

[[ -f "$ROOT/.env" ]] || { warn "No .env found — run bash scripts/setup.sh first"; exit 1; }
[[ -f "$KEYS_DIR/price-bot.json" ]] || { warn "No keypairs found — run bash scripts/setup.sh first"; exit 1; }

mkdir -p "$LOGS_DIR"
> "$PIDS_FILE"  # reset PID file

# ─── Helper: start a background process ──────────────────────────────────────

start_service() {
  local name="$1"
  local dir="$2"
  local cmd="$3"
  local env_prefix="${4:-}"

  log "Starting $name..."
  local logfile="$LOGS_DIR/$name.log"

  # shellcheck disable=SC2086
  env $env_prefix bash -c "cd '$dir' && $cmd" >"$logfile" 2>&1 &
  local pid=$!
  echo "$name=$pid" >> "$PIDS_FILE"
  info "  $name PID=$pid  →  tail -f $logfile"
}

# ─── API Server ───────────────────────────────────────────────────────────────

start_service "api" "$ROOT/api" "npx ts-node server.ts"

log "Waiting 4s for API to come up..."
sleep 4

# Quick health check
if curl -sf http://localhost:3001/health >/dev/null 2>&1; then
  log "API is up ✓"
else
  warn "API health check failed — check logs/api.log"
fi

# ─── Frontend ─────────────────────────────────────────────────────────────────

start_service "frontend" "$ROOT/app" "npm run dev -- --port 3000"

# ─── Bots ─────────────────────────────────────────────────────────────────────

start_service "price-bot"     "$ROOT/bots" "npx ts-node price-bot.ts"     "KEYPAIR_PATH=$KEYS_DIR/price-bot.json"
start_service "swap-bot"      "$ROOT/bots" "npx ts-node swap-bot.ts"      "KEYPAIR_PATH=$KEYS_DIR/swap-bot.json"
start_service "portfolio-bot" "$ROOT/bots" "npx ts-node portfolio-bot.ts" "KEYPAIR_PATH=$KEYS_DIR/portfolio-bot.json"

# ─── Summary ─────────────────────────────────────────────────────────────────

echo ""
echo "  ─────────────────────────────────────────────────────"
echo "  All services started. View live logs:"
echo "  ─────────────────────────────────────────────────────"
echo "  API         →  tail -f logs/api.log"
echo "  Frontend    →  tail -f logs/frontend.log"
echo "  PriceBot    →  tail -f logs/price-bot.log"
echo "  SwapBot     →  tail -f logs/swap-bot.log"
echo "  PortfolioBot→  tail -f logs/portfolio-bot.log"
echo ""
echo "  Frontend:    http://localhost:3000"
echo "  API health:  http://localhost:3001/health"
echo "  Leaderboard: http://localhost:3000/leaderboard"
echo ""
echo "  Next — post jobs:"
echo "    bash scripts/post-jobs.sh"
echo ""
echo "  Next — run FailBot demo:"
echo "    bash scripts/run-failbot.sh"
echo ""
echo "  Stop everything:"
echo "    bash scripts/stop-all.sh"
echo ""
