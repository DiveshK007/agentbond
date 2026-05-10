import type { Action, IAgentRuntime, Memory, HandlerCallback } from "../types";
import { getJob, getJobs } from "../api";

const STATUS_LABEL: Record<number, string> = {
  0: "Open — awaiting bids",
  1: "Assigned — agent is working",
  2: "Submitted — pending your approval",
  3: "Completed — payment released",
  4: "Disputed — agent was slashed",
  5: "Cancelled",
  6: "Timed Out",
};

export const checkJobAction: Action = {
  name: "CHECK_AGENTBOND_JOB",
  description:
    "Check the status of a specific AgentBond job by index, or list all open jobs waiting to be filled.",
  similes: [
    "JOB_STATUS",
    "GET_JOB",
    "CHECK_JOB",
    "LIST_JOBS",
    "OPEN_JOBS",
    "JOB_PROGRESS",
  ],
  examples: [
    [
      { user: "user", content: { text: "Check the status of AgentBond job #5" } },
      { user: "agent", content: { text: "Looking up AgentBond job #5..." } },
    ],
    [
      { user: "user", content: { text: "What open jobs are on AgentBond?" } },
      { user: "agent", content: { text: "Fetching open jobs from the AgentBond protocol." } },
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
      const text = message.content.text;

      // Try to extract a job index from the message
      const indexMatch = text.match(/\b(\d+)\b/);

      if (indexMatch) {
        const job = await getJob(indexMatch[1]);
        const reward = (Number(job.reward) / 1e9).toFixed(4);
        const statusLabel = STATUS_LABEL[job.status] ?? "Unknown";

        await callback?.({
          text: [
            `**AgentBond Job #${job.jobIndex}**`,
            `Status: ${statusLabel}`,
            `Reward: ${reward} ◎`,
            `Poster: \`${job.poster.slice(0, 8)}…\``,
            job.agent !== "11111111111111111111111111111111"
              ? `Agent: \`${job.agent.slice(0, 8)}…\``
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
          content: { job },
        });
      } else {
        const openJobs = await getJobs(0);
        if (openJobs.length === 0) {
          await callback?.({ text: "No open jobs on AgentBond right now." });
          return true;
        }
        const lines = openJobs.slice(0, 5).map((j) => {
          const reward = (Number(j.reward) / 1e9).toFixed(4);
          return `• Job #${j.jobIndex} — ${reward} ◎ reward`;
        });
        await callback?.({
          text: `**Open Jobs on AgentBond** (${openJobs.length} total)\n\n${lines.join("\n")}`,
          content: { jobs: openJobs.slice(0, 5) },
        });
      }

      return true;
    } catch (err) {
      await callback?.({ text: `Failed to check job: ${String(err)}` });
      return false;
    }
  },
};
