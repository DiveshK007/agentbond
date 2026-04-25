import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { IDL } from "../sdk/src/idl";
import {
  findProtocolConfig,
  findAgentProfile,
  findJob,
  bytesToString,
} from "../sdk/src/utils";

const connection = new Connection(
  process.env["RPC_URL"] ?? "https://api.devnet.solana.com",
  "confirmed"
);

const kp = Keypair.generate();
const readonlyWallet = {
  publicKey: kp.publicKey,
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    return Promise.resolve(tx);
  },
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return Promise.resolve(txs);
  },
};

const provider = new AnchorProvider(connection, readonlyWallet, { commitment: "confirmed" });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const program = new Program(IDL as Idl, provider) as any;

function hashToHex(arr: number[]): string {
  return Buffer.from(arr).toString("hex");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAgent(pubkey: PublicKey, acc: any) {
  return {
    pubkey: pubkey.toBase58(),
    owner: (acc.owner as PublicKey).toBase58(),
    name: bytesToString(new Uint8Array(acc.name as number[])),
    metadataUri: bytesToString(new Uint8Array(acc.metadataUri as number[])),
    stake: String(acc.stake),
    lockedStake: String(acc.lockedStake),
    reputation: acc.reputation as number,
    completed: acc.completed as number,
    failed: acc.failed as number,
    consecutiveFails: acc.consecutiveFails as number,
    totalEarned: String(acc.totalEarned),
    totalSlashed: String(acc.totalSlashed),
    registeredAt: Number(acc.registeredAt),
    status: acc.status as number,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeJob(pubkey: PublicKey, acc: any) {
  return {
    pubkey: pubkey.toBase58(),
    poster: (acc.poster as PublicKey).toBase58(),
    agent: (acc.agent as PublicKey).toBase58(),
    descriptionHash: hashToHex(acc.descriptionHash as number[]),
    reward: String(acc.reward),
    collateral: String(acc.collateral),
    deadline: Number(acc.deadline),
    mode: acc.mode as number,
    status: acc.status as number,
    resultHash: hashToHex(acc.resultHash as number[]),
    createdAt: Number(acc.createdAt),
    assignedAt: Number(acc.assignedAt),
    resolvedAt: Number(acc.resolvedAt),
    jobIndex: String(acc.jobIndex),
  };
}

type SerializedAgent = ReturnType<typeof serializeAgent>;
type SerializedJob = ReturnType<typeof serializeJob>;

export const client = {
  async getProtocolStats() {
    const [pda] = findProtocolConfig();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acc = await (program.account.protocolConfig.fetch(pda) as Promise<any>);
    return {
      admin: (acc.admin as PublicKey).toBase58(),
      totalAgents: String(acc.totalAgents),
      totalJobs: String(acc.totalJobs),
      totalVolume: String(acc.totalVolume),
      platformFeeBps: acc.platformFeeBps as number,
    };
  },

  async getAllAgents(): Promise<SerializedAgent[]> {
    const all = await program.account.agentProfile.all();
    return (all as { publicKey: PublicKey; account: unknown }[]).map(
      ({ publicKey, account }) => serializeAgent(publicKey, account)
    );
  },

  async getAgent(owner: PublicKey): Promise<SerializedAgent> {
    const [pda] = findAgentProfile(owner);
    const acc = await program.account.agentProfile.fetch(pda);
    return serializeAgent(pda, acc);
  },

  async getAllJobs(status?: number): Promise<SerializedJob[]> {
    const all = await program.account.job.all();
    const jobs = (all as { publicKey: PublicKey; account: unknown }[]).map(
      ({ publicKey, account }) => serializeJob(publicKey, account)
    );
    if (status !== undefined) {
      return jobs.filter((j) => j.status === status);
    }
    return jobs;
  },

  async getJob(jobIndex: bigint): Promise<SerializedJob> {
    const [pda] = findJob(jobIndex);
    const acc = await program.account.job.fetch(pda);
    return serializeJob(pda, acc);
  },
};
