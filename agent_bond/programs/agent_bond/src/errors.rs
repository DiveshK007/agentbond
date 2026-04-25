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
}
