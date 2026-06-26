"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROGRAM_ID = exports.AgentBondClient = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const idl_1 = require("./idl");
const types_1 = require("./types");
const utils_1 = require("./utils");
Object.defineProperty(exports, "PROGRAM_ID", { enumerable: true, get: function () { return utils_1.PROGRAM_ID; } });
class RetryingProvider extends anchor_1.AnchorProvider {
    constructor() {
        super(...arguments);
        this.maxRetries = 3;
    }
    async sendAndConfirm(tx, signers, opts) {
        let attempts = 0;
        while (attempts < this.maxRetries) {
            try {
                return await super.sendAndConfirm(tx, signers, opts);
            }
            catch (err) {
                attempts++;
                if (attempts >= this.maxRetries)
                    throw err;
                console.warn(`[AgentBondClient] Transaction failed, retrying (${attempts}/${this.maxRetries})...`, err);
                await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
            }
        }
        throw new Error("Unreachable");
    }
}
class AgentBondClient {
    constructor(connection, wallet) {
        this.provider = new RetryingProvider(connection, wallet, {
            commitment: "confirmed",
        });
        (0, anchor_1.setProvider)(this.provider);
        this.program = new anchor_1.Program(idl_1.IDL, this.provider);
    }
    get walletPublicKey() {
        return this.provider.wallet.publicKey;
    }
    get accounts() {
        return this.program.account;
    }
    // ─── Agent Ops ───────────────────────────────────────────────────────────────
    async registerAgent(name, metadataUri, stakeLamports) {
        const owner = this.walletPublicKey;
        const [agentProfile] = (0, utils_1.findAgentProfile)(owner);
        const [stakeVault] = (0, utils_1.findStakeVault)(agentProfile);
        const [protocolConfig] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .registerAgent(name, metadataUri, new anchor_1.BN(stakeLamports.toString()))
            .accounts({ agentProfile, stakeVault, protocolConfig, owner })
            .rpc();
    }
    async updateStake(deposit, withdraw) {
        const owner = this.walletPublicKey;
        const [agentProfile] = (0, utils_1.findAgentProfile)(owner);
        const [stakeVault] = (0, utils_1.findStakeVault)(agentProfile);
        return this.program.methods
            .updateStake(deposit != null ? new anchor_1.BN(deposit.toString()) : null, withdraw != null ? new anchor_1.BN(withdraw.toString()) : null)
            .accounts({ agentProfile, stakeVault, owner })
            .rpc();
    }
    async listService(capability, priceLamports) {
        const owner = this.walletPublicKey;
        const [agentProfile] = (0, utils_1.findAgentProfile)(owner);
        const [serviceListing] = (0, utils_1.findServiceListing)(agentProfile, capability);
        return this.program.methods
            .listService(capability, new anchor_1.BN(priceLamports.toString()))
            .accounts({ serviceListing, agentProfile, owner })
            .rpc();
    }
    async deregisterAgent() {
        const owner = this.walletPublicKey;
        const [agentProfile] = (0, utils_1.findAgentProfile)(owner);
        const [stakeVault] = (0, utils_1.findStakeVault)(agentProfile);
        const [protocolConfig] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .deregisterAgent()
            .accounts({ agentProfile, stakeVault, protocolConfig, owner })
            .rpc();
    }
    // ─── Instant Hire ────────────────────────────────────────────────────────────
    async instantHire(agentPubkey, descriptionHash, rewardLamports, deadlineSeconds) {
        const protocolConfig = await this.getProtocolStats();
        const jobIndex = protocolConfig.totalJobs;
        const [agentProfile] = (0, utils_1.findAgentProfile)(agentPubkey);
        const [jobPda] = (0, utils_1.findJob)(jobIndex);
        const [escrowVault] = (0, utils_1.findEscrowVault)(jobPda);
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .createJob(new anchor_1.BN(jobIndex.toString()), Array.from(descriptionHash), new anchor_1.BN(rewardLamports.toString()), new anchor_1.BN(deadlineSeconds.toString()), 1, agentPubkey)
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
    async postJob(descriptionHash, rewardLamports, deadlineSeconds) {
        const protocolConfig = await this.getProtocolStats();
        const jobIndex = protocolConfig.totalJobs;
        const [jobPda] = (0, utils_1.findJob)(jobIndex);
        const [escrowVault] = (0, utils_1.findEscrowVault)(jobPda);
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .createJob(new anchor_1.BN(jobIndex.toString()), Array.from(descriptionHash), new anchor_1.BN(rewardLamports.toString()), new anchor_1.BN(deadlineSeconds.toString()), 0, null)
            .accounts({
            job: jobPda,
            escrowVault,
            protocolConfig: protocolConfigPda,
            agentProfile: (0, utils_1.findAgentProfile)(this.provider.wallet.publicKey)[0],
            poster: this.walletPublicKey,
        })
            .rpc();
    }
    async bidOnJob(jobPubkey, priceLamports, estimatedSeconds) {
        const agentOwner = this.walletPublicKey;
        const [agentProfile] = (0, utils_1.findAgentProfile)(agentOwner);
        const [bid] = (0, utils_1.findBid)(jobPubkey, agentOwner);
        return this.program.methods
            .bidOnJob(new anchor_1.BN(priceLamports.toString()), estimatedSeconds)
            .accounts({ job: jobPubkey, bid, agentProfile, agentOwner })
            .rpc();
    }
    async assignAgent(jobPubkey, agentPubkey) {
        const [agentProfile] = (0, utils_1.findAgentProfile)(agentPubkey);
        const [bid] = (0, utils_1.findBid)(jobPubkey, agentPubkey);
        return this.program.methods
            .assignAgent(agentPubkey)
            .accounts({ job: jobPubkey, agentProfile, bid, poster: this.walletPublicKey })
            .rpc();
    }
    // ─── Shared Resolution ───────────────────────────────────────────────────────
    async submitResult(jobPubkey, resultHash) {
        return this.program.methods
            .submitResult(Array.from(resultHash))
            .accounts({ job: jobPubkey, agentOwner: this.walletPublicKey })
            .rpc();
    }
    async approveJob(jobPubkey) {
        const job = await this.fetchJob(jobPubkey);
        const [agentProfile] = (0, utils_1.findAgentProfile)(job.agent);
        const [escrowVault] = (0, utils_1.findEscrowVault)(jobPubkey);
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        const [treasury] = (0, utils_1.findTreasury)(protocolConfigPda);
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
    async disputeJob(jobPubkey) {
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        const [escrowVault] = (0, utils_1.findEscrowVault)(jobPubkey);
        return this.program.methods
            .disputeJob()
            .accounts({
            protocolConfig: protocolConfigPda,
            job: jobPubkey,
            escrowVault,
            poster: this.walletPublicKey,
        })
            .rpc();
    }
    async resolveDispute(jobPubkey, agentWins = false) {
        const job = await this.fetchJob(jobPubkey);
        const [agentProfile] = (0, utils_1.findAgentProfile)(job.agent);
        const [stakeVault] = (0, utils_1.findStakeVault)(agentProfile);
        const [escrowVault] = (0, utils_1.findEscrowVault)(jobPubkey);
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        const [treasury] = (0, utils_1.findTreasury)(protocolConfigPda);
        return this.program.methods
            .resolveDispute(agentWins)
            .accounts({
            protocolConfig: protocolConfigPda,
            job: jobPubkey,
            escrowVault,
            agentProfile,
            stakeVault,
            treasury,
            agentOwner: job.agent,
            poster: job.poster,
            caller: this.walletPublicKey,
        })
            .rpc();
    }
    async counterDispute(jobPubkey, evidenceHash) {
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .counterDispute(Array.from(evidenceHash))
            .accounts({
            protocolConfig: protocolConfigPda,
            job: jobPubkey,
            agentOwner: this.walletPublicKey,
        })
            .rpc();
    }
    async claimTimeout(jobPubkey) {
        const job = await this.fetchJob(jobPubkey);
        const [agentProfile] = (0, utils_1.findAgentProfile)(job.agent);
        const [stakeVault] = (0, utils_1.findStakeVault)(agentProfile);
        const [escrowVault] = (0, utils_1.findEscrowVault)(jobPubkey);
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        const [treasury] = (0, utils_1.findTreasury)(protocolConfigPda);
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
    async updateFee(newFeeBps) {
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .updateFee(newFeeBps)
            .accounts({ protocolConfig: protocolConfigPda, admin: this.walletPublicKey })
            .rpc();
    }
    async pauseProtocol(paused) {
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .pauseProtocol(paused)
            .accounts({ protocolConfig: protocolConfigPda, admin: this.walletPublicKey })
            .rpc();
    }
    async withdrawTreasury(amount, destination) {
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        const [treasury] = (0, utils_1.findTreasury)(protocolConfigPda);
        return this.program.methods
            .withdrawTreasury(new anchor_1.BN(amount.toString()))
            .accounts({
            protocolConfig: protocolConfigPda,
            treasury,
            destination,
            admin: this.walletPublicKey,
        })
            .rpc();
    }
    async transferAdmin(newAdmin) {
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
        return this.program.methods
            .transferAdmin(newAdmin)
            .accounts({ protocolConfig: protocolConfigPda, admin: this.walletPublicKey })
            .rpc();
    }
    // ─── Queries ─────────────────────────────────────────────────────────────────
    async getProtocolStats() {
        const [protocolConfigPda] = (0, utils_1.findProtocolConfig)();
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
    async getAgent(owner) {
        const [agentProfile] = (0, utils_1.findAgentProfile)(owner);
        return this.fetchAgentProfile(agentProfile);
    }
    async getAllAgents() {
        const all = await this.accounts.agentProfile.all();
        return all.map(({ account }) => this.mapAgentProfile(account));
    }
    async getJob(jobIndex) {
        const [jobPda] = (0, utils_1.findJob)(jobIndex);
        return this.fetchJob(jobPda);
    }
    async getOpenJobs() {
        const all = await this.getAllJobs();
        return all.filter((j) => j.status === types_1.JobStatus.Open);
    }
    async getAllJobs() {
        const all = await this.accounts.job.all();
        return all.map(({ account }) => this.mapJob(account));
    }
    async getBidsForJob(jobPubkey) {
        const all = await this.accounts.bid.all([
            { memcmp: { offset: 8, bytes: jobPubkey.toBase58() } },
        ]);
        return all.map(({ account }) => this.mapBid(account));
    }
    // ─── Internal helpers ────────────────────────────────────────────────────────
    async fetchJob(jobPubkey) {
        const raw = await this.accounts.job.fetch(jobPubkey);
        return this.mapJob(raw);
    }
    async fetchAgentProfile(profilePda) {
        const raw = await this.accounts.agentProfile.fetch(profilePda);
        return this.mapAgentProfile(raw);
    }
    mapAgentProfile(raw) {
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
    mapJob(raw) {
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
    mapBid(raw) {
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
exports.AgentBondClient = AgentBondClient;
//# sourceMappingURL=client.js.map