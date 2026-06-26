"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEphemeralKeypair = generateEphemeralKeypair;
exports.encryptForAgent = encryptForAgent;
exports.decryptForAgent = decryptForAgent;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const tweetnacl_util_1 = __importDefault(require("tweetnacl-util"));
/**
 * Generate a one-time keypair for ephemeral encryption.
 * The ephemeral public key is included in the payload so the
 * recipient can derive the shared secret.
 */
function generateEphemeralKeypair() {
    return tweetnacl_1.default.box.keyPair();
}
/**
 * Encrypt a message for a specific recipient's X25519 public key.
 *
 * @param plaintext - The job description to encrypt (UTF-8 string)
 * @param recipientPublicKey - The agent's X25519 public key (32 bytes)
 * @returns An object containing the encrypted payload ready for storage
 */
function encryptForAgent(plaintext, recipientPublicKey) {
    const ephemeral = generateEphemeralKeypair();
    const nonce = tweetnacl_1.default.randomBytes(tweetnacl_1.default.box.nonceLength);
    const messageBytes = tweetnacl_util_1.default.decodeUTF8(plaintext);
    const encrypted = tweetnacl_1.default.box(messageBytes, nonce, recipientPublicKey, ephemeral.secretKey);
    if (!encrypted) {
        throw new Error("Encryption failed");
    }
    return {
        version: 1,
        ephemeralPublicKey: tweetnacl_util_1.default.encodeBase64(ephemeral.publicKey),
        nonce: tweetnacl_util_1.default.encodeBase64(nonce),
        ciphertext: tweetnacl_util_1.default.encodeBase64(encrypted),
    };
}
/**
 * Decrypt an encrypted job payload using the agent's secret key.
 *
 * @param payload - The encrypted payload fetched from IPFS/Arweave
 * @param recipientSecretKey - The agent's X25519 secret key (32 bytes)
 * @returns The decrypted job description as a UTF-8 string
 */
function decryptForAgent(payload, recipientSecretKey) {
    const ephemeralPublicKey = tweetnacl_util_1.default.decodeBase64(payload.ephemeralPublicKey);
    const nonce = tweetnacl_util_1.default.decodeBase64(payload.nonce);
    const ciphertext = tweetnacl_util_1.default.decodeBase64(payload.ciphertext);
    const decrypted = tweetnacl_1.default.box.open(ciphertext, nonce, ephemeralPublicKey, recipientSecretKey);
    if (!decrypted) {
        throw new Error("Decryption failed — wrong key or corrupted payload");
    }
    return tweetnacl_util_1.default.encodeUTF8(decrypted);
}
//# sourceMappingURL=confidential.js.map