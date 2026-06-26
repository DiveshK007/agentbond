[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / prepareBadgeMint

# Function: prepareBadgeMint()

> **prepareBadgeMint**(`tier`, `agentOwner`, `authority`): [`BadgeMintParams`](../interfaces/BadgeMintParams.md)

Defined in: [src/badges.ts:128](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/badges.ts#L128)

Generate the Metaplex Core create instruction for minting a badge NFT.

Uses Metaplex Core (lightweight NFTs without token accounts).
The badge is minted to the agent's wallet as a non-transferable credential.

Note: This generates the instruction data for the Metaplex Core program.
In production, you'd use @metaplex-foundation/mpl-core SDK.
For the hackathon, we prepare the metadata and return the mint params.

## Parameters

### tier

`"bronze"` \| `"silver"` \| `"gold"` \| `"diamond"`

### agentOwner

`PublicKey`

### authority

`PublicKey`

## Returns

[`BadgeMintParams`](../interfaces/BadgeMintParams.md)
