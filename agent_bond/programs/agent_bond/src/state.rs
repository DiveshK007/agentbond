use anchor_lang::prelude::*;

// PDA: [b"protocol"] — Space: 8 + 63 = 71
// Added: paused (1), appeal_period_seconds (8) = +9 from original 67→76
// NOTE: space increased from 67 → 76; existing devnet accounts need realloc
#[account]
pub struct ProtocolConfig {
    pub admin: Pubkey,              // 32
    pub total_agents: u64,          // 8
    pub total_jobs: u64,            // 8
    pub total_volume: u64,          // 8
    pub platform_fee_bps: u16,      // 2
    pub paused: bool,               // 1   (v2) — circuit breaker
    pub appeal_period_seconds: i64, // 8   (v2) — seconds after dispute before slash finalizes
    pub bump: u8,                   // 1
}

// PDA: [b"agent", owner.key()] — Space: 8+247=255
#[account]
pub struct AgentProfile {
    pub owner: Pubkey,           // 32
    pub name: [u8; 32],          // 32
    pub metadata_uri: [u8; 128], // 128
    pub stake: u64,              // 8
    pub locked_stake: u64,       // 8
    pub reputation: u32,         // 4
    pub completed: u32,          // 4
    pub failed: u32,             // 4
    pub consecutive_fails: u8,   // 1
    pub total_earned: u64,       // 8
    pub total_slashed: u64,      // 8
    pub registered_at: i64,      // 8
    pub status: u8,              // 1  (0=Active, 1=Suspended, 2=Deregistered)
    pub bump: u8,                // 1
}

// PDA: [b"service", agent.key(), capability] — Space: 8+82=90
#[account]
pub struct ServiceListing {
    pub agent: Pubkey,           // 32
    pub capability: [u8; 32],    // 32
    pub price: u64,              // 8
    pub is_active: bool,         // 1
    pub total_calls: u64,        // 8
    pub bump: u8,                // 1
}

// PDA: [b"job", job_index.to_le_bytes()] — Space: 8+203=211
// Added: dispute_bond (8) for anti-spam dispute protection → 195+8+8 = 211
#[account]
pub struct Job {
    pub poster: Pubkey,            // 32
    pub agent: Pubkey,             // 32
    pub description_hash: [u8; 32],// 32
    pub reward: u64,               // 8
    pub collateral: u64,           // 8
    pub deadline: i64,             // 8
    pub mode: u8,                  // 1  (0=Open, 1=Direct)
    pub status: u8,                // 1  (0=Open,1=Assigned,2=Submitted,3=Completed,4=Disputed,5=Cancelled,6=TimedOut,7=DisputeResolved)
    pub result_hash: [u8; 32],     // 32
    pub created_at: i64,           // 8
    pub assigned_at: i64,          // 8
    pub resolved_at: i64,          // 8
    pub disputed_at: i64,          // 8   (v2) — timestamp when dispute was filed
    pub dispute_bond: u64,          // 8   (v2) — poster's anti-spam bond deposited on dispute
    pub job_index: u64,            // 8
    pub bump: u8,                  // 1
}

// PDA: [b"bid", job.key(), agent_owner.key()] — Space: 8+85=93
#[account]
pub struct Bid {
    pub job: Pubkey,               // 32
    pub agent: Pubkey,             // 32
    pub price: u64,                // 8
    pub estimated_seconds: u32,    // 4
    pub created_at: i64,           // 8
    pub bump: u8,                  // 1
}
