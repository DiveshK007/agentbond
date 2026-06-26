[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / registerAgentIdentity

# Function: registerAgentIdentity()

> **registerAgentIdentity**(`umi`, `metadata`): `Promise`\<[`AgentRegistrationResult`](../interfaces/AgentRegistrationResult.md)\>

Defined in: [src/metaplex-registry.ts:93](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/metaplex-registry.ts#L93)

Register an AgentBond bot as a Metaplex Agent.

Flow:
1. Mint a new MPL Core asset (the agent's identity NFT)
2. Call registerIdentityV1 to bind an Agent Identity to the asset
3. The agent now has a verifiable on-chain identity discoverable
   by any Metaplex-compatible tool

## Parameters

### umi

`Umi`

Configured Umi instance with keypair loaded

### metadata

[`AgentRegistrationMetadata`](../interfaces/AgentRegistrationMetadata.md)

Agent metadata to store at the registration URI

## Returns

`Promise`\<[`AgentRegistrationResult`](../interfaces/AgentRegistrationResult.md)\>

Registration result with asset address and identity PDA
