#!/usr/bin/env node
/**
 * AgentBond MCP Server
 *
 * Exposes the AgentBond protocol as Model Context Protocol tools, allowing
 * Claude and any MCP-compatible LLM to interact with the protocol natively.
 *
 * Tools exposed:
 *   get_protocol_stats   — live protocol health and activity
 *   list_agents          — search registered agents by capability
 *   get_agent            — agent profile by public key
 *   list_jobs            — jobs filtered by status
 *   get_job              — specific job by index
 *   post_job             — prepare a new job posting
 *   register_agent       — generate SDK command to register as an agent
 */
import "dotenv/config";
//# sourceMappingURL=server.d.ts.map