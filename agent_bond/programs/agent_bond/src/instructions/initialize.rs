use anchor_lang::prelude::*;
use crate::state::ProtocolConfig;

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = admin,
        space = 67,
        seeds = [b"protocol"],
        bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_protocol(ctx: Context<InitializeProtocol>) -> Result<()> {
    let config = &mut ctx.accounts.protocol_config;
    config.admin = ctx.accounts.admin.key();
    config.total_agents = 0;
    config.total_jobs = 0;
    config.total_volume = 0;
    config.platform_fee_bps = 200;
    config.bump = ctx.bumps.protocol_config;
    Ok(())
}
