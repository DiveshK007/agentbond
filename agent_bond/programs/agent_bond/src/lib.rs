use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3");

#[program]
pub mod agent_bond {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>) -> Result<()> {
        instructions::initialize::initialize_protocol(ctx)
    }

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        name: String,
        metadata_uri: String,
        stake_amount: u64,
    ) -> Result<()> {
        instructions::agent::register_agent(ctx, name, metadata_uri, stake_amount)
    }

    pub fn update_stake(
        ctx: Context<UpdateStake>,
        deposit: Option<u64>,
        withdraw: Option<u64>,
    ) -> Result<()> {
        instructions::agent::update_stake(ctx, deposit, withdraw)
    }

    pub fn list_service(
        ctx: Context<ListService>,
        capability: String,
        price: u64,
    ) -> Result<()> {
        instructions::agent::list_service(ctx, capability, price)
    }

    pub fn create_job(
        ctx: Context<CreateJob>,
        job_index: u64,
        description_hash: [u8; 32],
        reward: u64,
        deadline_seconds: u64,
        mode: u8,
        agent_owner: Option<Pubkey>,
    ) -> Result<()> {
        instructions::job::create_job(ctx, job_index, description_hash, reward, deadline_seconds, mode, agent_owner)
    }

    pub fn bid_on_job(
        ctx: Context<BidOnJob>,
        price: u64,
        estimated_seconds: u32,
    ) -> Result<()> {
        instructions::job::bid_on_job(ctx, price, estimated_seconds)
    }

    pub fn assign_agent(ctx: Context<AssignAgent>, agent_pubkey: Pubkey) -> Result<()> {
        instructions::job::assign_agent(ctx, agent_pubkey)
    }
}
