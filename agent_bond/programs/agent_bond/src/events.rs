use anchor_lang::prelude::*;

// ─── Protocol Events ─────────────────────────────────────────────────────────
// Every state-changing instruction emits an event for indexers (Helius, Geyser).

#[event]
pub struct ProtocolInitialized {
    pub admin: Pubkey,
    pub fee_bps: u16,
}

#[event]
pub struct AgentRegistered {
    pub owner: Pubkey,
    pub name: [u8; 32],
    pub stake: u64,
}

#[event]
pub struct StakeUpdated {
    pub owner: Pubkey,
    pub deposited: u64,
    pub withdrawn: u64,
    pub new_stake: u64,
}

#[event]
pub struct ServiceListed {
    pub agent: Pubkey,
    pub capability: [u8; 32],
    pub price: u64,
}

#[event]
pub struct JobCreated {
    pub job_index: u64,
    pub poster: Pubkey,
    pub reward: u64,
    pub deadline: i64,
    pub mode: u8,
}

#[event]
pub struct BidPlaced {
    pub job_index: u64,
    pub agent: Pubkey,
    pub price: u64,
    pub estimated_seconds: u32,
}

#[event]
pub struct AgentAssigned {
    pub job_index: u64,
    pub agent: Pubkey,
    pub collateral: u64,
}

#[event]
pub struct ResultSubmitted {
    pub job_index: u64,
    pub agent: Pubkey,
    pub result_hash: [u8; 32],
}

#[event]
pub struct JobApproved {
    pub job_index: u64,
    pub agent_payment: u64,
    pub platform_fee: u64,
    pub new_reputation: u32,
}

#[event]
pub struct JobDisputed {
    pub job_index: u64,
    pub poster: Pubkey,
    pub collateral_slashed: u64,
    pub appeal_deadline: i64,
}

#[event]
pub struct DisputeResolved {
    pub job_index: u64,
    pub resolved_by: Pubkey,
    pub agent_slashed: bool,
}

#[event]
pub struct TimeoutClaimed {
    pub job_index: u64,
    pub previous_status: u8,
    pub auto_approved: bool,
}

#[event]
pub struct ProtocolPaused {
    pub admin: Pubkey,
    pub paused: bool,
}

#[event]
pub struct FeeUpdated {
    pub old_fee_bps: u16,
    pub new_fee_bps: u16,
}

#[event]
pub struct TreasuryWithdrawal {
    pub amount: u64,
    pub destination: Pubkey,
}

#[event]
pub struct AdminTransferred {
    pub old_admin: Pubkey,
    pub new_admin: Pubkey,
}
