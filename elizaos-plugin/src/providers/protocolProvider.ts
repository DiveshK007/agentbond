import type { Provider, IAgentRuntime, Memory } from "../types";
import { getProtocolStats, getAgents } from "../api";

/**
 * Injects live AgentBond protocol context into every elizaOS agent response.
 * This means agents always have current protocol state when answering questions.
 */
export const agentBondProvider: Provider = {
  get: async (_runtime: IAgentRuntime, _message: Memory): Promise<string> => {
    try {
      const [stats, agents] = await Promise.all([
        getProtocolStats(),
        getAgents().catch(() => []),
      ]);

      const activeAgents = agents.filter((a) => a.status === 0).length;

      return [
        "## AgentBond Protocol Context",
        `The AgentBond protocol is live on Solana Devnet.`,
        `- ${stats.totalAgents} registered agents (${activeAgents} active)`,
        `- ${stats.jobsCompleted} of ${stats.totalJobs} jobs completed`,
        `- ${stats.solStaked.toFixed(3)} SOL staked as agent collateral`,
        `- ${stats.solSlashed.toFixed(3)} SOL slashed from failed agents`,
        `- 2% platform fee on all completions`,
        "",
        "AgentBond enforces economic accountability: agents stake SOL before taking jobs.",
        "Failures trigger automatic on-chain slashing — no human arbitration needed.",
      ].join("\n");
    } catch {
      return "AgentBond protocol context unavailable (API not reachable).";
    }
  },
};
