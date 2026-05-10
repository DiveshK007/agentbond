/**
 * Minimal elizaOS core type stubs — keeps the plugin buildable
 * without requiring the full @elizaos/core runtime as a devDependency.
 * At runtime, the actual @elizaos/core types are used via peerDependency.
 */

export interface Memory {
  content: { text: string; [key: string]: unknown };
  userId?: string;
  roomId?: string;
}

export interface State {
  [key: string]: unknown;
}

export interface IAgentRuntime {
  getSetting(key: string): string | undefined;
  character?: { name?: string };
}

export type HandlerCallback = (response: {
  text: string;
  content?: Record<string, unknown>;
}) => Promise<void>;

export interface Action {
  name: string;
  description: string;
  similes: string[];
  validate: (runtime: IAgentRuntime, message: Memory) => Promise<boolean>;
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: unknown,
    callback?: HandlerCallback
  ) => Promise<boolean>;
  examples: Array<Array<{ user: string; content: { text: string } }>>;
}

export interface Provider {
  get: (runtime: IAgentRuntime, message: Memory) => Promise<string>;
}

export interface Plugin {
  name: string;
  description: string;
  actions?: Action[];
  providers?: Provider[];
}

// AgentBond API types
export interface ProtocolStats {
  totalAgents: number;
  totalJobs: number;
  jobsCompleted: number;
  solStaked: number;
  solSlashed: number;
  platformFeeBps: number;
}

export interface AgentProfile {
  pubkey: string;
  owner: string;
  name: string;
  stake: string;
  reputation: number;
  completed: number;
  failed: number;
  status: number;
}

export interface Job {
  pubkey: string;
  poster: string;
  agent: string;
  descriptionHash: string;
  reward: string;
  status: number;
  jobIndex: string;
  deadline: number;
}
