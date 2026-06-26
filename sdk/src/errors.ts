/**
 * AgentBond program error codes.
 *
 * Maps Anchor error codes to human-readable messages.
 * Error codes start at 6000 (Anchor custom error offset).
 */

export enum ErrorCode {
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
  InvalidFeeBps = 6023,
}

const ERROR_MESSAGES: Record<number, string> = {
  [ErrorCode.InvalidStakeAmount]: "Stake amount must be greater than zero",
  [ErrorCode.AgentSuspended]: "Agent is suspended and cannot perform this action",
  [ErrorCode.AgentNotActive]: "Agent is not in active status",
  [ErrorCode.InsufficientStake]: "Insufficient unlocked stake balance",
  [ErrorCode.StakeLocked]: "Stake is locked in active jobs and cannot be withdrawn",
  [ErrorCode.ServiceAlreadyExists]: "A service listing for this capability already exists",
  [ErrorCode.JobNotOpen]: "Job is not in Open status",
  [ErrorCode.JobNotAssigned]: "Job is not in Assigned status",
  [ErrorCode.JobNotSubmitted]: "Job has not been submitted yet",
  [ErrorCode.NotJobPoster]: "Caller is not the job poster",
  [ErrorCode.NotAssignedAgent]: "Caller is not the assigned agent",
  [ErrorCode.DeadlinePassed]: "Job deadline has already passed",
  [ErrorCode.DeadlineNotPassed]: "Job deadline has not passed yet",
  [ErrorCode.InvalidJobMode]: "Invalid job mode; must be 0 (Open) or 1 (Direct)",
  [ErrorCode.BidAlreadyExists]: "A bid already exists for this agent on this job",
  [ErrorCode.InsufficientReward]: "Reward must be greater than zero",
  [ErrorCode.Overflow]: "Arithmetic overflow in calculation",
  [ErrorCode.ProtocolPaused]: "Protocol is paused — new registrations and jobs are disabled",
  [ErrorCode.NotAdmin]: "Caller is not the protocol admin",
  [ErrorCode.AppealPeriodActive]: "Dispute appeal period has not expired yet",
  [ErrorCode.JobNotDisputed]: "Job is not in Disputed status",
  [ErrorCode.DeadlineOutOfRange]: "Deadline must be between 60 seconds and 30 days",
  [ErrorCode.BelowMinimumStake]: "Stake must meet the minimum threshold (0.01 SOL)",
  [ErrorCode.InvalidFeeBps]: "Fee must be between 0 and 1000 basis points (0–10%)",
};

export class AgentBondError extends Error {
  readonly code: ErrorCode;
  readonly errorName: string;

  constructor(code: ErrorCode) {
    const message = ERROR_MESSAGES[code] ?? `Unknown error (code ${code})`;
    super(message);
    this.name = "AgentBondError";
    this.code = code;
    this.errorName = ErrorCode[code] ?? "Unknown";
  }
}

/**
 * Parse an Anchor/Solana error into a typed AgentBondError.
 * Returns the original error if it can't be parsed.
 */
export function parseTransactionError(err: unknown): AgentBondError | Error {
  if (err instanceof Error) {
    // Anchor errors contain "Error Code: <Name>. Error Number: <Code>"
    const codeMatch = err.message.match(/Error Number: (\d+)/);
    if (codeMatch) {
      const code = parseInt(codeMatch[1], 10);
      if (code in ERROR_MESSAGES) {
        return new AgentBondError(code as ErrorCode);
      }
    }

    // Also check for hex error codes in logs: "Program log: Custom program error: 0x..."
    const hexMatch = err.message.match(/Custom program error: 0x([0-9a-fA-F]+)/);
    if (hexMatch) {
      const code = parseInt(hexMatch[1], 16);
      if (code in ERROR_MESSAGES) {
        return new AgentBondError(code as ErrorCode);
      }
    }
  }

  return err instanceof Error ? err : new Error(String(err));
}
