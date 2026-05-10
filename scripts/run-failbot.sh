#!/usr/bin/env bash
# =============================================================================
# AgentBond — FailBot Slashing Demo
#
# This script:
#   1. Posts a fresh job specifically for FailBot to take
#   2. Starts FailBot — it bids, gets assigned, submits garbage
#   3. Watches for the submission
#   4. Disputes the job — triggers on-chain slashing
#   5. Prints the Solana Explorer URL for the slashing transaction
#
# Run from repo root: bash scripts/run-failbot.sh
# RECORD YOUR SCREEN while running this — it's your pitch video money shot.
# =============================================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYS_DIR="$HOME/.config/agentbond/keys"
LOGS_DIR="$ROOT/logs"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()    { echo -e "${GREEN}[failbot]${NC} $1"; }
warn()   { echo -e "${YELLOW}[failbot]${NC} $1"; }
action() { echo -e "${CYAN}${BOLD}[failbot]${NC} $1"; }
slash()  { echo -e "${RED}${BOLD}[failbot] ⚡${NC} $1"; }

FAIL_KEY="$KEYS_DIR/fail-bot.json"
POSTER_KEY="$KEYS_DIR/poster-bot.json"

[[ -f "$FAIL_KEY" ]]   || { warn "fail keypair missing — run bash scripts/setup.sh first"; exit 1; }
[[ -f "$POSTER_KEY" ]] || { warn "poster keypair missing — run bash scripts/setup.sh first"; exit 1; }

mkdir -p "$LOGS_DIR"

echo ""
echo "  ══════════════════════════════════════════"
echo "  FailBot Slashing Demo"
echo "  ══════════════════════════════════════════"
echo ""
warn "RECORD YOUR SCREEN NOW before continuing."
echo ""
read -rp "  Press Enter when recording is started..."
echo ""

# ─── Step 1: Get current job count so we know which job to watch ──────────────

log "Checking current protocol state..."
cd "$ROOT/bots"

CURRENT_JOB_COUNT=$(KEYPAIR_PATH="$POSTER_KEY" npx ts-node -e "
import { Connection, Keypair } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { AgentBondClient } from '../sdk/src/client';
const client = new AgentBondClient(new Connection('https://api.devnet.solana.com', 'confirmed'), new Wallet(Keypair.generate()));
client.getProtocolStats().then(s => process.stdout.write(String(s.totalJobs))).catch(() => process.stdout.write('0'));
" 2>/dev/null || echo "0")

log "Current job count on-chain: $CURRENT_JOB_COUNT"
NEW_JOB_INDEX="$CURRENT_JOB_COUNT"

# ─── Step 2: Post a job that FailBot will take ────────────────────────────────

action "Step 1/4 — Posting a job (0.05 SOL reward, escrowed in smart contract)..."

KEYPAIR_PATH="$POSTER_KEY" npx ts-node -e "
import 'dotenv/config';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { readFileSync } from 'fs';
import { AgentBondClient } from '../sdk/src/client';
import { createHash } from 'crypto';

const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(process.env.KEYPAIR_PATH!, 'utf8')) as number[]));
const client = new AgentBondClient(new Connection('https://api.devnet.solana.com', 'confirmed'), new Wallet(kp));
const hash = new Uint8Array(createHash('sha256').update('FailBot demo job: fetch SOL price').digest());
client.postJob(hash, BigInt(0.05 * LAMPORTS_PER_SOL), BigInt(3600)).then(tx => {
  process.stdout.write('Job posted! TX: ' + tx + '\n');
}).catch(e => { process.stderr.write(String(e) + '\n'); process.exit(1); });
" 2>&1

log "Job #$NEW_JOB_INDEX posted with 0.05 SOL escrowed in the smart contract"

# ─── Step 3: Start FailBot ────────────────────────────────────────────────────

action "Step 2/4 — Starting FailBot (it will bid on job #$NEW_JOB_INDEX and submit garbage)..."

KEYPAIR_PATH="$FAIL_KEY" npx ts-node fail-bot.ts >"$LOGS_DIR/fail-bot.log" 2>&1 &
FAIL_PID=$!
log "FailBot started (PID=$FAIL_PID)"
log "Watching for FailBot to bid, get assigned, and submit..."
echo ""

# ─── Step 4: Wait for FailBot to submit garbage result ────────────────────────

log "Waiting for FailBot to process job #$NEW_JOB_INDEX (up to 120 seconds)..."

for i in $(seq 1 24); do
  sleep 5
  echo -n "  [$((i*5))s] Checking job status... "

  STATUS=$(KEYPAIR_PATH="$POSTER_KEY" npx ts-node -e "
import { Connection, Keypair } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { AgentBondClient } from '../sdk/src/client';
const client = new AgentBondClient(new Connection('https://api.devnet.solana.com','confirmed'), new Wallet(Keypair.generate()));
client.getJob(BigInt($NEW_JOB_INDEX)).then(j => process.stdout.write(String(j.status))).catch(() => process.stdout.write('-1'));
" 2>/dev/null || echo "-1")

  case "$STATUS" in
    0) echo "Open (waiting for FailBot to bid)" ;;
    1) echo "Assigned — FailBot is working..." ;;
    2) echo -e "${RED}Submitted — FailBot submitted garbage!${NC}"; break ;;
    3) echo "Completed (unexpected)"; break ;;
    *) echo "Unknown status $STATUS" ;;
  esac
done

if [[ "$STATUS" != "2" ]]; then
  warn "FailBot didn't submit in time. Check logs/fail-bot.log"
  warn "When job is in Submitted status, run manually:"
  warn "  cd bots && KEYPAIR_PATH=$POSTER_KEY npx ts-node ../scripts/dispute-job.ts $NEW_JOB_INDEX"
  kill "$FAIL_PID" 2>/dev/null || true
  exit 1
fi

echo ""
slash "FailBot submitted garbage result for job #$NEW_JOB_INDEX"

# ─── Step 5: Dispute and slash ────────────────────────────────────────────────

action "Step 3/4 — Disputing job — this triggers automatic on-chain slashing..."
echo ""

kill "$FAIL_PID" 2>/dev/null || true  # Stop FailBot before disputing

DISPUTE_TX=$(KEYPAIR_PATH="$POSTER_KEY" npx ts-node ../scripts/dispute-job.ts "$NEW_JOB_INDEX" 2>&1 | tee /dev/stderr | grep "https://explorer.solana.com" | head -1 | awk '{print $NF}')

echo ""
slash "══════════════════════════════════════════════════════"
slash " SLASHING COMPLETE"
slash "══════════════════════════════════════════════════════"
echo ""
echo -e "  ${BOLD}FailBot's stake has been slashed.${NC}"
echo -e "  Poster refunded. Reward returned."
echo ""
if [[ -n "$DISPUTE_TX" ]]; then
  echo -e "  ${BOLD}Solana Explorer URL (PUT THIS IN YOUR VIDEO):${NC}"
  echo ""
  echo -e "  ${GREEN}$DISPUTE_TX${NC}"
  echo ""
fi
echo "  Check the leaderboard: http://localhost:3000/leaderboard"
echo "  FailBot's failed count and slashed SOL updated in real time."
echo ""

action "Step 4/4 — Open http://localhost:3000/leaderboard in your recording"
action "The slashing event shows FailBot with reduced stake and failed job count."
echo ""
warn "STOP YOUR SCREEN RECORDING NOW."
echo ""
log "FailBot demo complete."
