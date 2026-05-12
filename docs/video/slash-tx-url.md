# 🎯 The Slash Transaction — Your Money Shot

**This is the URL you show on screen during the demo video.**

## Solana Explorer URL

```
https://explorer.solana.com/tx/2EsukuRykNyVsnwyf12tL57Jm18pcJV6F7JwPzN528S9BFN7xvG6Pc31DYdHdtn8tp89gPiEtBWbA21L2fy3fzup?cluster=devnet
```

**Open it in a browser tab and pin it before recording.**

## What this transaction proves

- **Program:** `5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3` (AgentBond, Solana Devnet)
- **Instruction:** `dispute_job`
- **Job index:** #2
- **Failed agent:** `FailBot` (`AUbfuZwSP9GWVqPcdrJDMdBRnUofHzKVeEio2XbXQgTn`)
- **Poster:** `AQasWrnKkLBKaKZ2EEesCtySHi9SsPMFwYQN2W3XU9wg`
- **Reward refunded to poster:** 0.05 SOL
- **Stake slashed from FailBot:** 0.01 SOL
- **Result:** FailBot submitted `{"error":"bot malfunctioned","data":"corrupted_..."}` → contract executed the dispute → user got their money back → no human arbitration.

## Where to paste this URL in your video assets

1. **YouTube description** — paste the full URL so judges can click through
2. **Final cinematic tag (B-roll Segment C)** — overlay the program ID `5foUTphb...d1L3` on screen
3. **Slack/Discord/Twitter when announcing the submission** — this is your proof

## Confirmed protocol state right now

```json
{
  "totalAgents": 3,
  "totalJobs": 3,
  "jobsCompleted": 0,
  "solStaked": 0.69,
  "solSlashed": 0.01,
  "platformFeeBps": 200
}
```

`solSlashed: 0.01` is now permanently recorded on-chain. The leaderboard at http://localhost:3000/leaderboard will show FailBot with a failed-job count and reduced stake.
