/**
 * AgentBond program error codes.
 *
 * Maps Anchor error codes to human-readable messages.
 * Error codes start at 6000 (Anchor custom error offset).
 */
export declare enum ErrorCode {
    InvalidStakeAmount = 6000,
    AgentSuspended = 6001,
    AgentNotActive = 6002,
    InsufficientStake = 6003,
    StakeLocked = 6004,
    ServiceAlreadyExists = 6005,
    JobNotOpen = 6006,
    JobNotAssigned = 6007,
    JobNotSubmitted = 6008,
    NotJobPoster = 6009,
    NotAssignedAgent = 6010,
    DeadlinePassed = 6011,
    DeadlineNotPassed = 6012,
    InvalidJobMode = 6013,
    BidAlreadyExists = 6014,
    InsufficientReward = 6015,
    Overflow = 6016,
    ProtocolPaused = 6017,
    NotAdmin = 6018,
    AppealPeriodActive = 6019,
    JobNotDisputed = 6020,
    DeadlineOutOfRange = 6021,
    BelowMinimumStake = 6022,
    InvalidFeeBps = 6023
}
export declare class AgentBondError extends Error {
    readonly code: ErrorCode;
    readonly errorName: string;
    constructor(code: ErrorCode);
}
/**
 * Parse an Anchor/Solana error into a typed AgentBondError.
 * Returns the original error if it can't be parsed.
 */
export declare function parseTransactionError(err: unknown): AgentBondError | Error;
//# sourceMappingURL=errors.d.ts.map