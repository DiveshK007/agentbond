import {
  AnchorProvider,
  Program,
  BN,
  setProvider,
  Wallet,
  Idl,
} from "@coral-xyz/anchor";
import {
  PublicKey,
  Connection,

} from "@solana/web3.js";
import { IDL } from "./idl";
import {
  AgentProfile,
  Bid,
  Job,
  JobStatus,
  ProtocolConfig,
} from "./types";
import {
  PROGRAM_ID,
  findProtocolConfig,
  findAgentProfile,
  findStakeVault,
  findServiceListing,
  findJob,
  findEscrowVault,
  findTreasury,
  findBid,
} from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProgram = Program<Idl>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AccountNS = any;

export class AgentBondClient {
  readonly program: AnyProgram;
  readonly provider: AnchorProvider;

  constructor(connection: Connection, wallet: Wallet) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    setProvider(this.provider);
    this.program = new Program(IDL as Idl, this.provider);
  }

  get walletPublicKey(): PublicKey {
    return this.provider.wallet.publicKey;
  }

  private get accounts(): AccountNS {
    return this.program.account;
  }

  // ─── Agent Ops ───────────────────────────────────────────────────────────────

  async registerAgent(
    name: string,
    metadataUri: string,
    stakeLamports: bigint
  ): Promise<string> {
    const owner = this.walletPublicKey;
    const [agentProfile] = findAgentProfile(owner);
    const [stakeVault] = findStakeVault(agentProfile);
    const [protocolConfig] = findProtocolConfig();

    return this.program.methods
      .registerAgent(name, metadataUri, new BN(stakeLamports.toString()))
      .accounts({ agentProfile, stakeVault, protocolConfig, owner })
      .rpc();
  }

  async updateStake(deposit?: bigint, withdraw?: bigint): Promise<string> {
    const owner = this.walletPublicKey;
    const [agentProfile] = findAgentProfile(owner);
    const [stakeVault] = findStakeVault(agentProfile);

    return this.program.methods
      .updateStake(
        deposit != null ? new BN(deposit.toString()) : null,
        withdraw != null ? new BN(withdraw.toString()) : null
      )
      .accounts({ agentProfile, stakeVault, owner })
      .rpc();
  }

  async listService(capability: string, priceLamports: bigint): Promise<string> {
    const owner = this.walletPublicKey;
    const [agentProfile] = findAgentProfile(owner);
    const [serviceListing] = findServiceListing(agentProfile, capability);

    return this.program.methods
      .listService(capability, new BN(priceLamports.toString()))
      .accounts({ serviceListing, agentProfile, owner })
      .rpc();
  }

  async deregisterAgent(): Promise<string> {
    const owner = this.walletPublicKey;
    const [agentProfile] = findAgentProfile(owner);
    const [stakeVault] = findStakeVault(agentProfile);
    const [protocolConfig] = findProtocolConfig();

    return this.program.methods
      .deregisterAgent()
      .accounts({ agentProfile, stakeVault, protocolConfig, owner })
      .rpc();
  }

  // ─── Instant Hire ────────────────────────────────────────────────────────────

  async instantHire(
    agentPubkey: PublicKey,
    descriptionHash: Uint8Array,
    rewardLamports: bigint,
    deadlineSeconds: bigint
  ): Promise<string> {
    const protocolConfig = await this.getProtocolStats();
    const jobIndex = protocolConfig.totalJobs;

    const [agentProfile] = findAgentProfile(agentPubkey);
    const [jobPda] = findJob(jobIndex);
    const [escrowVault] = findEscrowVault(jobPda);
    const [protocolConfigPda] = findProtocolConfig();

    return this.program.methods
      .createJob(
        new BN(jobIndex.toString()),
        Array.from(descriptionHash),
        new BN(rewardLamports.toString()),
        new BN(deadlineSeconds.toString()),
        1,
        agentPubkey
      )
      .accounts({
        job: jobPda,
        escrowVault,
        protocolConfig: protocolConfigPda,
        agentProfile,
        poster: this.walletPublicKey,
      })
      .rpc();
  }

  // ─── Job Board ───────────────────────────────────────────────────────────────

  async postJob(
    descriptionHash: Uint8Array,
    rewardLamports: bigint,
    deadlineSeconds: bigint
  ): Promise<string> {
    const protocolConfig = await this.getProtocolStats();
    const jobIndex = protocolConfig.totalJobs;

    const [jobPda] = findJob(jobIndex);
    const [escrowVault] = findEscrowVault(jobPda);
    const [protocolConfigPda] = findProtocolConfig();

    return this.program.methods
      .createJob(
        new BN(jobIndex.toString()),
        Array.from(descriptionHash),
        new BN(rewardLamports.toString()),
        new BN(deadlineSeconds.toString()),
        0,
        null
      )
      .accounts({
        job: jobPda,
        escrowVault,
        protocolConfig: protocolConfigPda,
        agentProfile: findAgentProfile(this.provider.wallet.publicKey)[0],
        poster: this.walletPublicKey,
      })
      .rpc();
  }

  async bidOnJob(
    jobPubkey: PublicKey,
    priceLamports: bigint,
    estimatedSeconds: number
  ): Promise<string> {
    const agentOwner = this.walletPublicKey;
    const [agentProfile] = findAgentProfile(agentOwner);
    const [bid] = findBid(jobPubkey, agentOwner);

    return this.program.methods
      .bidOnJob(new BN(priceLamports.toString()), estimatedSeconds)
      .accounts({ job: jobPubkey, bid, agentProfile, agentOwner })
      .rpc();
  }

  async assignAgent(jobPubkey: PublicKey, agentPubkey: PublicKey): Promise<string> {
    const [agentProfile] = findAgentProfile(agentPubkey);
    const [bid] = findBid(jobPubkey, agentPubkey);

    return this.program.methods
      .assignAgent(agentPubkey)
      .accounts({ job: jobPubkey, agentProfile, bid, poster: this.walletPublicKey })
      .rpc();
  }

  // ─── Shared Resolution ───────────────────────────────────────────────────────

  async submitResult(jobPubkey: PublicKey, resultHash: Uint8Array): Promise<string> {
    return this.program.methods
      .submitResult(Array.from(resultHash))
      .accounts({ job: jobPubkey, agentOwner: this.walletPublicKey })
      .rpc();
  }

  async approveJob(jobPubkey: PublicKey): Promise<string> {
    const job = await this.fetchJob(jobPubkey);
    const [agentProfile] = findAgentProfile(job.agent);
    const [escrowVault] = findEscrowVault(jobPubkey);
    const [protocolConfigPda] = findProtocolConfig();
    const [treasury] = findTreasury(protocolConfigPda);

    return this.program.methods
      .approveJob()
      .accounts({
        protocolConfig: protocolConfigPda,
        job: jobPubkey,
        escrowVault,
        agentProfile,
        agentOwner: job.agent,
        treasury,
        poster: this.walletPublicKey,
      })
      .rpc();
  }

  async disputeJob(jobPubkey: PublicKey): Promise<string> {
    const [protocolConfigPda] = findProtocolConfig();

    return this.program.methods
      .disputeJob()
      .accounts({
        protocolConfig: protocolConfigPda,
        job: jobPubkey,
        poster: this.walletPublicKey,
      })
      .rpc();
  }

  async resolveDispute(jobPubkey: PublicKey): Promise<string> {
    const job = await this.fetchJob(jobPubkey);
    const [agentProfile] = findAgentProfile(job.agent);
    const [stakeVault] = findStakeVault(agentProfile);
    const [escrowVault] = findEscrowVault(jobPubkey);
    const [protocolConfigPda] = findProtocolConfig();

    return this.program.methods
      .resolveDispute()
      .accounts({
        protocolConfig: protocolConfigPda,
        job: jobPubkey,
        escrowVault,
        agentProfile,
        stakeVault,
        poster: job.poster,
        caller: this.walletPublicKey,
      })
      .rpc();
  }

  async counterDispute(jobPubkey: PublicKey, evidenceHash: Uint8Array): Promise<string> {
    const [protocolConfigPda] = findProtocolConfig();

    return this.program.methods
      .counterDispute(Array.from(evidenceHash))
      .accounts({
        protocolConfig: protocolConfigPda,
        job: jobPubkey,
        agentOwner: this.walletPublicKey,
      })
      .rpc();
  }

  async claimTimeout(jobPubkey: PublicKey): Promise<string> {
    const job = await this.fetchJob(jobPubkey);
    const [agentProfile] = findAgentProfile(job.agent);
    const [stakeVault] = findStakeVault(agentProfile);
    const [escrowVault] = findEscrowVault(jobPubkey);
    const [protocolConfigPda] = findProtocolConfig();
    const [treasury] = findTreasury(protocolConfigPda);

    return this.program.methods
      .claimTimeout()
      .accounts({
        protocolConfig: protocolConfigPda,
        job: jobPubkey,
        escrowVault,
        agentProfile,
        stakeVault,
        agentOwner: job.agent,
        treasury,
        poster: job.poster,
        caller: this.walletPublicKey,
      })
      .rpc();
  }

  // ─── Admin ──────────────────────────────────────────────────────────────────

  async updateFee(newFeeBps: number): Promise<string> {
    const [protocolConfigPda] = findProtocolConfig();
    return this.program.methods
      .updateFee(newFeeBps)
      .accounts({ protocolConfig: protocolConfigPda, admin: this.walletPublicKey })
      .rpc();
  }

  async pauseProtocol(paused: boolean): Promise<string> {
    const [protocolConfigPda] = findProtocolConfig();
    return this.program.methods
      .pauseProtocol(paused)
      .accounts({ protocolConfig: protocolConfigPda, admin: this.walletPublicKey })
      .rpc();
  }

  async withdrawTreasury(amount: bigint, destination: PublicKey): Promise<string> {
    const [protocolConfigPda] = findProtocolConfig();
    const [treasury] = findTreasury(protocolConfigPda);
    return this.program.methods
      .withdrawTreasury(new BN(amount.toString()))
      .accounts({
        protocolConfig: protocolConfigPda,
        treasury,
        destination,
        admin: this.walletPublicKey,
      })
      .rpc();
  }

  async transferAdmin(newAdmin: PublicKey): Promise<string> {
    const [protocolConfigPda] = findProtocolConfig();
    return this.program.methods
      .transferAdmin(newAdmin)
      .accounts({ protocolConfig: protocolConfigPda, admin: this.walletPublicKey })
      .rpc();
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async getProtocolStats(): Promise<ProtocolConfig> {
    const [protocolConfigPda] = findProtocolConfig();
    const raw = await this.accounts.protocolConfig.fetch(protocolConfigPda);
    return {
      admin: raw.admin,
      totalAgents: BigInt(raw.totalAgents.toString()),
      totalJobs: BigInt(raw.totalJobs.toString()),
      totalVolume: BigInt(raw.totalVolume.toString()),
      platformFeeBps: raw.platformFeeBps,
      bump: raw.bump,
    };
  }

  async getAgent(owner: PublicKey): Promise<AgentProfile> {
    const [agentProfile] = findAgentProfile(owner);
    return this.fetchAgentProfile(agentProfile);
  }

  async getAllAgents(): Promise<AgentProfile[]> {
    const all = await this.accounts.agentProfile.all();
    return all.map(({ account }: { account: AccountNS }) =>
      this.mapAgentProfile(account)
    );
  }

  async getJob(jobIndex: bigint): Promise<Job> {
    const [jobPda] = findJob(jobIndex);
    return this.fetchJob(jobPda);
  }

  async getOpenJobs(): Promise<Job[]> {
    const all = await this.getAllJobs();
    return all.filter((j) => j.status === JobStatus.Open);
  }

  async getAllJobs(): Promise<Job[]> {
    const all = await this.accounts.job.all();
    return all.map(({ account }: { account: AccountNS }) => this.mapJob(account));
  }

  async getBidsForJob(jobPubkey: PublicKey): Promise<Bid[]> {
    const all = await this.accounts.bid.all([
      { memcmp: { offset: 8, bytes: jobPubkey.toBase58() } },
    ]);
    return all.map(({ account }: { account: AccountNS }) => this.mapBid(account));
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  private async fetchJob(jobPubkey: PublicKey): Promise<Job> {
    const raw = await this.accounts.job.fetch(jobPubkey);
    return this.mapJob(raw);
  }

  private async fetchAgentProfile(profilePda: PublicKey): Promise<AgentProfile> {
    const raw = await this.accounts.agentProfile.fetch(profilePda);
    return this.mapAgentProfile(raw);
  }

  private mapAgentProfile(raw: AccountNS): AgentProfile {
    return {
      owner: raw.owner,
      name: new Uint8Array(raw.name),
      metadataUri: new Uint8Array(raw.metadataUri),
      stake: BigInt(raw.stake.toString()),
      lockedStake: BigInt(raw.lockedStake.toString()),
      reputation: raw.reputation,
      completed: raw.completed,
      failed: raw.failed,
      consecutiveFails: raw.consecutiveFails,
      totalEarned: BigInt(raw.totalEarned.toString()),
      totalSlashed: BigInt(raw.totalSlashed.toString()),
      registeredAt: BigInt(raw.registeredAt.toString()),
      status: raw.status,
      bump: raw.bump,
    };
  }

  private mapJob(raw: AccountNS): Job {
    return {
      poster: raw.poster,
      agent: raw.agent,
      descriptionHash: new Uint8Array(raw.descriptionHash),
      reward: BigInt(raw.reward.toString()),
      collateral: BigInt(raw.collateral.toString()),
      deadline: BigInt(raw.deadline.toString()),
      mode: raw.mode,
      status: raw.status,
      resultHash: new Uint8Array(raw.resultHash),
      createdAt: BigInt(raw.createdAt.toString()),
      assignedAt: BigInt(raw.assignedAt.toString()),
      resolvedAt: BigInt(raw.resolvedAt.toString()),
      jobIndex: BigInt(raw.jobIndex.toString()),
      bump: raw.bump,
    };
  }

  private mapBid(raw: AccountNS): Bid {
    return {
      job: raw.job,
      agent: raw.agent,
      price: BigInt(raw.price.toString()),
      estimatedSeconds: raw.estimatedSeconds,
      createdAt: BigInt(raw.createdAt.toString()),
      bump: raw.bump,
    };
  }
}

export { PROGRAM_ID };
