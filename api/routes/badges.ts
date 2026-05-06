import { Router, Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import { client } from "../connection";
import {
  checkBadgeEligibility,
  prepareBadgeMint,
  BADGE_TIERS,
  type BadgeTier,
} from "../../sdk/src/badges";

const router = Router();

/**
 * GET /api/badges/:pubkey
 * Check which badge tiers an agent is eligible for based on their on-chain stats.
 */
router.get("/:pubkey", async (req: Request, res: Response) => {
  try {
    const agent = await client.getAgent(new PublicKey(req.params.pubkey));

    const eligibility = checkBadgeEligibility({
      owner: agent.owner,
      completed: agent.completed as number,
      failed: agent.failed as number,
      stake: BigInt(agent.stake),
      reputation: agent.reputation as number,
    });

    const earned = eligibility.filter((e) => e.eligible);
    const highestTier = earned.length > 0 ? earned[earned.length - 1] : null;

    res.json({
      agent: agent.owner,
      highestBadge: highestTier
        ? { tier: highestTier.tier, name: highestTier.name, emoji: highestTier.emoji }
        : null,
      eligibility,
      totalEarned: earned.length,
    });
  } catch (err) {
    res.status(404).json({ error: String(err) });
  }
});

/**
 * POST /api/badges/:pubkey/mint
 * Prepare a Metaplex Core NFT mint for an earned badge.
 * Returns the mint parameters needed to submit the transaction.
 */
router.post("/:pubkey/mint", async (req: Request, res: Response) => {
  const { tier } = req.body as { tier?: string };
  if (!tier || !(tier in BADGE_TIERS)) {
    return res.status(400).json({
      error: `Invalid tier. Must be one of: ${Object.keys(BADGE_TIERS).join(", ")}`,
    });
  }

  try {
    const agentOwner = new PublicKey(req.params.pubkey);
    const agent = await client.getAgent(agentOwner);

    const eligibility = checkBadgeEligibility({
      owner: agent.owner,
      completed: agent.completed as number,
      failed: agent.failed as number,
      stake: BigInt(agent.stake),
      reputation: agent.reputation as number,
    });

    const tierEligibility = eligibility.find((e) => e.tier === tier);
    if (!tierEligibility?.eligible) {
      return res.status(403).json({
        error: `Agent not eligible for ${tier} badge`,
        requirements: tierEligibility?.requirements,
        current: tierEligibility?.current,
      });
    }

    // Prepare the mint parameters
    const mintParams = prepareBadgeMint(
      tier as BadgeTier,
      agentOwner,
      agentOwner // Agent is also the authority for now
    );

    return res.json({
      success: true,
      mintParams,
      note: "Submit this to the Metaplex Core program to mint the badge NFT",
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/badges/tiers
 * Returns all badge tier definitions and requirements.
 */
router.get("/", (_req: Request, res: Response) => {
  const tiers = Object.entries(BADGE_TIERS).map(([key, config]) => ({
    tier: key,
    name: config.name,
    symbol: config.symbol,
    emoji: config.emoji,
    requirements: config.requirements,
  }));

  res.json({ tiers });
});

export default router;
