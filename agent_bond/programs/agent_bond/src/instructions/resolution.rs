use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{AgentProfile, Job, ProtocolConfig};
use crate::errors::AgentBondError;
use crate::reputation::calculate_reputation;

// ─── submit_result ────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct SubmitResult<'info> {
    #[account(
        mut,
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        constraint = job.status == 1 @ AgentBondError::JobNotAssigned,
        constraint = job.agent == agent_owner.key() @ AgentBondError::NotAssignedAgent,
    )]
    pub job: Account<'info, Job>,

    #[account(mut)]
    pub agent_owner: Signer<'info>,
}

pub fn submit_result(ctx: Context<SubmitResult>, result_hash: [u8; 32]) -> Result<()> {
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp <= ctx.accounts.job.deadline,
        AgentBondError::DeadlinePassed
    );

    ctx.accounts.job.result_hash = result_hash;
    ctx.accounts.job.status = 2;

    Ok(())
}

// ─── approve_job ──────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct ApproveJob<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        has_one = poster @ AgentBondError::NotJobPoster,
        constraint = job.status == 2 @ AgentBondError::JobNotSubmitted,
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
        seeds = [b"agent", job.agent.as_ref()],
        bump = agent_profile.bump
    )]
    pub agent_profile: Account<'info, AgentProfile>,

    /// CHECK: Agent's wallet; receives payment; verified by job.agent
    #[account(
        mut,
        constraint = agent_owner.key() == job.agent @ AgentBondError::NotAssignedAgent
    )]
    pub agent_owner: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"treasury", protocol_config.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub poster: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn approve_job(ctx: Context<ApproveJob>) -> Result<()> {
    let clock = Clock::get()?;

    let reward = ctx.accounts.job.reward;
    let collateral = ctx.accounts.job.collateral;
    let job_key = ctx.accounts.job.key();
    let escrow_bump = ctx.bumps.escrow_vault;
    let fee_bps = ctx.accounts.protocol_config.platform_fee_bps as u64;

    let platform_fee = reward
        .checked_mul(fee_bps)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    let agent_payment = reward.checked_sub(platform_fee).unwrap();

    // Update agent
    ctx.accounts.agent_profile.locked_stake = ctx
        .accounts
        .agent_profile
        .locked_stake
        .checked_sub(collateral)
        .unwrap();
    ctx.accounts.agent_profile.completed = ctx
        .accounts
        .agent_profile
        .completed
        .checked_add(1)
        .unwrap();
    ctx.accounts.agent_profile.consecutive_fails = 0;
    ctx.accounts.agent_profile.total_earned = ctx
        .accounts
        .agent_profile
        .total_earned
        .checked_add(agent_payment)
        .unwrap();

    let new_rep = calculate_reputation(&ctx.accounts.agent_profile);
    ctx.accounts.agent_profile.reputation = new_rep;

    // Update protocol
    ctx.accounts.protocol_config.total_volume = ctx
        .accounts
        .protocol_config
        .total_volume
        .checked_add(reward)
        .unwrap();

    // Update job
    ctx.accounts.job.status = 3;
    ctx.accounts.job.resolved_at = clock.unix_timestamp;

    // Pay agent from escrow
    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.escrow_vault.to_account_info(),
                to: ctx.accounts.agent_owner.to_account_info(),
            },
            &[&[b"escrow", job_key.as_ref(), &[escrow_bump]]],
        ),
        agent_payment,
    )?;

    // Send fee to treasury
    if platform_fee > 0 {
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
                &[&[b"escrow", job_key.as_ref(), &[escrow_bump]]],
            ),
            platform_fee,
        )?;
    }

    Ok(())
}

// ─── dispute_job ──────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct DisputeJob<'info> {
    #[account(
        mut,
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        has_one = poster @ AgentBondError::NotJobPoster,
        constraint = job.status == 2 @ AgentBondError::JobNotSubmitted,
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
        seeds = [b"agent", job.agent.as_ref()],
        bump = agent_profile.bump
    )]
    pub agent_profile: Account<'info, AgentProfile>,

    #[account(
        mut,
        seeds = [b"stake_vault", agent_profile.key().as_ref()],
        bump
    )]
    pub stake_vault: SystemAccount<'info>,

    #[account(mut)]
    pub poster: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn dispute_job(ctx: Context<DisputeJob>) -> Result<()> {
    let clock = Clock::get()?;

    let collateral = ctx.accounts.job.collateral;
    let reward = ctx.accounts.job.reward;
    let job_key = ctx.accounts.job.key();
    let agent_profile_key = ctx.accounts.agent_profile.key();
    let escrow_bump = ctx.bumps.escrow_vault;
    let stake_bump = ctx.bumps.stake_vault;

    // Slash agent
    ctx.accounts.agent_profile.stake = ctx
        .accounts
        .agent_profile
        .stake
        .checked_sub(collateral)
        .unwrap();
    ctx.accounts.agent_profile.locked_stake = ctx
        .accounts
        .agent_profile
        .locked_stake
        .checked_sub(collateral)
        .unwrap();
    ctx.accounts.agent_profile.total_slashed = ctx
        .accounts
        .agent_profile
        .total_slashed
        .checked_add(collateral)
        .unwrap();
    ctx.accounts.agent_profile.failed = ctx
        .accounts
        .agent_profile
        .failed
        .checked_add(1)
        .unwrap();
    ctx.accounts.agent_profile.consecutive_fails = ctx
        .accounts
        .agent_profile
        .consecutive_fails
        .checked_add(1)
        .unwrap();
    if ctx.accounts.agent_profile.consecutive_fails >= 3 {
        ctx.accounts.agent_profile.status = 1;
    }

    let new_rep = calculate_reputation(&ctx.accounts.agent_profile);
    ctx.accounts.agent_profile.reputation = new_rep;

    // Resolve job
    ctx.accounts.job.status = 4;
    ctx.accounts.job.resolved_at = clock.unix_timestamp;

    // Return collateral from stake vault to poster
    if collateral > 0 {
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.stake_vault.to_account_info(),
                    to: ctx.accounts.poster.to_account_info(),
                },
                &[&[b"stake_vault", agent_profile_key.as_ref(), &[stake_bump]]],
            ),
            collateral,
        )?;
    }

    // Refund reward from escrow to poster
    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.escrow_vault.to_account_info(),
                to: ctx.accounts.poster.to_account_info(),
            },
            &[&[b"escrow", job_key.as_ref(), &[escrow_bump]]],
        ),
        reward,
    )?;

    Ok(())
}

// ─── claim_timeout ────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct ClaimTimeout<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        has_one = poster @ AgentBondError::NotJobPoster,
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
        seeds = [b"agent", job.agent.as_ref()],
        bump = agent_profile.bump
    )]
    pub agent_profile: Account<'info, AgentProfile>,

    #[account(
        mut,
        seeds = [b"stake_vault", agent_profile.key().as_ref()],
        bump
    )]
    pub stake_vault: SystemAccount<'info>,

    /// CHECK: Agent's wallet; receives payment on auto-approve path; key verified by job.agent
    #[account(
        mut,
        constraint = agent_owner.key() == job.agent @ AgentBondError::NotAssignedAgent
    )]
    pub agent_owner: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"treasury", protocol_config.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// CHECK: Job poster; receives refunds on slash path; verified by has_one on job
    #[account(mut)]
    pub poster: UncheckedAccount<'info>,

    #[account(mut)]
    pub caller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn claim_timeout(ctx: Context<ClaimTimeout>) -> Result<()> {
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp > ctx.accounts.job.deadline,
        AgentBondError::DeadlineNotPassed
    );

    let status = ctx.accounts.job.status;
    require!(
        status == 1 || status == 2,
        AgentBondError::JobNotAssigned
    );

    let reward = ctx.accounts.job.reward;
    let collateral = ctx.accounts.job.collateral;
    let job_key = ctx.accounts.job.key();
    let agent_profile_key = ctx.accounts.agent_profile.key();
    let escrow_bump = ctx.bumps.escrow_vault;
    let stake_bump = ctx.bumps.stake_vault;
    let fee_bps = ctx.accounts.protocol_config.platform_fee_bps as u64;

    if status == 1 {
        // Agent assigned but never submitted — slash, refund poster
        ctx.accounts.agent_profile.stake = ctx
            .accounts
            .agent_profile
            .stake
            .checked_sub(collateral)
            .unwrap();
        ctx.accounts.agent_profile.locked_stake = ctx
            .accounts
            .agent_profile
            .locked_stake
            .checked_sub(collateral)
            .unwrap();
        ctx.accounts.agent_profile.total_slashed = ctx
            .accounts
            .agent_profile
            .total_slashed
            .checked_add(collateral)
            .unwrap();
        ctx.accounts.agent_profile.failed = ctx
            .accounts
            .agent_profile
            .failed
            .checked_add(1)
            .unwrap();
        ctx.accounts.agent_profile.consecutive_fails = ctx
            .accounts
            .agent_profile
            .consecutive_fails
            .checked_add(1)
            .unwrap();
        if ctx.accounts.agent_profile.consecutive_fails >= 3 {
            ctx.accounts.agent_profile.status = 1;
        }
        let new_rep = calculate_reputation(&ctx.accounts.agent_profile);
        ctx.accounts.agent_profile.reputation = new_rep;

        ctx.accounts.job.status = 6;
        ctx.accounts.job.resolved_at = clock.unix_timestamp;

        if collateral > 0 {
            system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    system_program::Transfer {
                        from: ctx.accounts.stake_vault.to_account_info(),
                        to: ctx.accounts.poster.to_account_info(),
                    },
                    &[&[b"stake_vault", agent_profile_key.as_ref(), &[stake_bump]]],
                ),
                collateral,
            )?;
        }

        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.poster.to_account_info(),
                },
                &[&[b"escrow", job_key.as_ref(), &[escrow_bump]]],
            ),
            reward,
        )?;
    } else {
        // status == 2: submitted but poster never acted — auto-approve, pay agent
        let platform_fee = reward
            .checked_mul(fee_bps)
            .unwrap()
            .checked_div(10_000)
            .unwrap();
        let agent_payment = reward.checked_sub(platform_fee).unwrap();

        ctx.accounts.agent_profile.locked_stake = ctx
            .accounts
            .agent_profile
            .locked_stake
            .checked_sub(collateral)
            .unwrap();
        ctx.accounts.agent_profile.completed = ctx
            .accounts
            .agent_profile
            .completed
            .checked_add(1)
            .unwrap();
        ctx.accounts.agent_profile.consecutive_fails = 0;
        ctx.accounts.agent_profile.total_earned = ctx
            .accounts
            .agent_profile
            .total_earned
            .checked_add(agent_payment)
            .unwrap();
        let new_rep = calculate_reputation(&ctx.accounts.agent_profile);
        ctx.accounts.agent_profile.reputation = new_rep;

        ctx.accounts.protocol_config.total_volume = ctx
            .accounts
            .protocol_config
            .total_volume
            .checked_add(reward)
            .unwrap();

        ctx.accounts.job.status = 3;
        ctx.accounts.job.resolved_at = clock.unix_timestamp;

        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.agent_owner.to_account_info(),
                },
                &[&[b"escrow", job_key.as_ref(), &[escrow_bump]]],
            ),
            agent_payment,
        )?;

        if platform_fee > 0 {
            system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    system_program::Transfer {
                        from: ctx.accounts.escrow_vault.to_account_info(),
                        to: ctx.accounts.treasury.to_account_info(),
                    },
                    &[&[b"escrow", job_key.as_ref(), &[escrow_bump]]],
                ),
                platform_fee,
            )?;
        }
    }

    Ok(())
}
