# KPEPE Staking Tiers & Free Tickets Strategy

## 🎯 Executive Summary

The KPEPE Jackpot now includes a **free ticket system** based on KPEPE staking. This creates strong incentives for users to stake their KPEPE tokens, increasing demand and reducing selling pressure.

---

## 📊 Recommended Staking Tiers

### Option A: Conservative (Lower Entry Barrier)

| Tier | KPEPE Staked | Weekly Free Tickets | Monthly | Annual | Value (at $0.005/KPEPE) |
|------|-------------|---------------------|---------|--------|-------------------------|
| 🥉 Bronze | 10,000 | 1 | 4 | 48 | ~$50 |
| 🥈 Silver | 50,000 | 3 | 12 | 144 | ~$250 |
| 🥇 Gold | 200,000 | 7 | 28 | 336 | ~$1,000 |
| 💎 Platinum | 500,000 | 15 | 60 | 720 | ~$2,500 |
| 👑 Diamond | 1,000,000 | 30 | 120 | 1,440 | ~$5,000 |

**Entry Cost:** ~$50 for Bronze tier
**Max Value:** ~$5,000/year for Diamond

---

### Option B: Balanced (Recommended)

| Tier | KPEPE Staked | Weekly Free Tickets | Monthly | Annual | % of Tier Stake |
|------|-------------|---------------------|---------|--------|-----------------|
| 🥉 Bronze | 10,000 | 1 | 4 | 48 | 0.48% |
| 🥈 Silver | 50,000 | 3 | 12 | 144 | 0.29% |
| 🥇 Gold | 200,000 | 7 | 28 | 336 | 0.17% |
| 💎 Platinum | 500,000 | 15 | 60 | 720 | 0.14% |
| 👑 Diamond | 1,000,000 | 30 | 120 | 1,440 | 0.14% |

**Rationale:**
- Bronze tier: Low barrier, encourages participation
- Higher tiers: Better value percentage to reward larger stakes
- Diamond provides 30 tickets/week = 120/month = 1,440/year

---

### Option C: Aggressive (High Rewards)

| Tier | KPEPE Staked | Weekly Free Tickets | Monthly | Annual |
|------|-------------|---------------------|---------|--------|
| 🥉 Bronze | 5,000 | 1 | 4 | 48 |
| 🥈 Silver | 25,000 | 3 | 12 | 144 |
| 🥇 Gold | 100,000 | 7 | 28 | 336 |
| 💎 Platinum | 250,000 | 15 | 60 | 720 |
| 👑 Diamond | 500,000 | 35 | 140 | 1,680 |

---

## 💰 Economic Analysis

### For Users

| KPEPE Stake | Weekly Cost | Ticket Value | ROI per Week |
|-------------|-------------|--------------|--------------|
| 10,000 | Staking (no cost) | 100 KLV | ~$0.15 |
| 50,000 | Staking (no cost) | 300 KLV | ~$0.45 |
| 200,000 | Staking (no cost) | 700 KLV | ~$1.07 |
| 500,000 | Staking (no cost) | 1,500 KLV | ~$2.29 |
| 1,000,000 | Staking (no cost) | 3,000 KLV | ~$4.58 |

*ROI based on 100 KLV = $0.15*

### For Protocol

**Benefits:**
- ✅ Reduces circulating supply (staking)
- ✅ Increases engagement
- ✅ Creates secondary market for tier upgrades
- ✅ Network effects (more players = bigger pools)

**Costs:**
- ⚠️ Free tickets don't add to prize pool (0% to pool)
- ⚠️ Must balance with paid ticket purchases

---

## 🎮 How It Works

### User Flow:
```
1. User stakes KPEPE on KPEPE Staking contract
2. User visits Jackpot website
3. Clicks "Claim Free Tickets"
4. Free tickets credited to account (based on tier)
5. User can now buy tickets for FREE
6. Free tickets have same winning odds as paid tickets
```

### Rules:
- ✅ Free tickets can only be used by the staker (not transferable)
- ✅ Claims limited to once per 7 days
- ✅ Unused credits accumulate (no expiration)
- ✅ Tiers determined by external KPEPE Staking contract

---

## 🏗️ Technical Implementation

### Required External Contract:
```solidity
interface IKPEPEStaking {
    function getStakeAmount(address user) external view returns (uint256);
    function getTier(address user) external view returns (uint8 tier);
}
```

### Contract Changes:
- Added `freeTicketCredits` mapping
- Added `lastFreeTicketClaim` mapping
- Added `claimFreeTickets()` function
- Modified `buyTicket()` to check for free credits
- Added tier configuration system

### Frontend Updates:
```javascript
// Check free ticket balance
const freeTickets = await contract.getFreeTicketsAvailable();

// Claim free tickets
await contract.claimFreeTickets();

// Buy with free ticket (value = 0 KLV)
await contract.buyTicket(nums, eb); // {value: 0}
```

---

## 📈 Projected Impact

### Scenario: 1,000 Active Users

| Tier | Users | Tickets/Week | Total Tickets | Pool Contribution |
|------|-------|--------------|---------------|-------------------|
| Bronze | 500 | 1 | 500 | $0 (free) |
| Silver | 250 | 3 | 750 | $0 (free) |
| Gold | 150 | 7 | 1,050 | $0 (free) |
| Platinum | 75 | 15 | 1,125 | $0 (free) |
| Diamond | 25 | 30 | 750 | $0 (free) |
| **Paid** | Varies | Varies | 5,000 | $500/week |

**Net Effect:**
- High engagement without pool dilution
- Need ~5,000+ paid tickets/week to sustain pool

---

## ⚙️ Configuration Commands

### Set Staking Contract
```javascript
await contract.setKPEPEStaking("0xStakingContractAddress");
```

### Update Tier Config
```javascript
await contract.setTierConfig(
  1,                    // tierId (0-5)
  10000 * 1e8,          // minStake (10,000 KPEPE)
  1,                    // freeTicketsPerWeek
  "Bronze"              // name
);
```

### View Current Tiers
```javascript
for (let i = 0; i <= 5; i++) {
  const [min, tickets, name] = await contract.getTierInfo(i);
  console.log(`${name}: ${min/1e8} KPEPE, ${tickets} tickets/week`);
}
```

---

## 🔄 Recommended Rollout

### Phase 1: Launch (Week 1-2)
- Start with Conservative tiers
- Bronze: 10,000 KPEPE → 1 ticket/week
- Silver: 50,000 KPEPE → 3 tickets/week
- Gold: 200,000 KPEPE → 7 tickets/week

### Phase 2: Growth (Week 3-4)
- Add Platinum: 500,000 KPEPE → 15 tickets/week
- Add Diamond: 1,000,000 KPEPE → 30 tickets/week

### Phase 3: Optimize (Month 2+)
- Adjust tiers based on user feedback
- Consider bonus tickets for consecutive weeks
- Add "streak" bonuses (extra tickets for claiming every week)

---

## 🎯 Final Recommendation

**Use Option B (Balanced):**

| Tier | Stake | Tickets/Week | Why |
|------|-------|--------------|-----|
| Bronze | 10K | 1 | Low barrier, encourages trial |
| Silver | 50K | 3 | Sweet spot for small holders |
| Gold | 200K | 7 | One ticket/day - great value |
| Platinum | 500K | 15 | ~2 tickets/day - premium |
| Diamond | 1M | 30 | ~4 tickets/day - whale tier |

**This creates a clear upgrade path** and rewards larger stakes appropriately while keeping the entry barrier manageable for new users.
