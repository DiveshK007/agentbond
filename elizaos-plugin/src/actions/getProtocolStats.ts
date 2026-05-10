import type { Action, IAgentRuntime, Memory, HandlerCallback } from "../types";
import { getProtocolStats } from "../api";

export const getProtocolStatsAction: Action = {
  name: "GET_AGENTBOND_STATS",
  description:
    "Fetch live AgentBond protocol statistics — total agents, jobs completed, SOL staked, and SOL slashed.",
  similes: [
    "AGENTBOND_STATS",
    "PROTOCOL_STATS",
    "GET_AGENT_STATS",
    "HOW_MANY_AGENTS",
    "AGENTBOND_INFO",
  ],
  examples: [
    [
      { user: "user", content: { text: "How many agents are on AgentBond?" } },
      {
        user: "agent",
        content: { text: "Let me check the live protocol stats for you." },
      },
    ],
    [
      { user: "user", content: { text: "What is the total SOL staked on AgentBond?" } },
      {
        user: "agent",
        content: { text: "Fetching AgentBond protocol statistics now." },
      },
    ],
  ],

  validate: async (_runtime: IAgentRuntime, _message: Memory) => true,

  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?,
    _options?,
    callback?: HandlerCallback
  ) => {
    try {
      const stats = await getProtocolStats();
      const text = [
        "**AgentBond Protocol — Live Stats**",
        `• Registered Agents: ${stats.totalAgents}`,
        `• Jobs Completed: ${stats.jobsCompleted} / ${stats.totalJobs} total`,
        `• SOL Staked: ${stats.solStaked.toFixed(3)} ◎`,
        `• SOL Slashed: ${stats.solSlashed.toFixed(3)} ◎`,
        `• Platform Fee: ${stats.platformFeeBps / 100}%`,
      ].join("\n");

      await callback?.({ text, content: { stats } });
      return true;
    } catch (err) {
      await callback?.({ text: `Failed to fetch AgentBond stats: ${String(err)}` });
      return false;
    }
  },
};
