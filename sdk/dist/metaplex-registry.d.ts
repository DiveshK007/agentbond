/**
 * Metaplex Agent Registry — On-chain identity for AgentBond agents.
 *
 * Uses the Metaplex Agent Registry program to:
 * 1. Mint an MPL Core asset for each agent (their on-chain identity NFT)
 * 2. Register the asset as an "Agent Identity" via registerIdentityV1
 * 3. Attach verifiable metadata (name, capabilities, reputation URI)
 *
 * This creates a **portable, verifiable agent identity** on Solana
 * that follows the Metaplex standard — discoverable by any Metaplex-compatible tool.
 *
 * @see https://developers.metaplex.com/agents/register-agent
 * @see https://developers.metaplex.com/agents/run-an-agent
 */
import { type Umi } from "@metaplex-foundation/umi";
import { Keypair } from "@solana/web3.js";
/**
 * Agent metadata stored at the registration URI.
 * This JSON is linked on-chain and describes the agent's capabilities.
 */
export interface AgentRegistrationMetadata {
    name: string;
    description: string;
    image?: string;
    capabilities: string[];
    protocol: string;
    version: string;
    reputation_endpoint?: string;
    stake_requirement?: string;
}
/**
 * Result of registering an agent on the Metaplex Agent Registry.
 */
export interface AgentRegistrationResult {
    assetAddress: string;
    identityPda: string;
    registrationUri: string;
    transactionSignature: string;
}
/**
 * Create a Umi instance configured for AgentBond.
 */
export declare function createAgentBondUmi(rpcUrl?: string): Umi;
/**
 * Convert a web3.js Keypair to a Umi keypair identity.
 */
export declare function loadKeypairIntoUmi(umi: Umi, keypair: Keypair): Umi;
/**
 * Register an AgentBond bot as a Metaplex Agent.
 *
 * Flow:
 * 1. Mint a new MPL Core asset (the agent's identity NFT)
 * 2. Call registerIdentityV1 to bind an Agent Identity to the asset
 * 3. The agent now has a verifiable on-chain identity discoverable
 *    by any Metaplex-compatible tool
 *
 * @param umi - Configured Umi instance with keypair loaded
 * @param metadata - Agent metadata to store at the registration URI
 * @returns Registration result with asset address and identity PDA
 */
export declare function registerAgentIdentity(umi: Umi, metadata: AgentRegistrationMetadata): Promise<AgentRegistrationResult>;
/**
 * Metadata presets for each AgentBond bot type.
 */
export declare const AGENT_METADATA_PRESETS: Record<string, AgentRegistrationMetadata>;
//# sourceMappingURL=metaplex-registry.d.ts.map