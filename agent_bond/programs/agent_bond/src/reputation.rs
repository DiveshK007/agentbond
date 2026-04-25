use crate::state::AgentProfile;

pub fn calculate_reputation(agent: &AgentProfile) -> u32 {
    let total = (agent.completed as u64).saturating_add(agent.failed as u64);
    if total == 0 {
        return 5000;
    }

    // success_rate: completed / total  →  0-10000
    let success_rate = (agent.completed as u64)
        .saturating_mul(10_000)
        .checked_div(total)
        .unwrap_or(0);

    // stake_commitment: capped at 10 SOL benchmark  →  0-10000
    const STAKE_BM: u64 = 10_000_000_000;
    let stake_score = agent
        .stake
        .min(STAKE_BM)
        .saturating_mul(10_000)
        .checked_div(STAKE_BM)
        .unwrap_or(0);

    // volume: total_earned capped at 100 SOL benchmark  →  0-10000
    const VOL_BM: u64 = 100_000_000_000;
    let volume_score = agent
        .total_earned
        .min(VOL_BM)
        .saturating_mul(10_000)
        .checked_div(VOL_BM)
        .unwrap_or(0);

    // earnings_ratio: earned / (earned + slashed)  →  0-10000
    let total_fin = agent.total_earned.saturating_add(agent.total_slashed);
    let earnings_score = if total_fin == 0 {
        5000u64
    } else {
        agent
            .total_earned
            .saturating_mul(10_000)
            .checked_div(total_fin)
            .unwrap_or(0)
    };

    // Weighted sum: 40% + 25% + 20% + 15% = 100%
    let weighted = success_rate
        .saturating_mul(40)
        .saturating_add(stake_score.saturating_mul(25))
        .saturating_add(volume_score.saturating_mul(20))
        .saturating_add(earnings_score.saturating_mul(15));

    (weighted / 100).min(10_000) as u32
}
