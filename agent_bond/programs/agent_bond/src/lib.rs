use anchor_lang::prelude::*;

declare_id!("5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3");

#[program]
pub mod agent_bond {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
