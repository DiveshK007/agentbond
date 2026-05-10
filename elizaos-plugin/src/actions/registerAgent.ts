import type { Action, IAgentRuntime, Memory, HandlerCallback } from "../types";
import { getProtocolStats, checkAgentExists } from "../api";

/**
 * Generates the SDK command to register the calling elizaOS agent on AgentBond.
 * The agent's wallet pubkey is read from the runtime (AGENTBOND_WALLET_PUBKEY setting).
 * Actual on-chain registration requires running the returned SDK snippet.
 */
export const registerAgentAction: Action = {
  name: "REGISTER_ON_AGENTBOND",
  description:
    "Register this AI agent on the AgentBond protocol. Stakes SOL as collateral and makes the agent discoverable for jobs. Returns the exact SDK command to execute the on-chain registration.",
  similes: [
    "JOIN_AGENTBOND",
    "REGISTER_AGENT",
    "STAKE_ON_AGENTBOND",
    "BECOME_AGENTBOND_AGENT",
    "ADD_TO_AGENTBOND",
    "ONBOARD_AGENTBOND",
  ],
  examples: [
    [
      { user: "user", content: { text: "Register my agent on AgentBond with 0.5 SOL stake" } },
      { user: "agent", content: { text: "I'll prepare your AgentBond registration now." } },
    ],
    [
      { user: "user", content: { text: "How do I join AgentBond and start accepting jobs?" } },
      {
        user: "agent",
        content: { text: "I'll generate the registration command for AgentBond." },
      },
    ],
    [
      { user: "user", content: { text: "Stake 1 SOL on AgentBond so I can take jobs" } },
      { user: "agent", content: { text: "Preparing your 1 SOL AgentBond stake registration." } },
    ],
  ],

  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text.toLowerCase();
    return (
      text.includes("register") ||
      text.includes("join") ||
      text.includes("stake") ||
      text.includes("agentbond") ||
      text.includes("accept jobs")
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?,
    _options?,
    callback?: HandlerCallback
  ) => {
    try {
      // Extract stake amount from message (e.g. "0.5 SOL", "1 sol", "2.5")
      const stakeMatch = message.content.text.match(/(\d+(?:\.\d+)?)\s*(?:sol)?/i);
      const stakeSol = stakeMatch ? Math.max(0.1, parseFloat(stakeMatch[1]!)) : 0.5;
      const stakeLamports = Math.round(stakeSol * 1e9);

      // Get agent name from runtime character or message
      const agentName =
        runtime.character?.name ??
        (message.content.text.match(/(?:name|called|agent)\s+["']?([A-Za-z0-9_-]+)["']?/i)?.[1]) ??
        "MyAgent";

      // Check wallet pubkey from settings
      const walletPubkey = runtime.getSetting("AGENTBOND_WALLET_PUBKEY");

      // Check if already registered (if we have a pubkey)
      if (walletPubkey) {
        const alreadyRegistered = await checkAgentExists(walletPubkey);
        if (alreadyRegistered) {
          await callback?.({
            text: [
              `**Already Registered on AgentBond**`,
              ``,
              `Agent \`${walletPubkey.slice(0, 8)}…\` is already registered on the protocol.`,
              `View your profile at /agents/${walletPubkey}`,
            ].join("\n"),
            content: { walletPubkey, alreadyRegistered: true },
          });
          return true;
        }
      }

      // Fetch current protocol stats to show context
      const stats = await getProtocolStats().catch(() => null);
      const statsLine = stats
        ? `The protocol currently has ${stats.totalAgents} registered agents with ${stats.solStaked.toFixed(2)} SOL staked total.`
        : "";

      const metadataUri = `https://agentbond.io/agents/${agentName.toLowerCase().replace(/\s+/g, "-")}`;

      const sdkSnippet = [
        `import { AgentBondClient } from "@agentbond/sdk";`,
        `import { Connection, Keypair } from "@solana/web3.js";`,
        `import { Wallet } from "@coral-xyz/anchor";`,
        ``,
        `const connection = new Connection("https://api.devnet.solana.com");`,
        `const keypair = Keypair.fromSecretKey(/* your agent's secret key */);`,
        `const client = new AgentBondClient(connection, new Wallet(keypair));`,
        ``,
        `// Register and stake collateral`,
        `const tx = await client.registerAgent(`,
        `  "${agentName}",`,
        `  "${metadataUri}",`,
        `  BigInt(${stakeLamports})  // ${stakeSol} SOL stake`,
        `);`,
        `console.log("Registered:", tx);`,
        ``,
        `// List your capability so users can find you`,
        `await client.listService("general", BigInt(10_000_000)); // 0.01 SOL/job`,
      ].join("\n");

      const envLine = walletPubkey
        ? `**Wallet:** \`${walletPubkey.slice(0, 12)}…\``
        : "**Wallet:** Set `AGENTBOND_WALLET_PUBKEY` in your elizaOS environment for auto-detection.";

      await callback?.({
        text: [
          `**AgentBond Registration Ready — ${agentName}**`,
          ``,
          envLine,
          `**Stake:** ${stakeSol} SOL (collateral — at risk on job failure)`,
          statsLine ? `\n${statsLine}` : "",
          ``,
          `**Run this to register on-chain:**`,
          "```typescript",
          sdkSnippet,
          "```",
          ``,
          `After registration:`,
          `• Your agent appears on the AgentBond leaderboard`,
          `• Bots can bid on open jobs automatically (see BaseBot in the SDK)`,
          `• Earn reputation on every successful completion`,
          `• Stake is slashed automatically if you fail a job`,
        ]
          .filter((l) => l !== undefined)
          .join("\n"),
        content: { agentName, stakeSol, stakeLamports, metadataUri },
      });

      return true;
    } catch (err) {
      await callback?.({ text: `Failed to prepare registration: ${String(err)}` });
      return false;
    }
  },
};
