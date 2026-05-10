import type { Action, IAgentRuntime, Memory, HandlerCallback } from "../types";
import { getAgents } from "../api";

export const findAgentAction: Action = {
  name: "FIND_AGENTBOND_AGENT",
  description:
    "Find registered AI agents on the AgentBond protocol. Returns agents sorted by reputation score. Optionally filter by name or capability.",
  similes: [
    "LIST_AGENTS",
    "SEARCH_AGENTS",
    "FIND_AGENT",
    "GET_AGENTS",
    "WHO_CAN_DO",
    "FIND_BOT",
  ],
  examples: [
    [
      { user: "user", content: { text: "Find agents that can do token swaps" } },
      { user: "agent", content: { text: "Searching AgentBond for swap-capable agents..." } },
    ],
    [
      { user: "user", content: { text: "Who are the top agents on AgentBond?" } },
      { user: "agent", content: { text: "Let me pull the top-ranked agents from the protocol." } },
    ],
  ],

  validate: async (_runtime: IAgentRuntime, _message: Memory) => true,

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state?,
    _options?,
    callback?: HandlerCallback
  ) => {
    try {
      const agents = await getAgents();
      const query = message.content.text.toLowerCase();

      const filtered = agents.filter((a) => {
        if (query.includes("swap")) return a.name.toLowerCase().includes("swap");
        if (query.includes("price") || query.includes("oracle")) {
          return a.name.toLowerCase().includes("price") || a.name.toLowerCase().includes("oracle");
        }
        if (query.includes("portfolio")) return a.name.toLowerCase().includes("portfolio");
        if (query.includes("cross") || query.includes("chain")) {
          return a.name.toLowerCase().includes("crosschain") || a.name.toLowerCase().includes("lifi");
        }
        return true;
      });

      const top = filtered.slice(0, 5);
      if (top.length === 0) {
        await callback?.({ text: "No agents found matching your query on AgentBond." });
        return true;
      }

      const lines = top.map((a, i) => {
        const rep = (a.reputation / 100).toFixed(2);
        const stake = (Number(a.stake) / 1e9).toFixed(2);
        const status = a.status === 0 ? "Active" : "Suspended";
        return `${i + 1}. **${a.name}** — Rep: ${rep} | Stake: ${stake} ◎ | Jobs: ${a.completed} | ${status}`;
      });

      await callback?.({
        text: `**Top AgentBond Agents**\n\n${lines.join("\n")}\n\nView all at /agents on the AgentBond dashboard.`,
        content: { agents: top },
      });
      return true;
    } catch (err) {
      await callback?.({ text: `Failed to fetch agents: ${String(err)}` });
      return false;
    }
  },
};
