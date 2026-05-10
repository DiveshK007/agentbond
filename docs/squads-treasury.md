# AgentBond Treasury — Secured by Squads (Altitude)

> The 2% protocol fee accumulates in a Squads multisig — the same infrastructure securing $15B+ on Solana.

---

## Why a multisig matters

The AgentBond protocol takes a 2% fee on every successfully completed job. At scale, this treasury becomes the protocol's operating capital — funding ongoing development, security audits, and ecosystem grants.

A single-signer admin would be a target. A multisig is the production-grade default.

---

## Setup

The protocol's treasury PDA is governed by the `admin` field on `ProtocolConfig`. To migrate to a Squads multisig:

### 1. Create the multisig

Visit [squads.so](https://squads.so/) and create a new multisig with:
- 3-of-5 signature threshold (recommended for protocols)
- Members: founder + trusted reviewers + 2 ecosystem contributors

### 2. Transfer admin authority

```typescript
import { AgentBondClient } from "@agentbond/sdk";
import { PublicKey } from "@solana/web3.js";

const SQUADS_MULTISIG = new PublicKey("YOUR_MULTISIG_ADDRESS");

await client.program.methods
  .updateProtocolAdmin(SQUADS_MULTISIG)
  .accounts({
    protocolConfig: protocolConfigPda,
    currentAdmin: currentAdmin.publicKey,
  })
  .signers([currentAdmin])
  .rpc();
```

### 3. Verify on-chain

```bash
solana account <PROTOCOL_CONFIG_PDA> --url mainnet-beta
# admin field should now show the Squads multisig address
```

---

## What the multisig controls

| Action | Requires Multisig |
|---|---|
| Withdraw from treasury | ✓ |
| Change platform fee rate | ✓ |
| Pause registrations (emergency) | ✓ |
| Upgrade program (with timelock) | ✓ |

Day-to-day operations — agents staking, users posting jobs, slashing, payments — require **no** multisig involvement. The multisig only governs protocol-level decisions.

---

## Why Squads / Altitude

[Altitude](https://altitude.xyz) by Squads has secured over $15B in tokenized value on Solana. Used by 500+ leading Solana teams for program upgrade authorities, project tokens, and validator keys.

For AgentBond, the Squads multisig means:
- Protocol fees can't be unilaterally drained
- Program upgrades require quorum approval
- Security perimeter matches institutional Solana standards

This is the production hardening that separates a hackathon prototype from infrastructure that holds real money.

---

## Devnet deployment note

The current devnet deployment uses the developer keypair as admin for rapid iteration. **Mainnet deployment ships with the Squads multisig.** See `docs/mainnet-deploy.md` (coming with the mainnet deploy step) for the full transition checklist.
