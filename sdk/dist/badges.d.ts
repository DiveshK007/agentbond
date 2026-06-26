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
import { PublicKey } from "@solana/web3.js";
export declare const BADGE_TIERS: {
    readonly bronze: {
        readonly name: "Bronze Agent";
        readonly symbol: "BOND-B";
        readonly uri: "https://agentbond.demo/badges/bronze.json";
        readonly emoji: "🥉";
        readonly requirements: {
            readonly minCompleted: 5;
            readonly minSuccessRate: 0;
            readonly minStake: 0;
        };
    };
    readonly silver: {
        readonly name: "Silver Agent";
        readonly symbol: "BOND-S";
        readonly uri: "https://agentbond.demo/badges/silver.json";
        readonly emoji: "🥈";
        readonly requirements: {
            readonly minCompleted: 25;
            readonly minSuccessRate: 90;
            readonly minStake: 0;
        };
    };
    readonly gold: {
        readonly name: "Gold Agent";
        readonly symbol: "BOND-G";
        readonly uri: "https://agentbond.demo/badges/gold.json";
        readonly emoji: "🥇";
        readonly requirements: {
            readonly minCompleted: 100;
            readonly minSuccessRate: 95;
            readonly minStake: 1000000000;
        };
    };
    readonly diamond: {
        readonly name: "Diamond Agent";
        readonly symbol: "BOND-D";
        readonly uri: "https://agentbond.demo/badges/diamond.json";
        readonly emoji: "💎";
        readonly requirements: {
            readonly minCompleted: 500;
            readonly minSuccessRate: 99;
            readonly minStake: 5000000000;
        };
    };
};
export type BadgeTier = keyof typeof BADGE_TIERS;
export interface AgentStats {
    owner: string;
    completed: number;
    failed: number;
    stake: bigint;
    reputation: number;
}
export interface BadgeEligibility {
    tier: BadgeTier;
    eligible: boolean;
    name: string;
    emoji: string;
    requirements: {
        minCompleted: number;
        minSuccessRate: number;
        minStake: number;
    };
    current: {
        completed: number;
        successRate: number;
        stake: string;
    };
}
/**
 * Check which badge tiers an agent is eligible for.
 */
export declare function checkBadgeEligibility(stats: AgentStats): BadgeEligibility[];
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
export declare function prepareBadgeMint(tier: BadgeTier, agentOwner: PublicKey, authority: PublicKey): BadgeMintParams;
export interface BadgeMintParams {
    name: string;
    symbol: string;
    uri: string;
    tier: BadgeTier;
    agentOwner: string;
    authority: string;
    assetSeedHash: string;
    metaplexProgram: string;
    metadata: {
        name: string;
        symbol: string;
        description: string;
        image: string;
        attributes: Array<{
            trait_type: string;
            value: string;
        }>;
    };
}
//# sourceMappingURL=badges.d.ts.map