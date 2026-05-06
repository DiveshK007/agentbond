import { createHash } from "crypto";
import { readFileSync } from "fs";
import { homedir } from "os";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { AgentBondClient } from "../sdk/src/client";
import { Job, JobStatus } from "../sdk/src/types";
import { findAgentProfile, findJob, findServiceListing } from "../sdk/src/utils";
import { SwigWalletManager, type PermissionPreset } from "./swig-manager";
import {
  createAgentBondUmi,
  loadKeypairIntoUmi,
  registerAgentIdentity,
  AGENT_METADATA_PRESETS,
} from "../sdk/src/metaplex-registry";

const DEVNET_RPC = process.env.RPC_URL || "https://api.devnet.solana.com";
const POLL_INTERVAL_MS = 30_000;

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
  protected swigAddress: PublicKey | null = null;
  protected metaplexAssetAddress: string | null = null;
  private readonly biddedJobs = new Set<string>();
  private readonly processingJobs = new Set<string>();

  constructor(
    private readonly botName: string,
    private readonly capability: string,
    private readonly stakeAmountLamports: bigint,
    private readonly servicePriceLamports: bigint,
    private readonly swigPreset: PermissionPreset = "readonly"
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

    // Provision Swig smart wallet with scoped permissions
    try {
      const swigManager = new SwigWalletManager(connection);
      this.swigAddress = await swigManager.provisionSwig(
        this.botName,
        keypair,
        this.swigPreset
      );
      this.log(`Swig wallet: ${this.swigAddress.toBase58()} (preset: ${this.swigPreset})`);
    } catch (err) {
      this.log(`Swig provisioning skipped: ${String(err)}`);
    }

    // Register on Metaplex Agent Registry (on-chain verifiable identity)
    try {
      const metadata = AGENT_METADATA_PRESETS[this.botName];
      if (metadata) {
        const umi = loadKeypairIntoUmi(createAgentBondUmi(), keypair);
        const result = await registerAgentIdentity(umi, metadata);
        this.metaplexAssetAddress = result.assetAddress;
        this.log(`Metaplex Agent Identity: ${result.assetAddress}`);
      }
    } catch (err) {
      this.log(`Metaplex registration skipped: ${String(err)}`);
    }

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
      this.log(`Found ${jobs.length} total jobs`);

      // Loop 1: bid on all open jobs we haven't bid on yet
      const openJobs = jobs.filter(
        (j) =>
          j.status === JobStatus.Open &&
          !this.biddedJobs.has(j.jobIndex.toString())
      );
      this.log(`${openJobs.length} open jobs to bid on`);
      if (openJobs.length === 0) {
        this.log("No matching jobs this poll");
      }
      for (const job of openJobs) {
        this.log(`Bidding on job index ${job.jobIndex}`);
        void this.bidJob(job);
      }

      // Loop 2: execute jobs assigned to this bot
      const assignedJobs = jobs.filter((j) => j.status === JobStatus.Assigned);
      for (const j of assignedJobs) {
        this.log(
          `Job #${j.jobIndex} agent: ${j.agent.toBase58()}, my wallet: ${this.walletPublicKey.toBase58()}, match: ${j.agent.equals(this.walletPublicKey)}`
        );
      }
      const myJobs = assignedJobs.filter(
        (j) =>
          j.agent.equals(this.walletPublicKey) &&
          !this.processingJobs.has(j.jobIndex.toString())
      );
      for (const job of myJobs) {
        void this.processJob(job);
      }
    } catch (err) {
      this.log(`Poll error: ${String(err)}`);
    }
  }

  private async bidJob(job: Job): Promise<void> {
    const idx = job.jobIndex.toString();
    this.biddedJobs.add(idx);
    try {
      const [jobPda] = findJob(job.jobIndex);
      const tx = await this.client.bidOnJob(jobPda, this.servicePriceLamports, 3600);
      this.log(`Bid placed on job #${idx}: ${tx}`);
    } catch (err) {
      const msg = String(err);
      if (msg.includes("already in use")) {
        this.log(`Bid on job #${idx} already exists, marking as bid`);
      } else {
        this.biddedJobs.delete(idx);
      }
      this.log(`Bid failed on job #${idx}: ${msg}`);
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
