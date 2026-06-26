"use strict";
/**
 * Agent Badge System — Metaplex Core NFTs as on-chain reputation credentials.
 *
 * Agents earn NFT badges when they hit milestones:
 * - 🥉 Bronze Agent: 5 jobs completed
 * - 🥈 Silver Agent: 25 jobs completed with 90%+ success rate
 * - 🥇 Gold Agent: 100 jobs completed with 95%+ success rate
 * - 💎 Diamond Agent: 500 jobs completed, <1% failure rate, 5+ SOL staked
 *
 * These badges are Metaplex Core NFTs — lightweight, composable,
 * and transferable. An agent's reputation becomes a portable asset.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BADGE_TIERS = void 0;
exports.checkBadgeEligibility = checkBadgeEligibility;
exports.prepareBadgeMint = prepareBadgeMint;
const crypto_1 = require("crypto");
// Badge tier definitions
exports.BADGE_TIERS = {
    bronze: {
        name: "Bronze Agent",
        symbol: "BOND-B",
        uri: "https://agentbond.demo/badges/bronze.json",
        emoji: "🥉",
        requirements: {
            minCompleted: 5,
            minSuccessRate: 0,
            minStake: 0,
        },
    },
    silver: {
        name: "Silver Agent",
        symbol: "BOND-S",
        uri: "https://agentbond.demo/badges/silver.json",
        emoji: "🥈",
        requirements: {
            minCompleted: 25,
            minSuccessRate: 90,
            minStake: 0,
        },
    },
    gold: {
        name: "Gold Agent",
        symbol: "BOND-G",
        uri: "https://agentbond.demo/badges/gold.json",
        emoji: "🥇",
        requirements: {
            minCompleted: 100,
            minSuccessRate: 95,
            minStake: 1000000000, // 1 SOL
        },
    },
    diamond: {
        name: "Diamond Agent",
        symbol: "BOND-D",
        uri: "https://agentbond.demo/badges/diamond.json",
        emoji: "💎",
        requirements: {
            minCompleted: 500,
            minSuccessRate: 99,
            minStake: 5000000000, // 5 SOL
        },
    },
};
/**
 * Check which badge tiers an agent is eligible for.
 */
function checkBadgeEligibility(stats) {
    const total = stats.completed + stats.failed;
    const successRate = total > 0 ? (stats.completed / total) * 100 : 0;
    return Object.entries(exports.BADGE_TIERS).map(([tier, config]) => ({
        tier,
        eligible: stats.completed >= config.requirements.minCompleted &&
            successRate >= config.requirements.minSuccessRate &&
            stats.stake >= BigInt(config.requirements.minStake),
        name: config.name,
        emoji: config.emoji,
        requirements: config.requirements,
        current: {
            completed: stats.completed,
            successRate: Math.round(successRate * 100) / 100,
            stake: stats.stake.toString(),
        },
    }));
}
/**
 * Generate the Metaplex Core create instruction for minting a badge NFT.
 *
 * Uses Metaplex Core (lightweight NFTs without token accounts).
 * The badge is minted to the agent's wallet as a non-transferable credential.
 *
 * Note: This generates the instruction data for the Metaplex Core program.
 * In production, you'd use @metaplex-foundation/mpl-core SDK.
 * For the hackathon, we prepare the metadata and return the mint params.
 */
function prepareBadgeMint(tier, agentOwner, authority) {
    const config = exports.BADGE_TIERS[tier];
    // Deterministic asset ID from tier + agent
    const assetSeed = (0, crypto_1.createHash)("sha256")
        .update(`agentbond:badge:${tier}:${agentOwner.toBase58()}`)
        .digest();
    return {
        name: config.name,
        symbol: config.symbol,
        uri: config.uri,
        tier,
        agentOwner: agentOwner.toBase58(),
        authority: authority.toBase58(),
        assetSeedHash: assetSeed.toString("hex"),
        metaplexProgram: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d", // Metaplex Core program ID
        metadata: {
            name: config.name,
            symbol: config.symbol,
            description: `AgentBond ${config.emoji} ${config.name} — earned by completing ${exports.BADGE_TIERS[tier].requirements.minCompleted}+ jobs with ${exports.BADGE_TIERS[tier].requirements.minSuccessRate}%+ success rate.`,
            image: config.uri.replace(".json", ".png"),
            attributes: [
                { trait_type: "Tier", value: tier },
                { trait_type: "Protocol", value: "AgentBond" },
                { trait_type: "Min Jobs", value: String(config.requirements.minCompleted) },
                { trait_type: "Min Success Rate", value: `${config.requirements.minSuccessRate}%` },
            ],
        },
    };
}
//# sourceMappingURL=badges.js.map