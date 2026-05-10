#!/usr/bin/env bash
# =============================================================================
# AgentBond — Stop All Services
# Run from repo root: bash scripts/stop-all.sh
# =============================================================================

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDS_FILE="$ROOT/.pids"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

if [[ ! -f "$PIDS_FILE" ]]; then
  echo "No .pids file found — nothing to stop."
  exit 0
fi

echo "Stopping AgentBond services..."
while IFS='=' read -r name pid; do
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null && echo -e "  ${GREEN}Stopped${NC} $name (PID $pid)"
  else
    echo -e "  ${RED}Already stopped${NC} $name"
  fi
done < "$PIDS_FILE"

rm -f "$PIDS_FILE"
echo "Done."
