[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / parseTransactionError

# Function: parseTransactionError()

> **parseTransactionError**(`err`): `Error` \| [`AgentBondError`](../classes/AgentBondError.md)

Defined in: [src/errors.ts:79](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/errors.ts#L79)

Parse an Anchor/Solana error into a typed AgentBondError.
Returns the original error if it can't be parsed.

## Parameters

### err

`unknown`

## Returns

`Error` \| [`AgentBondError`](../classes/AgentBondError.md)
