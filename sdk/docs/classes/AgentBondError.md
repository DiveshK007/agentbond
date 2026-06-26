[**AgentBond SDK**](../README.md)

***

[AgentBond SDK](../README.md) / AgentBondError

# Class: AgentBondError

Defined in: [src/errors.ts:62](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/errors.ts#L62)

## Extends

- `Error`

## Constructors

### Constructor

> **new AgentBondError**(`code`): `AgentBondError`

Defined in: [src/errors.ts:66](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/errors.ts#L66)

#### Parameters

##### code

[`ErrorCode`](../enumerations/ErrorCode.md)

#### Returns

`AgentBondError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: [`ErrorCode`](../enumerations/ErrorCode.md)

Defined in: [src/errors.ts:63](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/errors.ts#L63)

***

### errorName

> `readonly` **errorName**: `string`

Defined in: [src/errors.ts:64](https://github.com/DiveshK007/agentbond/blob/440af4afd34d76dbee18ceb39e4d29c7f936bde0/sdk/src/errors.ts#L64)

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.name`

***

### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`

***

### prepareStackTrace?

> `static` `optional` **prepareStackTrace?**: (`err`, `stackTraces`) => `any`

Defined in: node\_modules/@types/node/globals.d.ts:140

Optional override for formatting stack traces

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://github.com/v8/v8/wiki/Stack%20Trace%20API#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node\_modules/@types/node/globals.d.ts:142

#### Inherited from

`Error.stackTraceLimit`

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: node\_modules/@types/node/globals.d.ts:133

Create .stack property on a target object

#### Parameters

##### targetObject

`Object`

##### constructorOpt?

`Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`
