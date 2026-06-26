"use strict";
/**
 * AgentBond program error codes.
 *
 * Maps Anchor error codes to human-readable messages.
 * Error codes start at 6000 (Anchor custom error offset).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBondError = exports.ErrorCode = void 0;
exports.parseTransactionError = parseTransactionError;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["InvalidStakeAmount"] = 6000] = "InvalidStakeAmount";
    ErrorCode[ErrorCode["AgentSuspended"] = 6001] = "AgentSuspended";
    ErrorCode[ErrorCode["AgentNotActive"] = 6002] = "AgentNotActive";
    ErrorCode[ErrorCode["InsufficientStake"] = 6003] = "InsufficientStake";
    ErrorCode[ErrorCode["StakeLocked"] = 6004] = "StakeLocked";
    ErrorCode[ErrorCode["ServiceAlreadyExists"] = 6005] = "ServiceAlreadyExists";
    ErrorCode[ErrorCode["JobNotOpen"] = 6006] = "JobNotOpen";
    ErrorCode[ErrorCode["JobNotAssigned"] = 6007] = "JobNotAssigned";
    ErrorCode[ErrorCode["JobNotSubmitted"] = 6008] = "JobNotSubmitted";
    ErrorCode[ErrorCode["NotJobPoster"] = 6009] = "NotJobPoster";
    ErrorCode[ErrorCode["NotAssignedAgent"] = 6010] = "NotAssignedAgent";
    ErrorCode[ErrorCode["DeadlinePassed"] = 6011] = "DeadlinePassed";
    ErrorCode[ErrorCode["DeadlineNotPassed"] = 6012] = "DeadlineNotPassed";
    ErrorCode[ErrorCode["InvalidJobMode"] = 6013] = "InvalidJobMode";
    ErrorCode[ErrorCode["BidAlreadyExists"] = 6014] = "BidAlreadyExists";
    ErrorCode[ErrorCode["InsufficientReward"] = 6015] = "InsufficientReward";
    ErrorCode[ErrorCode["Overflow"] = 6016] = "Overflow";
    ErrorCode[ErrorCode["ProtocolPaused"] = 6017] = "ProtocolPaused";
    ErrorCode[ErrorCode["NotAdmin"] = 6018] = "NotAdmin";
    ErrorCode[ErrorCode["AppealPeriodActive"] = 6019] = "AppealPeriodActive";
    ErrorCode[ErrorCode["JobNotDisputed"] = 6020] = "JobNotDisputed";
    ErrorCode[ErrorCode["DeadlineOutOfRange"] = 6021] = "DeadlineOutOfRange";
    ErrorCode[ErrorCode["BelowMinimumStake"] = 6022] = "BelowMinimumStake";
    ErrorCode[ErrorCode["InvalidFeeBps"] = 6023] = "InvalidFeeBps";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
const ERROR_MESSAGES = {
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
class AgentBondError extends Error {
    constructor(code) {
        const message = ERROR_MESSAGES[code] ?? `Unknown error (code ${code})`;
        super(message);
        this.name = "AgentBondError";
        this.code = code;
        this.errorName = ErrorCode[code] ?? "Unknown";
    }
}
exports.AgentBondError = AgentBondError;
/**
 * Parse an Anchor/Solana error into a typed AgentBondError.
 * Returns the original error if it can't be parsed.
 */
function parseTransactionError(err) {
    if (err instanceof Error) {
        // Anchor errors contain "Error Code: <Name>. Error Number: <Code>"
        const codeMatch = err.message.match(/Error Number: (\d+)/);
        if (codeMatch) {
            const code = parseInt(codeMatch[1], 10);
            if (code in ERROR_MESSAGES) {
                return new AgentBondError(code);
            }
        }
        // Also check for hex error codes in logs: "Program log: Custom program error: 0x..."
        const hexMatch = err.message.match(/Custom program error: 0x([0-9a-fA-F]+)/);
        if (hexMatch) {
            const code = parseInt(hexMatch[1], 16);
            if (code in ERROR_MESSAGES) {
                return new AgentBondError(code);
            }
        }
    }
    return err instanceof Error ? err : new Error(String(err));
}
//# sourceMappingURL=errors.js.map