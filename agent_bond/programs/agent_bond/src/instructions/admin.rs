use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::ProtocolConfig;
use crate::errors::AgentBondError;
use crate::events;

// ─── update_fee ──────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_config.bump,
        constraint = protocol_config.admin == admin.key() @ AgentBondError::NotAdmin,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

pub fn update_fee(ctx: Context<UpdateFee>, new_fee_bps: u16) -> Result<()> {
    require!(new_fee_bps <= 1000, AgentBondError::InvalidFeeBps);

    let old = ctx.accounts.protocol_config.platform_fee_bps;
    ctx.accounts.protocol_config.platform_fee_bps = new_fee_bps;

    emit!(events::FeeUpdated {
        old_fee_bps: old,
        new_fee_bps,
    });

    Ok(())
}

// ─── pause_protocol ──────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct PauseProtocol<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_config.bump,
        constraint = protocol_config.admin == admin.key() @ AgentBondError::NotAdmin,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

pub fn pause_protocol(ctx: Context<PauseProtocol>, paused: bool) -> Result<()> {
    ctx.accounts.protocol_config.paused = paused;

    emit!(events::ProtocolPaused {
        admin: ctx.accounts.admin.key(),
        paused,
    });

    Ok(())
}

// ─── withdraw_treasury ───────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(
        seeds = [b"protocol"],
        bump = protocol_config.bump,
        constraint = protocol_config.admin == admin.key() @ AgentBondError::NotAdmin,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"treasury", protocol_config.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// CHECK: Destination for withdrawn funds; admin controls where fees go
    #[account(mut)]
    pub destination: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn withdraw_treasury(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
    let protocol_key = ctx.accounts.protocol_config.key();
    let treasury_bump = ctx.bumps.treasury;

    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.treasury.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
            },
            &[&[b"treasury", protocol_key.as_ref(), &[treasury_bump]]],
        ),
        amount,
    )?;

    emit!(events::TreasuryWithdrawal {
        amount,
        destination: ctx.accounts.destination.key(),
    });

    Ok(())
}

// ─── transfer_admin ──────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_config.bump,
        constraint = protocol_config.admin == admin.key() @ AgentBondError::NotAdmin,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

pub fn transfer_admin(ctx: Context<TransferAdmin>, new_admin: Pubkey) -> Result<()> {
    let old = ctx.accounts.protocol_config.admin;
    ctx.accounts.protocol_config.admin = new_admin;

    emit!(events::AdminTransferred {
        old_admin: old,
        new_admin,
    });

    Ok(())
}
