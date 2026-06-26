[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / encryptForAgent

# Function: encryptForAgent()

> **encryptForAgent**(`plaintext`, `recipientPublicKey`): [`EncryptedPayload`](../interfaces/EncryptedPayload.md)

Defined in: [src/confidential.ts:36](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L36)

Encrypt a message for a specific recipient's X25519 public key.

## Parameters

### plaintext

`string`

The job description to encrypt (UTF-8 string)

### recipientPublicKey

`Uint8Array`

The agent's X25519 public key (32 bytes)

## Returns

[`EncryptedPayload`](../interfaces/EncryptedPayload.md)

An object containing the encrypted payload ready for storage
