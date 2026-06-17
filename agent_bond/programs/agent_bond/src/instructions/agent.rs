use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{AgentProfile, ProtocolConfig, ServiceListing};
use crate::errors::AgentBondError;
use crate::events;

// Minimum stake: 0.01 SOL
const MIN_STAKE_LAMPORTS: u64 = 10_000_000;

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = owner,
        space = 255,
        seeds = [b"agent", owner.key().as_ref()],
        bump
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
        seeds = [b"protocol"],
        bump = protocol_config.bump,
        constraint = !protocol_config.paused @ AgentBondError::ProtocolPaused,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn register_agent(
    ctx: Context<RegisterAgent>,
    name: String,
    metadata_uri: String,
    stake_amount: u64,
) -> Result<()> {
    require!(stake_amount >= MIN_STAKE_LAMPORTS, AgentBondError::BelowMinimumStake);

    let mut name_bytes = [0u8; 32];
    let n = name.as_bytes().len().min(32);
    name_bytes[..n].copy_from_slice(&name.as_bytes()[..n]);

    let mut uri_bytes = [0u8; 128];
    let u = metadata_uri.as_bytes().len().min(128);
    uri_bytes[..u].copy_from_slice(&metadata_uri.as_bytes()[..u]);

    let clock = Clock::get()?;

    let profile = &mut ctx.accounts.agent_profile;
    profile.owner = ctx.accounts.owner.key();
    profile.name = name_bytes;
    profile.metadata_uri = uri_bytes;
    profile.stake = stake_amount;
    profile.locked_stake = 0;
    profile.reputation = 5000;
    profile.completed = 0;
    profile.failed = 0;
    profile.consecutive_fails = 0;
    profile.total_earned = 0;
    profile.total_slashed = 0;
    profile.registered_at = clock.unix_timestamp;
    profile.status = 0;
    profile.bump = ctx.bumps.agent_profile;

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.stake_vault.to_account_info(),
            },
        ),
        stake_amount,
    )?;

    ctx.accounts.protocol_config.total_agents = ctx.accounts.protocol_config.total_agents
        .checked_add(1).ok_or(AgentBondError::Overflow)?;

    emit!(events::AgentRegistered {
        owner: ctx.accounts.owner.key(),
        name: name_bytes,
        stake: stake_amount,
    });

    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct UpdateStake<'info> {
    #[account(
        mut,
        seeds = [b"agent", owner.key().as_ref()],
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
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn update_stake(
    ctx: Context<UpdateStake>,
    deposit: Option<u64>,
    withdraw: Option<u64>,
) -> Result<()> {
    require!(ctx.accounts.agent_profile.status == 0, AgentBondError::AgentNotActive);

    let mut deposited = 0u64;
    let mut withdrawn = 0u64;

    if let Some(amount) = deposit {
        require!(amount > 0, AgentBondError::InvalidStakeAmount);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.owner.to_account_info(),
                    to: ctx.accounts.stake_vault.to_account_info(),
                },
            ),
            amount,
        )?;

        ctx.accounts.agent_profile.stake = ctx.accounts.agent_profile.stake
            .checked_add(amount).ok_or(AgentBondError::Overflow)?;
        deposited = amount;
    }

    if let Some(amount) = withdraw {
        require!(amount > 0, AgentBondError::InvalidStakeAmount);

        let unlocked = ctx.accounts.agent_profile.stake
            .checked_sub(ctx.accounts.agent_profile.locked_stake)
            .ok_or(AgentBondError::StakeLocked)?;

        require!(unlocked >= amount, AgentBondError::InsufficientStake);

        let agent_key = ctx.accounts.agent_profile.key();
        let vault_bump = ctx.bumps.stake_vault;
        let signer_seeds: &[&[&[u8]]] =
            &[&[b"stake_vault", agent_key.as_ref(), &[vault_bump]]];

        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.stake_vault.to_account_info(),
                    to: ctx.accounts.owner.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        ctx.accounts.agent_profile.stake = ctx.accounts.agent_profile.stake
            .checked_sub(amount).ok_or(AgentBondError::Overflow)?;
        withdrawn = amount;
    }

    emit!(events::StakeUpdated {
        owner: ctx.accounts.owner.key(),
        deposited,
        withdrawn,
        new_stake: ctx.accounts.agent_profile.stake,
    });

    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(capability: String, price: u64)]
pub struct ListService<'info> {
    #[account(
        init,
        payer = owner,
        space = 90,
        seeds = [b"service", agent_profile.key().as_ref(), capability.as_bytes()],
        bump
    )]
    pub service_listing: Account<'info, ServiceListing>,

    #[account(
        seeds = [b"agent", owner.key().as_ref()],
        bump = agent_profile.bump
    )]
    pub agent_profile: Account<'info, AgentProfile>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn list_service(
    ctx: Context<ListService>,
    capability: String,
    price: u64,
) -> Result<()> {
    let agent = &ctx.accounts.agent_profile;
    require!(agent.status == 0, AgentBondError::AgentNotActive);

    let mut cap_bytes = [0u8; 32];
    let c = capability.as_bytes().len().min(32);
    cap_bytes[..c].copy_from_slice(&capability.as_bytes()[..c]);

    let listing = &mut ctx.accounts.service_listing;
    listing.agent = ctx.accounts.agent_profile.key();
    listing.capability = cap_bytes;
    listing.price = price;
    listing.is_active = true;
    listing.total_calls = 0;
    listing.bump = ctx.bumps.service_listing;

    emit!(events::ServiceListed {
        agent: ctx.accounts.agent_profile.key(),
        capability: cap_bytes,
        price,
    });

    Ok(())
}
