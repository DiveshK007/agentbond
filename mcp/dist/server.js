#!/usr/bin/env node
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const api_js_1 = require("./api.js");
const server = new index_js_1.Server({ name: "agentbond", version: "0.1.0" }, { capabilities: { tools: {} } });
// ─── Tool Definitions ─────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "get_protocol_stats",
            description: "Fetch live AgentBond protocol statistics: number of agents, jobs posted/completed, SOL staked as collateral, SOL slashed from failed agents, and platform fee.",
            inputSchema: {
                type: "object",
                properties: {},
                required: [],
            },
        },
        {
            name: "list_agents",
            description: "List AI agents registered on the AgentBond protocol. Optionally filter by name or capability keyword. Results sorted by reputation score descending.",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Optional keyword to filter agents by name or capability (e.g. 'swap', 'price', 'portfolio', 'oracle', 'crosschain')",
                    },
                    status: {
                        type: "number",
                        description: "Filter by agent status: 0 = Active, 1 = Suspended. Omit for all agents.",
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of agents to return (default 10, max 50)",
                    },
                },
                required: [],
            },
        },
        {
            name: "get_agent",
            description: "Fetch the full profile of a specific AgentBond agent by their Solana public key address.",
            inputSchema: {
                type: "object",
                properties: {
                    pubkey: {
                        type: "string",
                        description: "The Solana public key (base58) of the agent to look up",
                    },
                },
                required: ["pubkey"],
            },
        },
        {
            name: "list_jobs",
            description: "List jobs on the AgentBond protocol. Filter by status to see open jobs, completed jobs, disputed jobs, etc.",
            inputSchema: {
                type: "object",
                properties: {
                    status: {
                        type: "number",
                        description: "Filter by job status: 0=Open, 1=Assigned, 2=Submitted, 3=Completed, 4=Disputed, 5=Cancelled, 6=Timed Out. Omit for all jobs.",
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of jobs to return (default 10, max 50)",
                    },
                },
                required: [],
            },
        },
        {
            name: "get_job",
            description: "Fetch a specific job's details by its index number on the AgentBond protocol.",
            inputSchema: {
                type: "object",
                properties: {
                    index: {
                        type: "number",
                        description: "The job index number (e.g. 5 for job #5)",
                    },
                },
                required: ["index"],
            },
        },
        {
            name: "post_job",
            description: "Prepare a new job posting on AgentBond. Stores the job description off-chain and returns the metadata hash plus the TypeScript SDK command needed to submit the job on-chain. The actual transaction must be signed by the user's wallet.",
            inputSchema: {
                type: "object",
                properties: {
                    description: {
                        type: "string",
                        description: "Natural language description of the task for AI agents to complete",
                    },
                    reward_sol: {
                        type: "number",
                        description: "Reward in SOL for completing the job (default 0.01 SOL)",
                    },
                    deadline_hours: {
                        type: "number",
                        description: "How many hours agents have to complete the job (default 1 hour)",
                    },
                },
                required: ["description"],
            },
        },
        {
            name: "register_agent",
            description: "Generate the TypeScript SDK command to register a new AI agent on the AgentBond protocol. Returns the code snippet needed to register and stake SOL as collateral.",
            inputSchema: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Name for the agent (e.g. 'MySwapBot')",
                    },
                    stake_sol: {
                        type: "number",
                        description: "Amount of SOL to stake as collateral (minimum 0.1 SOL recommended)",
                    },
                },
                required: ["name"],
            },
        },
    ],
}));
// ─── Tool Handlers ─────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "get_protocol_stats": {
                const stats = await (0, api_js_1.getProtocolStats)();
                const successRate = stats.totalJobs > 0
                    ? ((stats.jobsCompleted / stats.totalJobs) * 100).toFixed(1)
                    : "0.0";
                return {
                    content: [
                        {
                            type: "text",
                            text: [
                                "# AgentBond Protocol Stats",
                                "",
                                `**Network:** Solana Devnet`,
                                `**Total Agents:** ${stats.totalAgents}`,
                                `**Total Jobs:** ${stats.totalJobs}`,
                                `**Completed Jobs:** ${stats.jobsCompleted} (${successRate}% success rate)`,
                                `**SOL Staked:** ${stats.solStaked.toFixed(4)} ◎`,
                                `**SOL Slashed:** ${stats.solSlashed.toFixed(4)} ◎ (from ${stats.totalJobs - stats.jobsCompleted} failed jobs)`,
                                `**Platform Fee:** ${stats.platformFeeBps / 100}% on completions`,
                                "",
                                "AgentBond enforces economic accountability: agents stake SOL before accepting jobs.",
                                "Failures trigger automatic on-chain slashing — no human arbitration.",
                            ].join("\n"),
                        },
                    ],
                };
            }
            case "list_agents": {
                const parsed = zod_1.z
                    .object({
                    query: zod_1.z.string().optional(),
                    status: zod_1.z.number().optional(),
                    limit: zod_1.z.number().min(1).max(50).default(10),
                })
                    .parse(args ?? {});
                let agents = await (0, api_js_1.getAgents)();
                if (parsed.query) {
                    const q = parsed.query.toLowerCase();
                    agents = agents.filter((a) => a.name.toLowerCase().includes(q) ||
                        (q.includes("swap") && a.name.toLowerCase().includes("swap")) ||
                        (q.includes("price") && a.name.toLowerCase().includes("price")) ||
                        (q.includes("oracle") && a.name.toLowerCase().includes("oracle")) ||
                        (q.includes("portfolio") && a.name.toLowerCase().includes("portfolio")) ||
                        (q.includes("cross") && a.name.toLowerCase().includes("cross")));
                }
                if (parsed.status !== undefined) {
                    agents = agents.filter((a) => a.status === parsed.status);
                }
                agents.sort((a, b) => b.reputation - a.reputation);
                const top = agents.slice(0, parsed.limit);
                if (top.length === 0) {
                    return {
                        content: [{ type: "text", text: "No agents found matching your criteria." }],
                    };
                }
                const lines = top.map((a, i) => {
                    const rep = (a.reputation / 100).toFixed(2);
                    const stake = (Number(a.stake) / 1e9).toFixed(3);
                    const statusStr = a.status === 0 ? "Active" : "Suspended";
                    const successRate = a.completed + a.failed > 0
                        ? ((a.completed / (a.completed + a.failed)) * 100).toFixed(0)
                        : "N/A";
                    return [
                        `### ${i + 1}. ${a.name}`,
                        `- **Reputation:** ${rep} | **Status:** ${statusStr}`,
                        `- **Stake:** ${stake} ◎ | **Jobs:** ${a.completed} completed, ${a.failed} failed (${successRate}% success)`,
                        `- **Public Key:** \`${a.pubkey}\``,
                    ].join("\n");
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `# AgentBond Agents (${agents.length} total)\n\n${lines.join("\n\n")}`,
                        },
                    ],
                };
            }
            case "get_agent": {
                const { pubkey } = zod_1.z.object({ pubkey: zod_1.z.string() }).parse(args);
                const agent = await (0, api_js_1.getAgent)(pubkey);
                const rep = (agent.reputation / 100).toFixed(2);
                const stake = (Number(agent.stake) / 1e9).toFixed(4);
                const statusStr = agent.status === 0 ? "Active" : "Suspended";
                const total = agent.completed + agent.failed;
                const successRate = total > 0 ? ((agent.completed / total) * 100).toFixed(1) : "N/A";
                return {
                    content: [
                        {
                            type: "text",
                            text: [
                                `# Agent: ${agent.name}`,
                                "",
                                `**Status:** ${statusStr}`,
                                `**Reputation Score:** ${rep}`,
                                `**Stake:** ${stake} ◎ (collateral at risk)`,
                                `**Jobs Completed:** ${agent.completed}`,
                                `**Jobs Failed:** ${agent.failed}`,
                                `**Success Rate:** ${successRate}%`,
                                `**Owner:** \`${agent.owner}\``,
                                `**Public Key:** \`${agent.pubkey}\``,
                            ].join("\n"),
                        },
                    ],
                };
            }
            case "list_jobs": {
                const parsed = zod_1.z
                    .object({
                    status: zod_1.z.number().min(0).max(6).optional(),
                    limit: zod_1.z.number().min(1).max(50).default(10),
                })
                    .parse(args ?? {});
                const jobs = await (0, api_js_1.getJobs)(parsed.status);
                const top = jobs.slice(0, parsed.limit);
                if (top.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: parsed.status !== undefined
                                    ? `No jobs with status "${api_js_1.STATUS_LABEL[parsed.status] ?? parsed.status}" found.`
                                    : "No jobs found on the protocol.",
                            },
                        ],
                    };
                }
                const lines = top.map((j) => {
                    const reward = (Number(j.reward) / 1e9).toFixed(4);
                    const statusStr = api_js_1.STATUS_LABEL[j.status] ?? "Unknown";
                    const hasAgent = j.agent !== "11111111111111111111111111111111";
                    const deadline = new Date(j.deadline * 1000).toISOString();
                    return [
                        `### Job #${j.jobIndex} — ${statusStr}`,
                        `- **Reward:** ${reward} ◎`,
                        `- **Poster:** \`${j.poster.slice(0, 12)}…\``,
                        hasAgent ? `- **Agent:** \`${j.agent.slice(0, 12)}…\`` : "",
                        `- **Deadline:** ${deadline}`,
                    ]
                        .filter(Boolean)
                        .join("\n");
                });
                const statusHeader = parsed.status !== undefined
                    ? ` (status: ${api_js_1.STATUS_LABEL[parsed.status] ?? parsed.status})`
                    : "";
                return {
                    content: [
                        {
                            type: "text",
                            text: `# AgentBond Jobs${statusHeader} — showing ${top.length} of ${jobs.length}\n\n${lines.join("\n\n")}`,
                        },
                    ],
                };
            }
            case "get_job": {
                const { index } = zod_1.z.object({ index: zod_1.z.number() }).parse(args);
                const job = await (0, api_js_1.getJob)(index);
                const reward = (Number(job.reward) / 1e9).toFixed(4);
                const statusStr = api_js_1.STATUS_LABEL[job.status] ?? "Unknown";
                const hasAgent = job.agent !== "11111111111111111111111111111111";
                const deadline = new Date(job.deadline * 1000).toISOString();
                return {
                    content: [
                        {
                            type: "text",
                            text: [
                                `# AgentBond Job #${job.jobIndex}`,
                                "",
                                `**Status:** ${statusStr}`,
                                `**Reward:** ${reward} ◎`,
                                `**Poster:** \`${job.poster}\``,
                                hasAgent ? `**Assigned Agent:** \`${job.agent}\`` : "**Agent:** Not yet assigned",
                                `**Deadline:** ${deadline}`,
                                `**Description Hash:** \`${job.descriptionHash}\``,
                                "",
                                statusStr === "Open"
                                    ? "This job is open — agents can bid to take it."
                                    : statusStr === "Completed"
                                        ? "This job is complete — reward has been released."
                                        : statusStr === "Disputed"
                                            ? "This job was disputed — the agent's stake was slashed."
                                            : "",
                            ]
                                .filter((l) => l !== undefined)
                                .join("\n"),
                        },
                    ],
                };
            }
            case "post_job": {
                const parsed = zod_1.z
                    .object({
                    description: zod_1.z.string().min(1),
                    reward_sol: zod_1.z.number().positive().default(0.01),
                    deadline_hours: zod_1.z.number().positive().default(1),
                })
                    .parse(args);
                const { hash } = await (0, api_js_1.postMetadata)(parsed.description);
                const rewardLamports = Math.round(parsed.reward_sol * 1e9);
                const deadlineSeconds = Math.round(parsed.deadline_hours * 3600);
                const sdkSnippet = [
                    `import { AgentBondClient } from "@agentbond/sdk";`,
                    `import { Connection, Keypair } from "@solana/web3.js";`,
                    ``,
                    `const connection = new Connection("https://api.devnet.solana.com");`,
                    `const wallet = /* your Keypair or wallet adapter */;`,
                    `const client = new AgentBondClient(connection, wallet);`,
                    ``,
                    `await client.postJob(`,
                    `  Buffer.from("${hash}", "hex"),  // description hash`,
                    `  BigInt(${rewardLamports}),        // reward: ${parsed.reward_sol} SOL`,
                    `  ${deadlineSeconds}                // deadline: ${parsed.deadline_hours}h`,
                    `);`,
                ].join("\n");
                return {
                    content: [
                        {
                            type: "text",
                            text: [
                                "# Job Prepared on AgentBond",
                                "",
                                `**Description hash:** \`${hash}\``,
                                `**Reward:** ${parsed.reward_sol} SOL`,
                                `**Deadline:** ${parsed.deadline_hours} hour(s)`,
                                "",
                                "## Submit On-Chain",
                                "Sign and submit this transaction from your wallet:",
                                "```typescript",
                                sdkSnippet,
                                "```",
                                "",
                                "Once posted, registered agents will automatically bid and execute the task.",
                                "Payment is escrowed in the smart contract and released only on completion.",
                            ].join("\n"),
                        },
                    ],
                };
            }
            case "register_agent": {
                const parsed = zod_1.z
                    .object({
                    name: zod_1.z.string().min(1).max(50),
                    stake_sol: zod_1.z.number().positive().default(0.1),
                })
                    .parse(args);
                const stakeLamports = Math.round(parsed.stake_sol * 1e9);
                const sdkSnippet = [
                    `import { AgentBondClient } from "@agentbond/sdk";`,
                    `import { Connection, Keypair } from "@solana/web3.js";`,
                    ``,
                    `const connection = new Connection("https://api.devnet.solana.com");`,
                    `const wallet = /* your agent's Keypair */;`,
                    `const client = new AgentBondClient(connection, wallet);`,
                    ``,
                    `// Register agent and stake collateral`,
                    `await client.registerAgent("${parsed.name}", BigInt(${stakeLamports}));`,
                    ``,
                    `// After registration, start listening for jobs:`,
                    `// import { BaseBot } from "@agentbond/bots";`,
                    `// class ${parsed.name.replace(/\s+/g, "")} extends BaseBot { ... }`,
                ].join("\n");
                return {
                    content: [
                        {
                            type: "text",
                            text: [
                                `# Register Agent: ${parsed.name}`,
                                "",
                                `**Stake:** ${parsed.stake_sol} SOL (${stakeLamports} lamports)`,
                                "",
                                "This stake is locked as collateral. Successful job completions release reward.",
                                "Failed or disputed jobs trigger automatic on-chain slashing of this stake.",
                                "",
                                "## Registration Code",
                                "```typescript",
                                sdkSnippet,
                                "```",
                                "",
                                "## After Registration",
                                "1. Your agent will appear in the protocol registry",
                                "2. Extend `BaseBot` to implement your job handler logic",
                                "3. Your agent will automatically receive job assignments based on reputation",
                            ].join("\n"),
                        },
                    ],
                };
            }
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            content: [{ type: "text", text: `Error: ${message}` }],
            isError: true,
        };
    }
});
// ─── Start ─────────────────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    process.stderr.write("AgentBond MCP server running on stdio\n");
}
main().catch((err) => {
    process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
});
//# sourceMappingURL=server.js.map