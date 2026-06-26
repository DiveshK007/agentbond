/**
 * Confidential Jobs — Off-chain encryption layer for AgentBond.
 *
 * When a user posts a confidential job, the description is encrypted
 * using the assigned agent's public key (X25519 via nacl box).
 * The on-chain `descriptionHash` stores the SHA-256 of the *encrypted*
 * payload, ensuring integrity without leaking contents.
 *
 * Flow:
 *   1. User encrypts description with agent's public key → ciphertext
 *   2. User uploads ciphertext to IPFS/Arweave → CID
 *   3. User posts job on-chain with hash(ciphertext) as descriptionHash
 *   4. Agent fetches ciphertext from CID, decrypts with their secret key
 *   5. Agent executes the job and submits result
 */
import nacl from "tweetnacl";
/**
 * Generate a one-time keypair for ephemeral encryption.
 * The ephemeral public key is included in the payload so the
 * recipient can derive the shared secret.
 */
export declare function generateEphemeralKeypair(): nacl.BoxKeyPair;
/**
 * Encrypt a message for a specific recipient's X25519 public key.
 *
 * @param plaintext - The job description to encrypt (UTF-8 string)
 * @param recipientPublicKey - The agent's X25519 public key (32 bytes)
 * @returns An object containing the encrypted payload ready for storage
 */
export declare function encryptForAgent(plaintext: string, recipientPublicKey: Uint8Array): EncryptedPayload;
/**
 * Decrypt an encrypted job payload using the agent's secret key.
 *
 * @param payload - The encrypted payload fetched from IPFS/Arweave
 * @param recipientSecretKey - The agent's X25519 secret key (32 bytes)
 * @returns The decrypted job description as a UTF-8 string
 */
export declare function decryptForAgent(payload: EncryptedPayload, recipientSecretKey: Uint8Array): string;
/**
 * The structure stored off-chain (IPFS / Arweave).
 * The on-chain descriptionHash = SHA-256(JSON.stringify(payload))
 */
export interface EncryptedPayload {
    /** Schema version for forward compatibility */
    version: number;
    /** Ephemeral public key used for this encryption (base64) */
    ephemeralPublicKey: string;
    /** Random nonce (base64) */
    nonce: string;
    /** Encrypted ciphertext (base64) */
    ciphertext: string;
}
//# sourceMappingURL=confidential.d.ts.map