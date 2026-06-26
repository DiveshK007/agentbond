use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{AgentProfile, Job, ProtocolConfig};
use crate::errors::AgentBondError;
use crate::reputation::calculate_reputation;
use crate::events;

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

    emit!(events::ResultSubmitted {
        job_index: ctx.accounts.job.job_index,
        agent: ctx.accounts.agent_owner.key(),
        result_hash,
    });

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
        .ok_or(AgentBondError::Overflow)?
        .checked_div(10_000)
        .ok_or(AgentBondError::Overflow)?;
    let agent_payment = reward.checked_sub(platform_fee).ok_or(AgentBondError::Overflow)?;

    // Update agent
    ctx.accounts.agent_profile.locked_stake = ctx.accounts.agent_profile.locked_stake
        .checked_sub(collateral).ok_or(AgentBondError::Overflow)?;
    ctx.accounts.agent_profile.completed = ctx.accounts.agent_profile.completed
        .checked_add(1).ok_or(AgentBondError::Overflow)?;
    ctx.accounts.agent_profile.consecutive_fails = 0;
    ctx.accounts.agent_profile.total_earned = ctx.accounts.agent_profile.total_earned
        .checked_add(agent_payment).ok_or(AgentBondError::Overflow)?;

    let new_rep = calculate_reputation(&ctx.accounts.agent_profile);
    ctx.accounts.agent_profile.reputation = new_rep;

    // Update protocol
    ctx.accounts.protocol_config.total_volume = ctx.accounts.protocol_config.total_volume
        .checked_add(reward).ok_or(AgentBondError::Overflow)?;

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

    emit!(events::JobApproved {
        job_index: ctx.accounts.job.job_index,
        agent_payment,
        platform_fee,
        new_reputation: new_rep,
    });

    Ok(())
}

// ─── dispute_job ──────────────────────────────────────────────────────────────
// v2: Dispute now sets status = 4 (Disputed) and records disputed_at.
//     Poster must deposit a dispute bond (10% of reward, min 0.005 SOL).
//     Bond is returned if dispute resolves in poster's favor.
//     Bond goes to agent if agent's counter-dispute wins.

const MIN_DISPUTE_BOND: u64 = 5_000_000; // 0.005 SOL

#[derive(Accounts)]
pub struct DisputeJob<'info> {
    #[account(
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

    #[account(mut)]
    pub poster: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn dispute_job(ctx: Context<DisputeJob>) -> Result<()> {
    let clock = Clock::get()?;

    // Calculate dispute bond: 10% of reward, min 0.005 SOL
    let bond = std::cmp::max(
        ctx.accounts.job.reward
            .checked_div(10)
            .ok_or(AgentBondError::Overflow)?,
        MIN_DISPUTE_BOND,
    );

    // Transfer bond from poster into escrow
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.poster.to_account_info(),
                to: ctx.accounts.escrow_vault.to_account_info(),
            },
        ),
        bond,
    )?;

    // Mark as disputed — do NOT slash yet. Agent gets an appeal window.
    ctx.accounts.job.status = 4;
    ctx.accounts.job.disputed_at = clock.unix_timestamp;
    ctx.accounts.job.dispute_bond = bond;

    let appeal_deadline = clock.unix_timestamp
        .checked_add(ctx.accounts.protocol_config.appeal_period_seconds)
        .ok_or(AgentBondError::Overflow)?;

    emit!(events::JobDisputed {
        job_index: ctx.accounts.job.job_index,
        poster: ctx.accounts.poster.key(),
        collateral_slashed: ctx.accounts.job.collateral,
        appeal_deadline,
    });

    Ok(())
}

// ─── counter_dispute ─────────────────────────────────────────────────────────
// Agent submits counter-evidence during the appeal window.
// Sets status = 5 (CounterDisputed), which blocks automatic slashing via
// resolve_dispute. A countered dispute requires admin arbitration.

#[derive(Accounts)]
pub struct CounterDispute<'info> {
    #[account(
        seeds = [b"protocol"],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        constraint = job.status == 4 @ AgentBondError::JobNotDisputed,
        constraint = job.agent == agent_owner.key() @ AgentBondError::NotAssignedAgent,
    )]
    pub job: Account<'info, Job>,

    #[account(mut)]
    pub agent_owner: Signer<'info>,
}

pub fn counter_dispute(ctx: Context<CounterDispute>, evidence_hash: [u8; 32]) -> Result<()> {
    let clock = Clock::get()?;

    // Must be within the appeal window
    let appeal_deadline = ctx.accounts.job.disputed_at
        .checked_add(ctx.accounts.protocol_config.appeal_period_seconds)
        .ok_or(AgentBondError::Overflow)?;
    require!(
        clock.unix_timestamp <= appeal_deadline,
        AgentBondError::DeadlinePassed
    );

    // Mark as counter-disputed — blocks automatic resolve_dispute slashing
    ctx.accounts.job.status = 5; // CounterDisputed

    emit!(events::DisputeCountered {
        job_index: ctx.accounts.job.job_index,
        agent: ctx.accounts.agent_owner.key(),
        evidence_hash,
    });

    Ok(())
}

// ─── resolve_dispute ─────────────────────────────────────────────────────────
// Callable by anyone after the appeal period expires on UN-COUNTERED disputes.
// If the agent counter-disputed (status=5), only the admin can resolve.

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(
        seeds = [b"protocol"],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"job", job.job_index.to_le_bytes().as_ref()],
        bump = job.bump,
        constraint = job.status == 4 || job.status == 5 @ AgentBondError::JobNotDisputed,
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

    #[account(
        mut,
        seeds = [b"treasury", protocol_config.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// CHECK: Agent's wallet; receives payment if agent wins; verified by agent_profile
    #[account(
        mut,
        constraint = agent_owner.key() == agent_profile.owner @ AgentBondError::NotAssignedAgent
    )]
    pub agent_owner: UncheckedAccount<'info>,

    /// CHECK: Job poster; receives refunds; verified by job.poster field
    #[account(
        mut,
        constraint = poster.key() == job.poster @ AgentBondError::NotJobPoster
    )]
    pub poster: UncheckedAccount<'info>,

    #[account(mut)]
    pub caller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn resolve_dispute(ctx: Context<ResolveDispute>, agent_wins: bool) -> Result<()> {
    let clock = Clock::get()?;
    let job_status = ctx.accounts.job.status;

    // If agent counter-disputed (status=5), only admin can arbitrate
    if job_status == 5 {
        require!(
            ctx.accounts.caller.key() == ctx.accounts.protocol_config.admin,
            AgentBondError::NotAdmin
        );
    } else {
        // status == 4: un-countered dispute — enforce appeal period expired
        // agent_wins MUST be false if they didn't counter-dispute
        require!(!agent_wins, AgentBondError::NotAdmin); // Or just force false
        
        let appeal_deadline = ctx.accounts.job.disputed_at
            .checked_add(ctx.accounts.protocol_config.appeal_period_seconds)
            .ok_or(AgentBondError::Overflow)?;
        require!(
            clock.unix_timestamp > appeal_deadline,
            AgentBondError::AppealPeriodActive
        );
    }

    let collateral = ctx.accounts.job.collateral;
    let reward = ctx.accounts.job.reward;
    let bond = ctx.accounts.job.dispute_bond;
    let job_key = ctx.accounts.job.key();
    let agent_profile_key = ctx.accounts.agent_profile.key();
    let escrow_bump = ctx.bumps.escrow_vault;
    let stake_bump = ctx.bumps.stake_vault;

    if agent_wins {
        // Agent wins: gets paid, bond goes to agent, collateral released
        
        let fee_bps = ctx.accounts.protocol_config.platform_fee_bps as u64;
        let platform_fee = reward
            .checked_mul(fee_bps)
            .ok_or(AgentBondError::Overflow)?
            .checked_div(10_000)
            .ok_or(AgentBondError::Overflow)?;
        let agent_payment = reward.checked_sub(platform_fee).ok_or(AgentBondError::Overflow)?
            .checked_add(bond).ok_or(AgentBondError::Overflow)?; // Agent gets bond

        // Update agent stats
        ctx.accounts.agent_profile.locked_stake = ctx.accounts.agent_profile.locked_stake
            .checked_sub(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.completed = ctx.accounts.agent_profile.completed
            .checked_add(1).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.consecutive_fails = 0;
        ctx.accounts.agent_profile.total_earned = ctx.accounts.agent_profile.total_earned
            .checked_add(agent_payment).ok_or(AgentBondError::Overflow)?;
            
        // Protocol volume
        ctx.accounts.protocol_config.total_volume = ctx.accounts.protocol_config.total_volume
            .checked_add(reward).ok_or(AgentBondError::Overflow)?;

        // Payout from escrow to agent
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
    } else {
        // Poster wins (Slash agent): poster gets refund (reward + bond) and agent's collateral
        
        ctx.accounts.agent_profile.stake = ctx.accounts.agent_profile.stake
            .checked_sub(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.locked_stake = ctx.accounts.agent_profile.locked_stake
            .checked_sub(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.total_slashed = ctx.accounts.agent_profile.total_slashed
            .checked_add(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.failed = ctx.accounts.agent_profile.failed
            .checked_add(1).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.consecutive_fails = ctx.accounts.agent_profile.consecutive_fails
            .checked_add(1).ok_or(AgentBondError::Overflow)?;
        if ctx.accounts.agent_profile.consecutive_fails >= 3 {
            ctx.accounts.agent_profile.status = 1;
        }

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

        // Refund reward + bond from escrow to poster
        let refund_amount = reward.checked_add(bond).ok_or(AgentBondError::Overflow)?;
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.poster.to_account_info(),
                },
                &[&[b"escrow", job_key.as_ref(), &[escrow_bump]]],
            ),
            refund_amount,
        )?;
    }

    let new_rep = calculate_reputation(&ctx.accounts.agent_profile);
    ctx.accounts.agent_profile.reputation = new_rep;

    // Finalize job
    ctx.accounts.job.status = 7; // DisputeResolved
    ctx.accounts.job.resolved_at = clock.unix_timestamp;

    emit!(events::DisputeResolved {
        job_index: ctx.accounts.job.job_index,
        resolved_by: ctx.accounts.caller.key(),
        agent_slashed: !agent_wins,
    });

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
        ctx.accounts.agent_profile.stake = ctx.accounts.agent_profile.stake
            .checked_sub(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.locked_stake = ctx.accounts.agent_profile.locked_stake
            .checked_sub(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.total_slashed = ctx.accounts.agent_profile.total_slashed
            .checked_add(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.failed = ctx.accounts.agent_profile.failed
            .checked_add(1).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.consecutive_fails = ctx.accounts.agent_profile.consecutive_fails
            .checked_add(1).ok_or(AgentBondError::Overflow)?;
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
            .checked_mul(fee_bps).ok_or(AgentBondError::Overflow)?
            .checked_div(10_000).ok_or(AgentBondError::Overflow)?;
        let agent_payment = reward.checked_sub(platform_fee).ok_or(AgentBondError::Overflow)?;

        ctx.accounts.agent_profile.locked_stake = ctx.accounts.agent_profile.locked_stake
            .checked_sub(collateral).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.completed = ctx.accounts.agent_profile.completed
            .checked_add(1).ok_or(AgentBondError::Overflow)?;
        ctx.accounts.agent_profile.consecutive_fails = 0;
        ctx.accounts.agent_profile.total_earned = ctx.accounts.agent_profile.total_earned
            .checked_add(agent_payment).ok_or(AgentBondError::Overflow)?;
        let new_rep = calculate_reputation(&ctx.accounts.agent_profile);
        ctx.accounts.agent_profile.reputation = new_rep;

        ctx.accounts.protocol_config.total_volume = ctx.accounts.protocol_config.total_volume
            .checked_add(reward).ok_or(AgentBondError::Overflow)?;

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

    emit!(events::TimeoutClaimed {
        job_index: ctx.accounts.job.job_index,
        previous_status: status,
        auto_approved: status == 2,
    });

    Ok(())
}
