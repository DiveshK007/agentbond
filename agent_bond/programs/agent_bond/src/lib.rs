use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod reputation;
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

    pub fn submit_result(ctx: Context<SubmitResult>, result_hash: [u8; 32]) -> Result<()> {
        instructions::resolution::submit_result(ctx, result_hash)
    }

    pub fn approve_job(ctx: Context<ApproveJob>) -> Result<()> {
        instructions::resolution::approve_job(ctx)
    }

    pub fn dispute_job(ctx: Context<DisputeJob>) -> Result<()> {
        instructions::resolution::dispute_job(ctx)
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>) -> Result<()> {
        instructions::resolution::resolve_dispute(ctx)
    }

    pub fn claim_timeout(ctx: Context<ClaimTimeout>) -> Result<()> {
        instructions::resolution::claim_timeout(ctx)
    }

    // ── Admin instructions ───────────────────────────────────────────────

    pub fn update_fee(ctx: Context<UpdateFee>, new_fee_bps: u16) -> Result<()> {
        instructions::admin::update_fee(ctx, new_fee_bps)
    }

    pub fn pause_protocol(ctx: Context<PauseProtocol>, paused: bool) -> Result<()> {
        instructions::admin::pause_protocol(ctx, paused)
    }

    pub fn withdraw_treasury(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
        instructions::admin::withdraw_treasury(ctx, amount)
    }

    pub fn transfer_admin(ctx: Context<TransferAdmin>, new_admin: Pubkey) -> Result<()> {
        instructions::admin::transfer_admin(ctx, new_admin)
    }
}
