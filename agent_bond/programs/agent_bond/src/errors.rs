use anchor_lang::prelude::*;

#[error_code]
pub enum AgentBondError {
    #[msg("Stake amount must be greater than zero")]
    InvalidStakeAmount,
    #[msg("Agent is suspended and cannot perform this action")]
    AgentSuspended,
    #[msg("Agent is not in active status")]
    AgentNotActive,
    #[msg("Insufficient unlocked stake balance")]
    InsufficientStake,
    #[msg("Stake is locked in active jobs and cannot be withdrawn")]
    StakeLocked,
    #[msg("A service listing for this capability already exists")]
    ServiceAlreadyExists,
    #[msg("Job is not in Open status")]
    JobNotOpen,
    #[msg("Job is not in Assigned status")]
    JobNotAssigned,
    #[msg("Job has not been submitted yet")]
    JobNotSubmitted,
    #[msg("Caller is not the job poster")]
    NotJobPoster,
    #[msg("Caller is not the assigned agent")]
    NotAssignedAgent,
    #[msg("Job deadline has already passed")]
    DeadlinePassed,
    #[msg("Job deadline has not passed yet")]
    DeadlineNotPassed,
    #[msg("Invalid job mode; must be 0 (Open) or 1 (Direct)")]
    InvalidJobMode,
    #[msg("A bid already exists for this agent on this job")]
    BidAlreadyExists,
    #[msg("Reward must be greater than zero")]
    InsufficientReward,

    // ── new errors (v2) ──────────────────────────────────────────────
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Caller is not the protocol admin")]
    NotAdmin,
    #[msg("Dispute appeal period has not expired yet")]
    AppealPeriodActive,
    #[msg("Job is not in Disputed status")]
    JobNotDisputed,
    #[msg("Deadline seconds out of range (min 60, max 30 days)")]
    DeadlineOutOfRange,
    #[msg("Stake must meet the minimum threshold (0.01 SOL)")]
    BelowMinimumStake,
    #[msg("Fee basis points out of range (0-1000)")]
    InvalidFeeBps,
}
