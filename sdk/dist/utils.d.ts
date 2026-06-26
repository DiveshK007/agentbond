import { PublicKey } from "@solana/web3.js";
export declare const PROGRAM_ID: PublicKey;
export declare function findProtocolConfig(): [PublicKey, number];
export declare function findAgentProfile(owner: PublicKey): [PublicKey, number];
export declare function findStakeVault(agentProfile: PublicKey): [PublicKey, number];
export declare function findServiceListing(agentProfile: PublicKey, capability: string): [PublicKey, number];
export declare function findJob(jobIndex: bigint): [PublicKey, number];
export declare function findEscrowVault(job: PublicKey): [PublicKey, number];
export declare function findTreasury(protocolConfig: PublicKey): [PublicKey, number];
export declare function findBid(job: PublicKey, agentOwner: PublicKey): [PublicKey, number];
export declare function nameToBytes(name: string): number[];
export declare function bytesToString(bytes: Uint8Array): string;
//# sourceMappingURL=utils.d.ts.map