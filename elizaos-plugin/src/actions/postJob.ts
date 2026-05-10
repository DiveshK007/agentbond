import type { Action, IAgentRuntime, Memory, HandlerCallback } from "../types";
import { postMetadata } from "../api";

/**
 * Prepares a job posting on AgentBond.
 *
 * This action generates the metadata hash and SDK command needed
 * to post a job on-chain. The actual on-chain transaction must be
 * signed by the user's wallet — this action provides the parameters.
 */
export const postJobAction: Action = {
  name: "POST_AGENTBOND_JOB",
  description:
    "Prepare a job posting on AgentBond. Stores the job description off-chain and returns the metadata hash and SDK command to submit the job on-chain.",
  similes: [
    "CREATE_JOB",
    "HIRE_AGENT",
    "POST_JOB",
    "NEW_JOB",
    "AGENTBOND_POST",
    "REQUEST_AGENT",
  ],
  examples: [
    [
      {
        user: "user",
        content: { text: "Post a job on AgentBond: fetch SOL price, reward 0.01 SOL" },
      },
      {
        user: "agent",
        content: { text: "I'll prepare that job posting on AgentBond for you." },
      },
    ],
    [
      {
        user: "user",
        content: { text: "Hire an agent to execute a Jupiter swap from SOL to USDC" },
      },
      {
        user: "agent",
        content: { text: "Preparing an AgentBond job for the swap request..." },
      },
    ],
  ],

  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text.toLowerCase();
    return (
      text.includes("post") ||
      text.includes("job") ||
      text.includes("hire") ||
      text.includes("agent") ||
      text.includes("task")
    );
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state?,
    _options?,
    callback?: HandlerCallback
  ) => {
    try {
      const description = message.content.text;
      const { hash } = await postMetadata(description);

      const rewardLamports = 10_000_000; // 0.01 SOL default
      const deadlineSeconds = 3600; // 1 hour

      const sdkCommand = [
        `// Post this job on-chain using the AgentBond SDK:`,
        `const client = new AgentBondClient(connection, wallet);`,
        `await client.postJob(`,
        `  Buffer.from("${hash}", "hex"),  // descriptionHash`,
        `  BigInt(${rewardLamports}),        // reward: 0.01 SOL`,
        `  ${deadlineSeconds}                // deadline: 1 hour`,
        `);`,
      ].join("\n");

      const text = [
        "**AgentBond Job Prepared**",
        "",
        `Description hash: \`${hash.slice(0, 16)}...\``,
        `Reward: 0.01 SOL (default — customize as needed)`,
        `Deadline: 1 hour`,
        "",
        "**Submit on-chain:**",
        "```typescript",
        sdkCommand,
        "```",
        "",
        "Once posted, agents on the protocol will bid and execute your job automatically.",
      ].join("\n");

      await callback?.({ text, content: { hash, rewardLamports, deadlineSeconds } });
      return true;
    } catch (err) {
      await callback?.({ text: `Failed to prepare job: ${String(err)}` });
      return false;
    }
  },
};
