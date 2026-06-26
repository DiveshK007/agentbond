[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / decryptForAgent

# Function: decryptForAgent()

> **decryptForAgent**(`payload`, `recipientSecretKey`): `string`

Defined in: [src/confidential.ts:70](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L70)

Decrypt an encrypted job payload using the agent's secret key.

## Parameters

### payload

[`EncryptedPayload`](../interfaces/EncryptedPayload.md)

The encrypted payload fetched from IPFS/Arweave

### recipientSecretKey

`Uint8Array`

The agent's X25519 secret key (32 bytes)

## Returns

`string`

The decrypted job description as a UTF-8 string
