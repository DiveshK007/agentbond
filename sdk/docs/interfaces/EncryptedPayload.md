[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / EncryptedPayload

# Interface: EncryptedPayload

Defined in: [src/confidential.ts:96](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L96)

The structure stored off-chain (IPFS / Arweave).
The on-chain descriptionHash = SHA-256(JSON.stringify(payload))

## Properties

### ciphertext

> **ciphertext**: `string`

Defined in: [src/confidential.ts:104](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L104)

Encrypted ciphertext (base64)

***

### ephemeralPublicKey

> **ephemeralPublicKey**: `string`

Defined in: [src/confidential.ts:100](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L100)

Ephemeral public key used for this encryption (base64)

***

### nonce

> **nonce**: `string`

Defined in: [src/confidential.ts:102](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L102)

Random nonce (base64)

***

### version

> **version**: `number`

Defined in: [src/confidential.ts:98](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L98)

Schema version for forward compatibility
