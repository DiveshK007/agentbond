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
}
