import { createHash } from "crypto";
import { readFileSync } from "fs";
import { homedir } from "os";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { AgentBondClient } from "../sdk/src/client";
import { Job, JobStatus } from "../sdk/src/types";
import { findAgentProfile, findJob, findServiceListing } from "../sdk/src/utils";

const DEVNET_RPC = "https://api.devnet.solana.com";
const POLL_INTERVAL_MS = 5_000;

function loadKeypair(): Keypair {
  const keypairPath =
    process.env["KEYPAIR_PATH"] ??
    `${homedir()}/.config/solana/apex-bot-devnet.json`;
  const raw = JSON.parse(readFileSync(keypairPath, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

export abstract class BaseBot {
  protected client!: AgentBondClient;
  protected walletPublicKey!: PublicKey;
  private readonly processingJobs = new Set<string>();

  constructor(
    private readonly botName: string,
    private readonly capability: string,
    private readonly stakeAmountLamports: bigint,
    private readonly servicePriceLamports: bigint
  ) {}

  protected log(msg: string): void {
    console.log(`[${new Date().toISOString()}] [${this.botName}] ${msg}`);
  }

  async start(): Promise<void> {
    const keypair = loadKeypair();
    const connection = new Connection(
      process.env["RPC_URL"] ?? DEVNET_RPC,
      "confirmed"
    );
    this.walletPublicKey = keypair.publicKey;
    // Wallet is NodeWallet — takes a Keypair, handles transaction signing
    this.client = new AgentBondClient(connection, new Wallet(keypair) as never);

    this.log(`Wallet: ${this.walletPublicKey.toBase58()}`);

    await this.ensureRegistered();
    await this.ensureServiceListed();

    this.log(`Polling every ${POLL_INTERVAL_MS / 1_000}s...`);
    await this.pollJobs();
    setInterval(() => {
      void this.pollJobs();
    }, POLL_INTERVAL_MS);
  }

  private async ensureRegistered(): Promise<void> {
    try {
      await this.client.getAgent(this.walletPublicKey);
      this.log("Agent already registered");
    } catch {
      this.log(`Registering with ${this.stakeAmountLamports} lamports stake...`);
      const tx = await this.client.registerAgent(
        this.botName,
        `https://agentbond.demo/bots/${this.botName.toLowerCase()}`,
        this.stakeAmountLamports
      );
      this.log(`Registered: ${tx}`);
    }
  }

  private async ensureServiceListed(): Promise<void> {
    const [agentProfilePda] = findAgentProfile(this.walletPublicKey);
    const [serviceListingPda] = findServiceListing(agentProfilePda, this.capability);
    const info = await this.client.provider.connection.getAccountInfo(serviceListingPda);
    if (info !== null) {
      this.log(`Service "${this.capability}" already listed`);
      return;
    }
    this.log(`Listing service "${this.capability}" at ${this.servicePriceLamports} lamports...`);
    const tx = await this.client.listService(this.capability, this.servicePriceLamports);
    this.log(`Service listed: ${tx}`);
  }

  private async pollJobs(): Promise<void> {
    try {
      const jobs = await this.client.getAllJobs();
      const assigned = jobs.filter(
        (j) =>
          j.status === JobStatus.Assigned &&
          j.agent.equals(this.walletPublicKey) &&
          !this.processingJobs.has(j.jobIndex.toString())
      );
      for (const job of assigned) {
        void this.processJob(job);
      }
    } catch (err) {
      this.log(`Poll error: ${String(err)}`);
    }
  }

  private async processJob(job: Job): Promise<void> {
    const idx = job.jobIndex.toString();
    this.processingJobs.add(idx);
    this.log(`Job #${idx} started`);
    try {
      const resultJson = await this.executeJob(job);
      const resultHash = this.sha256(resultJson);
      const [jobPda] = findJob(job.jobIndex);
      const tx = await this.client.submitResult(jobPda, resultHash);
      this.log(`Job #${idx} submitted. tx=${tx} result=${resultJson}`);
    } catch (err) {
      this.log(`Job #${idx} failed: ${String(err)}`);
    } finally {
      this.processingJobs.delete(idx);
    }
  }

  abstract executeJob(job: Job): Promise<string>;

  protected sha256(data: string): Buffer {
    return createHash("sha256").update(data).digest();
  }
}
