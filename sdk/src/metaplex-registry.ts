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

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, createV1 } from "@metaplex-foundation/mpl-core";
import {
  mplAgentIdentity,
  registerIdentityV1,
} from "@metaplex-foundation/mpl-agent-registry";
import {
  generateSigner,
  publicKey,
  keypairIdentity,
  type Umi,
  type Keypair as UmiKeypair,
} from "@metaplex-foundation/umi";
import { Keypair } from "@solana/web3.js";

// ─── Agent Registry Program ─────────────────────────────────────────────────

const RPC_URL = process.env.RPC_URL ?? "https://api.devnet.solana.com";

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
export function createAgentBondUmi(rpcUrl?: string): Umi {
  return createUmi(rpcUrl ?? RPC_URL)
    .use(mplCore())
    .use(mplAgentIdentity());
}

/**
 * Convert a web3.js Keypair to a Umi keypair identity.
 */
export function loadKeypairIntoUmi(umi: Umi, keypair: Keypair): Umi {
  const umiKeypair: UmiKeypair = {
    publicKey: publicKey(keypair.publicKey.toBase58()),
    secretKey: keypair.secretKey,
  };
  return umi.use(keypairIdentity(umiKeypair));
}

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
export async function registerAgentIdentity(
  umi: Umi,
  metadata: AgentRegistrationMetadata
): Promise<AgentRegistrationResult> {
  // Step 1: Generate a new asset signer for the agent's Core NFT
  const assetSigner = generateSigner(umi);

  // Build the registration metadata URI
  // In production, this would be uploaded to IPFS/Arweave
  // For hackathon, we use a deterministic URI
  const registrationUri = buildRegistrationUri(metadata);

  console.log(
    `[Metaplex Registry] Minting Core asset for "${metadata.name}"...`
  );

  // Step 2: Create the MPL Core asset (the agent's identity NFT)
  await createV1(umi, {
    asset: assetSigner,
    name: metadata.name,
    uri: registrationUri,
  }).sendAndConfirm(umi);

  console.log(
    `[Metaplex Registry] Core asset minted: ${assetSigner.publicKey}`
  );

  // Step 3: Register the asset as an Agent Identity
  console.log(`[Metaplex Registry] Registering agent identity...`);

  const registerTx = await registerIdentityV1(umi, {
    asset: assetSigner.publicKey,
    agentRegistrationUri: registrationUri,
  }).sendAndConfirm(umi);

  const identityPda = assetSigner.publicKey; // Actual PDA derived by program

  console.log(`[Metaplex Registry] ✅ Agent registered on Metaplex!`);
  console.log(`  Asset:    ${assetSigner.publicKey}`);
  console.log(`  URI:      ${registrationUri}`);

  return {
    assetAddress: assetSigner.publicKey.toString(),
    identityPda: identityPda.toString(),
    registrationUri,
    transactionSignature: Buffer.from(registerTx.signature).toString("base64"),
  };
}

/**
 * Build the registration metadata URI.
 *
 * In production, this JSON would be uploaded to IPFS via Metaplex's
 * off-chain storage. For the hackathon, we use a data URI or API endpoint.
 */
function buildRegistrationUri(metadata: AgentRegistrationMetadata): string {
  const json: Record<string, unknown> = {
    name: metadata.name,
    description: metadata.description,
    image: metadata.image ?? "https://agentbond.demo/agent-avatar.png",
    external_url: "https://agentbond.demo",
    properties: {
      category: "agent",
      protocol: metadata.protocol,
      version: metadata.version,
      capabilities: metadata.capabilities,
    },
    attributes: [
      { trait_type: "Protocol", value: metadata.protocol },
      { trait_type: "Version", value: metadata.version },
      ...metadata.capabilities.map((cap) => ({
        trait_type: "Capability",
        value: cap,
      })),
    ],
  };

  if (metadata.reputation_endpoint) {
    (json.properties as Record<string, unknown>).reputation_endpoint =
      metadata.reputation_endpoint;
  }

  // Return as a data URI for the hackathon (no IPFS dependency)
  return `data:application/json;base64,${Buffer.from(JSON.stringify(json)).toString("base64")}`;
}

/**
 * Metadata presets for each AgentBond bot type.
 */
export const AGENT_METADATA_PRESETS: Record<string, AgentRegistrationMetadata> =
  {
    PriceBot: {
      name: "AgentBond PriceBot",
      description:
        "Real-time SOL/USD price feed agent with on-chain accountability via AgentBond protocol.",
      capabilities: ["fetch_sol_price", "coinbase_api", "price_reporting"],
      protocol: "AgentBond",
      version: "1.0.0",
    },
    OracleBot: {
      name: "AgentBond OracleBot",
      description:
        "Verifiable oracle price feed agent using Switchboard on-demand data with cross-reference validation.",
      capabilities: [
        "oracle_price_feed",
        "switchboard_on_demand",
        "price_validation",
      ],
      protocol: "AgentBond",
      version: "1.0.0",
    },
    SwapBot: {
      name: "AgentBond SwapBot",
      description:
        "Automated token swap execution agent using Jupiter V6 DEX aggregation.",
      capabilities: [
        "execute_swap",
        "jupiter_v6",
        "token_routing",
        "slippage_control",
      ],
      protocol: "AgentBond",
      version: "1.0.0",
    },
    CrossChainBot: {
      name: "AgentBond CrossChainBot",
      description:
        "Cross-chain swap quote agent supporting 58+ chains via LI.FI aggregation.",
      capabilities: [
        "cross_chain_swap",
        "lifi_aggregation",
        "multi_chain_routing",
      ],
      protocol: "AgentBond",
      version: "1.0.0",
    },
    PortfolioBot: {
      name: "AgentBond PortfolioBot",
      description:
        "Cross-chain portfolio aggregation agent using Zerion for comprehensive position tracking.",
      capabilities: [
        "portfolio_summary",
        "zerion_api",
        "position_tracking",
        "multi_chain_portfolio",
      ],
      protocol: "AgentBond",
      version: "1.0.0",
    },
    FailBot: {
      name: "AgentBond FailBot",
      description:
        "Intentionally unreliable agent used to demonstrate AgentBond slashing mechanics.",
      capabilities: ["unreliable_task", "slashing_demo"],
      protocol: "AgentBond",
      version: "1.0.0",
    },
  };
