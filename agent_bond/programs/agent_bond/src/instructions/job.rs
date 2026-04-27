use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{AgentProfile, Bid, Job, ProtocolConfig};
use crate::errors::AgentBondError;

// ─── create_job ───────────────────────────────────────────────────────────────

// job_index is the first arg so #[instruction] can use it for PDA seeds.
// The SDK reads protocol_config.total_jobs and passes it here; the constraint
// enforces it matches the current counter, preventing gaps or pre-claiming.
#[derive(Accounts)]
#[instruction(job_index: u64)]
pub struct CreateJob<'info> {
    #[account(
        init,
        payer = poster,
        space = 210,
        seeds = [b"job", job_index.to_le_bytes().as_ref()],
        bump,
        constraint = job_index == protocol_config.total_jobs @ AgentBondError::JobNotOpen,
    )]
    pub job: Account<'info, Job>,

    #[account(
        mut,
        seeds = [b"escrow", job.key().as_ref()],
        bump
    )]
    pub escrow_vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account()]
    pub agent_profile: Option<Account<'info, AgentProfile>>,

    #[account(mut)]
    pub poster: Signer<'info>,

    pub system_program: Program<'info, System>,
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
    require!(reward > 0, AgentBondError::InsufficientReward);
    require!(mode <= 1, AgentBondError::InvalidJobMode);

    let clock = Clock::get()?;
    let poster_key = ctx.accounts.poster.key();

    let (assigned_agent, collateral, status, assigned_at) = if mode == 1 {
        let owner_key = agent_owner.ok_or(AgentBondError::InvalidJobMode)?;
        let profile = ctx
            .accounts
            .agent_profile
            .as_mut()
            .ok_or(AgentBondError::AgentNotActive)?;

        require!(profile.owner == owner_key, AgentBondError::AgentNotActive);
        require!(profile.status == 0, AgentBondError::AgentNotActive);
        require!(profile.stake > 0, AgentBondError::InsufficientStake);

        let coll = reward.min(profile.stake / 10);
        profile.locked_stake = profile.locked_stake.checked_add(coll).unwrap();

        (owner_key, coll, 1u8, clock.unix_timestamp)
    } else {
        (Pubkey::default(), 0u64, 0u8, 0i64)
    };

    let job = &mut ctx.accounts.job;
    job.poster = poster_key;
    job.agent = assigned_agent;
    job.description_hash = description_hash;
    job.reward = reward;
    job.collateral = collateral;
    job.deadline = clock
        .unix_timestamp
        .checked_add(deadline_seconds as i64)
        .unwrap();
    job.mode = mode;
    job.status = status;
    job.result_hash = [0u8; 32];
    job.created_at = clock.unix_timestamp;
    job.assigned_at = assigned_at;
    job.resolved_at = 0;
    job.job_index = job_index;
    job.bump = ctx.bumps.job;

    let rent_min = Rent::get()?.minimum_balance(0);
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.poster.to_account_info(),
                to: ctx.accounts.escrow_vault.to_account_info(),
            },
        ),
        rent_min.checked_add(reward).unwrap(),
    )?;

    ctx.accounts.protocol_config.total_jobs = ctx
        .accounts
        .protocol_config
        .total_jobs
        .checked_add(1)
        .unwrap();

    Ok(())
}

// ─── bid_on_job ───────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct BidOnJob<'info> {
    #[account(
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        constraint = job.status == 0 @ AgentBondError::JobNotOpen,
        constraint = job.mode == 0 @ AgentBondError::InvalidJobMode,
    )]
    pub job: Account<'info, Job>,

    #[account(
        init,
        payer = agent_owner,
        space = 93,
        seeds = [b"bid", job.key().as_ref(), agent_owner.key().as_ref()],
        bump
    )]
    pub bid: Account<'info, Bid>,

    #[account(
        seeds = [b"agent", agent_owner.key().as_ref()],
        bump = agent_profile.bump,
        constraint = agent_profile.status == 0 @ AgentBondError::AgentNotActive,
        constraint = agent_profile.stake > 0 @ AgentBondError::InsufficientStake,
    )]
    pub agent_profile: Account<'info, AgentProfile>,

    #[account(mut)]
    pub agent_owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn bid_on_job(
    ctx: Context<BidOnJob>,
    price: u64,
    estimated_seconds: u32,
) -> Result<()> {
    let clock = Clock::get()?;

    let bid = &mut ctx.accounts.bid;
    bid.job = ctx.accounts.job.key();
    bid.agent = ctx.accounts.agent_owner.key();
    bid.price = price;
    bid.estimated_seconds = estimated_seconds;
    bid.created_at = clock.unix_timestamp;
    bid.bump = ctx.bumps.bid;

    Ok(())
}

// ─── assign_agent ─────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(agent_pubkey: Pubkey)]
pub struct AssignAgent<'info> {
    #[account(
        mut,
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        has_one = poster @ AgentBondError::NotJobPoster,
        constraint = job.status == 0 @ AgentBondError::JobNotOpen,
    )]
    pub job: Account<'info, Job>,

    #[account(
        mut,
        seeds = [b"agent", agent_pubkey.as_ref()],
        bump = agent_profile.bump,
        constraint = agent_profile.status == 0 @ AgentBondError::AgentNotActive,
    )]
    pub agent_profile: Account<'info, AgentProfile>,

    #[account(
        seeds = [b"bid", job.key().as_ref(), agent_pubkey.as_ref()],
        bump = bid.bump,
    )]
    pub bid: Account<'info, Bid>,

    #[account(mut)]
    pub poster: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn assign_agent(ctx: Context<AssignAgent>, agent_pubkey: Pubkey) -> Result<()> {
    let clock = Clock::get()?;

    let reward = ctx.accounts.job.reward;
    let agent_stake = ctx.accounts.agent_profile.stake;
    let collateral = reward.min(agent_stake / 10);

    ctx.accounts.agent_profile.locked_stake = ctx
        .accounts
        .agent_profile
        .locked_stake
        .checked_add(collateral)
        .unwrap();

    let job = &mut ctx.accounts.job;
    job.agent = agent_pubkey;
    job.collateral = collateral;
    job.status = 1;
    job.assigned_at = clock.unix_timestamp;

    Ok(())
}
