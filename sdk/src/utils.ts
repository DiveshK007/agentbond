import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3");

export function findProtocolConfig(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("protocol")],
    PROGRAM_ID
  );
}

export function findAgentProfile(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent"), owner.toBuffer()],
    PROGRAM_ID
  );
}

export function findStakeVault(agentProfile: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stake_vault"), agentProfile.toBuffer()],
    PROGRAM_ID
  );
}

export function findServiceListing(
  agentProfile: PublicKey,
  capability: string
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("service"), agentProfile.toBuffer(), Buffer.from(capability)],
    PROGRAM_ID
  );
}

export function findJob(jobIndex: bigint): [PublicKey, number] {
  const indexBuf = Buffer.alloc(8);
  indexBuf.writeBigUInt64LE(jobIndex);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("job"), indexBuf],
    PROGRAM_ID
  );
}

export function findEscrowVault(job: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), job.toBuffer()],
    PROGRAM_ID
  );
}

export function findTreasury(protocolConfig: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), protocolConfig.toBuffer()],
    PROGRAM_ID
  );
}

export function findBid(job: PublicKey, agentOwner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bid"), job.toBuffer(), agentOwner.toBuffer()],
    PROGRAM_ID
  );
}

export function nameToBytes(name: string): number[] {
  const bytes = new Uint8Array(32);
  const encoded = Buffer.from(name, "utf8").slice(0, 32);
  bytes.set(encoded);
  return Array.from(bytes);
}

export function bytesToString(bytes: Uint8Array): string {
  const end = bytes.indexOf(0);
  return Buffer.from(end === -1 ? bytes : bytes.slice(0, end)).toString("utf8");
}
