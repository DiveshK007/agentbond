use anchor_lang::prelude::*;

// PDA: [b"protocol"] — Space: 8+59=67
#[account]
pub struct ProtocolConfig {
    pub admin: Pubkey,           // 32
    pub total_agents: u64,       // 8
    pub total_jobs: u64,         // 8
    pub total_volume: u64,       // 8
    pub platform_fee_bps: u16,   // 2
    pub bump: u8,                // 1
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
