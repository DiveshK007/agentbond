import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AgentBond } from "../target/types/agent_bond";
import { expect } from "chai";

describe("agent_bond", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AgentBond as Program<AgentBond>;
  const admin = provider.wallet;

  // PDAs
  const [protocolConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("protocol")],
    program.programId
  );
  const [treasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), protocolConfig.toBuffer()],
    program.programId
  );

  it("Initializes the protocol", async () => {
    const tx = await program.methods
      .initializeProtocol()
      .accounts({
        protocolConfig,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Initialize tx:", tx);

    const config = await program.account.protocolConfig.fetch(protocolConfig);
    expect(config.admin.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(config.totalAgents.toNumber()).to.equal(0);
    expect(config.totalJobs.toNumber()).to.equal(0);
  });

  it("Registers an agent with stake", async () => {
    const agentOwner = provider.wallet;
    const [agentProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agentOwner.publicKey.toBuffer()],
      program.programId
    );
    const [stakeVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake_vault"), agentProfile.toBuffer()],
      program.programId
    );

    const stakeAmount = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL

    const tx = await program.methods
      .registerAgent("TestBot", "https://agentbond.demo/test", stakeAmount)
      .accounts({
        agentProfile,
        stakeVault,
        protocolConfig,
        owner: agentOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Register agent tx:", tx);

    const agent = await program.account.agentProfile.fetch(agentProfile);
    expect(agent.stake.toNumber()).to.equal(LAMPORTS_PER_SOL);
    expect(agent.reputation).to.equal(5000);
    expect(agent.completed).to.equal(0);
    expect(agent.failed).to.equal(0);
    expect(agent.status).to.equal(0);

    const config = await program.account.protocolConfig.fetch(protocolConfig);
    expect(config.totalAgents.toNumber()).to.equal(1);
  });

  it("Lists a service", async () => {
    const agentOwner = provider.wallet;
    const [agentProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agentOwner.publicKey.toBuffer()],
      program.programId
    );
    const capability = "fetch_sol_price";
    const [serviceListing] = PublicKey.findProgramAddressSync(
      [Buffer.from("service"), agentProfile.toBuffer(), Buffer.from(capability)],
      program.programId
    );

    const tx = await program.methods
      .listService(capability, new anchor.BN(10_000))
      .accounts({
        serviceListing,
        agentProfile,
        owner: agentOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("List service tx:", tx);

    const service = await program.account.serviceListing.fetch(serviceListing);
    expect(service.price.toNumber()).to.equal(10_000);
    expect(service.isActive).to.equal(true);
    expect(service.totalCalls.toNumber()).to.equal(0);
  });

  it("Creates an open job with escrow", async () => {
    const poster = provider.wallet;
    const [agentProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), poster.publicKey.toBuffer()],
      program.programId
    );
    const config = await program.account.protocolConfig.fetch(protocolConfig);
    const jobIndex = config.totalJobs;

    const [jobPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("job"), jobIndex.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const [escrowVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), jobPda.toBuffer()],
      program.programId
    );

    const reward = new anchor.BN(LAMPORTS_PER_SOL / 10); // 0.1 SOL
    const descHash = Buffer.alloc(32);
    descHash.write("test-job-description-hash-001234");

    const tx = await program.methods
      .createJob(
        jobIndex,
        Array.from(descHash),
        reward,
        new anchor.BN(3600),
        0, // Open mode
        null
      )
      .accounts({
        job: jobPda,
        escrowVault,
        protocolConfig,
        agentProfile,
        poster: poster.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Create job tx:", tx);

    const job = await program.account.job.fetch(jobPda);
    expect(job.status).to.equal(0); // Open
    expect(job.reward.toNumber()).to.equal(LAMPORTS_PER_SOL / 10);
    expect(job.mode).to.equal(0);

    const updatedConfig = await program.account.protocolConfig.fetch(protocolConfig);
    expect(updatedConfig.totalJobs.toNumber()).to.equal(jobIndex.toNumber() + 1);
  });

  it("Agent bids on the open job", async () => {
    const agentOwner = provider.wallet;
    const [agentProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agentOwner.publicKey.toBuffer()],
      program.programId
    );

    const config = await program.account.protocolConfig.fetch(protocolConfig);
    const jobIndex = new anchor.BN(config.totalJobs.toNumber() - 1);

    const [jobPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("job"), jobIndex.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const [bid] = PublicKey.findProgramAddressSync(
      [Buffer.from("bid"), jobPda.toBuffer(), agentOwner.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .bidOnJob(new anchor.BN(50_000), 3600)
      .accounts({
        job: jobPda,
        bid,
        agentProfile,
        agentOwner: agentOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Bid tx:", tx);

    const bidAccount = await program.account.bid.fetch(bid);
    expect(bidAccount.price.toNumber()).to.equal(50_000);
    expect(bidAccount.estimatedSeconds).to.equal(3600);
  });
});
