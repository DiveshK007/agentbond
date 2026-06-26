[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / AgentBondClient

# Class: AgentBondClient

Defined in: [src/client.ts:65](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L65)

## Constructors

### Constructor

> **new AgentBondClient**(`connection`, `wallet`): `AgentBondClient`

Defined in: [src/client.ts:69](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L69)

#### Parameters

##### connection

`Connection`

##### wallet

`Wallet`

#### Returns

`AgentBondClient`

## Properties

### program

> `readonly` **program**: `AnyProgram`

Defined in: [src/client.ts:66](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L66)

***

### provider

> `readonly` **provider**: `AnchorProvider`

Defined in: [src/client.ts:67](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L67)

## Accessors

### walletPublicKey

#### Get Signature

> **get** **walletPublicKey**(): `PublicKey`

Defined in: [src/client.ts:77](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L77)

##### Returns

`PublicKey`

## Methods

### approveJob()

> **approveJob**(`jobPubkey`): `Promise`\<`string`\>

Defined in: [src/client.ts:242](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L242)

#### Parameters

##### jobPubkey

`PublicKey`

#### Returns

`Promise`\<`string`\>

***

### assignAgent()

> **assignAgent**(`jobPubkey`, `agentPubkey`): `Promise`\<`string`\>

Defined in: [src/client.ts:223](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L223)

#### Parameters

##### jobPubkey

`PublicKey`

##### agentPubkey

`PublicKey`

#### Returns

`Promise`\<`string`\>

***

### bidOnJob()

> **bidOnJob**(`jobPubkey`, `priceLamports`, `estimatedSeconds`): `Promise`\<`string`\>

Defined in: [src/client.ts:208](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L208)

#### Parameters

##### jobPubkey

`PublicKey`

##### priceLamports

`bigint`

##### estimatedSeconds

`number`

#### Returns

`Promise`\<`string`\>

***

### claimTimeout()

> **claimTimeout**(`jobPubkey`): `Promise`\<`string`\>

Defined in: [src/client.ts:315](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L315)

#### Parameters

##### jobPubkey

`PublicKey`

#### Returns

`Promise`\<`string`\>

***

### counterDispute()

> **counterDispute**(`jobPubkey`, `evidenceHash`): `Promise`\<`string`\>

Defined in: [src/client.ts:302](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L302)

#### Parameters

##### jobPubkey

`PublicKey`

##### evidenceHash

`Uint8Array`

#### Returns

`Promise`\<`string`\>

***

### deregisterAgent()

> **deregisterAgent**(): `Promise`\<`string`\>

Defined in: [src/client.ts:128](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L128)

#### Returns

`Promise`\<`string`\>

***

### disputeJob()

> **disputeJob**(`jobPubkey`): `Promise`\<`string`\>

Defined in: [src/client.ts:263](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L263)

#### Parameters

##### jobPubkey

`PublicKey`

#### Returns

`Promise`\<`string`\>

***

### getAgent()

> **getAgent**(`owner`): `Promise`\<[`AgentProfile`](../interfaces/AgentProfile.md)\>

Defined in: [src/client.ts:394](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L394)

#### Parameters

##### owner

`PublicKey`

#### Returns

`Promise`\<[`AgentProfile`](../interfaces/AgentProfile.md)\>

***

### getAllAgents()

> **getAllAgents**(): `Promise`\<[`AgentProfile`](../interfaces/AgentProfile.md)[]\>

Defined in: [src/client.ts:399](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L399)

#### Returns

`Promise`\<[`AgentProfile`](../interfaces/AgentProfile.md)[]\>

***

### getAllJobs()

> **getAllJobs**(): `Promise`\<[`Job`](../interfaces/Job.md)[]\>

Defined in: [src/client.ts:416](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L416)

#### Returns

`Promise`\<[`Job`](../interfaces/Job.md)[]\>

***

### getBidsForJob()

> **getBidsForJob**(`jobPubkey`): `Promise`\<[`Bid`](../interfaces/Bid.md)[]\>

Defined in: [src/client.ts:421](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L421)

#### Parameters

##### jobPubkey

`PublicKey`

#### Returns

`Promise`\<[`Bid`](../interfaces/Bid.md)[]\>

***

### getJob()

> **getJob**(`jobIndex`): `Promise`\<[`Job`](../interfaces/Job.md)\>

Defined in: [src/client.ts:406](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L406)

#### Parameters

##### jobIndex

`bigint`

#### Returns

`Promise`\<[`Job`](../interfaces/Job.md)\>

***

### getOpenJobs()

> **getOpenJobs**(): `Promise`\<[`Job`](../interfaces/Job.md)[]\>

Defined in: [src/client.ts:411](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L411)

#### Returns

`Promise`\<[`Job`](../interfaces/Job.md)[]\>

***

### getProtocolStats()

> **getProtocolStats**(): `Promise`\<[`ProtocolConfig`](../interfaces/ProtocolConfig.md)\>

Defined in: [src/client.ts:381](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L381)

#### Returns

`Promise`\<[`ProtocolConfig`](../interfaces/ProtocolConfig.md)\>

***

### instantHire()

> **instantHire**(`agentPubkey`, `descriptionHash`, `rewardLamports`, `deadlineSeconds`): `Promise`\<`string`\>

Defined in: [src/client.ts:142](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L142)

#### Parameters

##### agentPubkey

`PublicKey`

##### descriptionHash

`Uint8Array`

##### rewardLamports

`bigint`

##### deadlineSeconds

`bigint`

#### Returns

`Promise`\<`string`\>

***

### listService()

> **listService**(`capability`, `priceLamports`): `Promise`\<`string`\>

Defined in: [src/client.ts:117](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L117)

#### Parameters

##### capability

`string`

##### priceLamports

`bigint`

#### Returns

`Promise`\<`string`\>

***

### pauseProtocol()

> **pauseProtocol**(`paused`): `Promise`\<`string`\>

Defined in: [src/client.ts:349](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L349)

#### Parameters

##### paused

`boolean`

#### Returns

`Promise`\<`string`\>

***

### postJob()

> **postJob**(`descriptionHash`, `rewardLamports`, `deadlineSeconds`): `Promise`\<`string`\>

Defined in: [src/client.ts:177](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L177)

#### Parameters

##### descriptionHash

`Uint8Array`

##### rewardLamports

`bigint`

##### deadlineSeconds

`bigint`

#### Returns

`Promise`\<`string`\>

***

### registerAgent()

> **registerAgent**(`name`, `metadataUri`, `stakeLamports`): `Promise`\<`string`\>

Defined in: [src/client.ts:87](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L87)

#### Parameters

##### name

`string`

##### metadataUri

`string`

##### stakeLamports

`bigint`

#### Returns

`Promise`\<`string`\>

***

### resolveDispute()

> **resolveDispute**(`jobPubkey`, `agentWins?`): `Promise`\<`string`\>

Defined in: [src/client.ts:278](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L278)

#### Parameters

##### jobPubkey

`PublicKey`

##### agentWins?

`boolean` = `false`

#### Returns

`Promise`\<`string`\>

***

### submitResult()

> **submitResult**(`jobPubkey`, `resultHash`): `Promise`\<`string`\>

Defined in: [src/client.ts:235](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L235)

#### Parameters

##### jobPubkey

`PublicKey`

##### resultHash

`Uint8Array`

#### Returns

`Promise`\<`string`\>

***

### transferAdmin()

> **transferAdmin**(`newAdmin`): `Promise`\<`string`\>

Defined in: [src/client.ts:371](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L371)

#### Parameters

##### newAdmin

`PublicKey`

#### Returns

`Promise`\<`string`\>

***

### updateFee()

> **updateFee**(`newFeeBps`): `Promise`\<`string`\>

Defined in: [src/client.ts:341](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L341)

#### Parameters

##### newFeeBps

`number`

#### Returns

`Promise`\<`string`\>

***

### updateStake()

> **updateStake**(`deposit?`, `withdraw?`): `Promise`\<`string`\>

Defined in: [src/client.ts:103](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L103)

#### Parameters

##### deposit?

`bigint`

##### withdraw?

`bigint`

#### Returns

`Promise`\<`string`\>

***

### withdrawTreasury()

> **withdrawTreasury**(`amount`, `destination`): `Promise`\<`string`\>

Defined in: [src/client.ts:357](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/client.ts#L357)

#### Parameters

##### amount

`bigint`

##### destination

`PublicKey`

#### Returns

`Promise`\<`string`\>
