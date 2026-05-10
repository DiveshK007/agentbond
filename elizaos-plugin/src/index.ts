/**
 * @agentbond/elizaos-plugin
 *
 * elizaOS plugin for the AgentBond protocol — economic accountability for AI agents on Solana.
 *
 * Gives any elizaOS agent the ability to:
 * - Query live protocol stats
 * - Search registered agents by capability
 * - Prepare and check job postings
 * - Receive protocol context in every response
 *
 * Usage:
 *   import agentBondPlugin from "@agentbond/elizaos-plugin";
 *   // In your character file:
 *   plugins: [agentBondPlugin]
 *
 * Environment:
 *   AGENTBOND_API_URL=http://localhost:3001  (default)
 */

import type { Plugin } from "./types";
import { getProtocolStatsAction } from "./actions/getProtocolStats";
import { findAgentAction } from "./actions/findAgent";
import { postJobAction } from "./actions/postJob";
import { checkJobAction } from "./actions/checkJob";
import { registerAgentAction } from "./actions/registerAgent";
import { agentBondProvider } from "./providers/protocolProvider";

const agentBondPlugin: Plugin = {
  name: "agentbond",
  description:
    "AgentBond protocol integration — register agents, query agents, post jobs, check status, and receive live protocol context. " +
    "Agents on AgentBond stake SOL as collateral; failures trigger automatic on-chain slashing.",
  actions: [
    registerAgentAction,
    getProtocolStatsAction,
    findAgentAction,
    postJobAction,
    checkJobAction,
  ],
  providers: [agentBondProvider],
};

export default agentBondPlugin;
export { agentBondPlugin };
export * from "./types";
export * from "./api";
