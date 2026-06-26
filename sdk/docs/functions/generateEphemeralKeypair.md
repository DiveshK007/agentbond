[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / generateEphemeralKeypair

# Function: generateEphemeralKeypair()

> **generateEphemeralKeypair**(): `BoxKeyPair`

Defined in: [src/confidential.ts:25](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/confidential.ts#L25)

Generate a one-time keypair for ephemeral encryption.
The ephemeral public key is included in the payload so the
recipient can derive the shared secret.

## Returns

`BoxKeyPair`
