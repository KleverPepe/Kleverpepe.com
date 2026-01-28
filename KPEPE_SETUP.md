# KPEPE Lottery - Configuration & Setup Guide

**Updated:** January 28, 2026  
**Contract:** `klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d`  
**KPEPE Token:** `kpepe-1eod`

---

## ✅ Fixed Issues

### Free Tickets Verification (FIXED ✅)

The `claimFreeTickets()` function now:
1. **Verifies staking balance** - Calls staking contract to check user stake
2. **Enforces 50K minimum** - Rejects if stake < 50K KPEPE
3. **Implements tier system** - Awards different ticket amounts by tier:
   - 🥉 10K KPEPE → 1 ticket/week
   - 🥉 50K KPEPE → 3 tickets/week
   - 🥇 200K KPEPE → 7 tickets/week
   - 💎 500K KPEPE → 15 tickets/week
   - 👑 1M KPEPE → 30 tickets/week
4. **7-day cooldown** - Can only claim once per week
5. **Daily draw reset** - Free tickets expire when new draw starts

---

## 🔧 Setup Steps

### Step 1: Set KPEPE Token Address

**Command:**
```javascript
// Call on contract (owner only)
setKPEPEToken('kpepe-1eod')
```

**Expected Result:**
```
✅ KPEPE token address set to kpepe-1eod
```

---

### Step 2: Set KPEPE Staking Contract Address

**Prerequisites:**
- You have a KPEPE staking contract deployed
- Contract has `getStake(address)` function that returns user's staked amount

**Command:**
```javascript
// Call on contract (owner only)
setKPEPEStaking('klv1xxx...staking-contract-address')
```

**Expected Result:**
```
✅ Staking contract set
```

---

### Step 3: Configure KPEPE Prize Amounts

**Command:**
```javascript
// setKPEPEPrizes(jackpot, match5, match4_8b, match4, match3_8b, match3, match2_8b, match1_8b, match8b_only)

setKPEPEPrizes(
    500000000000000,     // Tier 1 (Jackpot - 5+8B): 500K KPEPE
    100000000000000,     // Tier 2 (Match 5): 100K KPEPE
    50000000000000,      // Tier 3 (4+8B): 50K KPEPE
    25000000000000,      // Tier 4 (Match 4): 25K KPEPE
    15000000000000,      // Tier 5 (3+8B): 15K KPEPE
    10000000000000,      // Tier 6 (Match 3): 10K KPEPE
    5000000000000,       // Tier 7 (2+8B): 5K KPEPE
    2000000000000,       // Tier 8 (1+8B): 2K KPEPE
    1000000000000        // Tier 9 (8B only): 1K KPEPE
)
```

**KPEPE Amount Breakdown:**
| Prize Tier | Winning Condition | KPEPE Tokens | Notes |
|------------|------------------|--------------|-------|
| Tier 1 | 5 main + 8-Ball | 500,000 KPEPE | **Grand Prize** |
| Tier 2 | 5 main numbers only | 100,000 KPEPE | Second prize |
| Tier 3 | 4 main + 8-Ball | 50,000 KPEPE | Major prize |
| Tier 4 | 4 main numbers only | 25,000 KPEPE | Mid prize |
| Tier 5 | 3 main + 8-Ball | 15,000 KPEPE | Small prize |
| Tier 6 | 3 main numbers only | 10,000 KPEPE | Small prize |
| Tier 7 | 2 main + 8-Ball | 5,000 KPEPE | Consolation |
| Tier 8 | 1 main + 8-Ball | 2,000 KPEPE | Bonus |
| Tier 9 | 8-Ball only | 1,000 KPEPE | Base prize |

**Expected Result:**
```
✅ KPEPE prize amounts configured
```

---

### Step 4: Fund Prize Pool with KPEPE Tokens

**Prerequisites:**
- You own `kpepe-1eod` tokens
- You have enough tokens for all potential prizes

**Calculation:**
```
Recommended Fund = 10,000,000 KPEPE (10M)
This covers approximately:
  - 20 Grand Prize winners (500K each)
  - 100 Match 5 winners (100K each)
  - Plus all lower tier prizes

Adjust based on expected draw frequency
```

**Command (send KPEPE to contract):**
```bash
# Transfer 10M KPEPE to lottery contract
# klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
```

**How to transfer:**
1. Use Klever wallet or CLI
2. Send `kpepe-1eod` tokens to lottery contract address
3. Verify balance with: `getKPEPEBalance()`

---

## 📊 Testing Setup (Testnet)

### Complete Test Sequence:

```javascript
// 1. Deploy contract with initial wallets
initializeWallets(
    'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',  // Project
    'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2'   // Prize Pool
)

// 2. Set KPEPE token
setKPEPEToken('kpepe-1eod')

// 3. Set KPEPE staking contract (if available)
setKPEPEStaking('klv1xxx...staking')

// 4. Configure prize amounts
setKPEPEPrizes(
    500000000000000,  // 500K jackpot
    100000000000000,  // 100K match5
    50000000000000,   // 50K
    25000000000000,   // 25K
    15000000000000,   // 15K
    10000000000000,   // 10K
    5000000000000,    // 5K
    2000000000000,    // 2K
    1000000000000     // 1K
)

// 5. Fund with testnet KPEPE tokens
// (Transfer 10M KPEPE to contract)

// 6. Test buying ticket with KLV
buyTicket([1, 2, 3, 4, 5], 10) payable(100*1e8)  // 1 KLV = 100 base units

// 7. Test free tickets (if staking ready)
claimFreeTickets()  // Should check staking balance

// 8. Test draw
startDraw()
completeDraw()  // Generates winners

// 9. Verify KPEPE was credited to winners
getPendingKPEPE(winner_address)  // Should show 500K KPEPE

// 10. Test claiming KPEPE prize
claimKPEPEPrize()  // Should transfer KPEPE to winner
```

---

## 🎫 How Free Tickets Work (After Fixes)

### User Flow:

```
1. User stakes 50K+ KPEPE on staking contract
   └─> Can claim free tickets for lottery

2. User visits lottery site
3. Clicks "Claim Free Tickets"
4. Contract calls staking contract:
   └─> getStake(user_address) → Returns staked amount

5. Contract verifies:
   ✅ Staked amount >= 50,000 KPEPE
   ✅ Not claimed in last 7 days
   ✅ Still within current draw period

6. Contract awards tickets based on tier:
   🥉 50K KPEPE → 3 free tickets
   🥇 200K KPEPE → 7 free tickets
   💎 500K KPEPE → 15 free tickets
   👑 1M KPEPE → 30 free tickets

7. User uses free tickets to play lottery
   └─> No KLV payment required
   └─> Same winning odds as paid tickets
   └─> Can win both KLV and KPEPE prizes
```

---

## 💰 How KPEPE Prizes Work

### Winner Distribution:

```
1. Draw is completed by owner
   └─> Contract generates winning numbers

2. Contract loops through all tickets
   └─> Calculates each player's tier

3. For each winner:
   ├─> Transfers KLV prize immediately
   │   └─> Money sent to player wallet
   │
   ├─> ✅ Calculates KPEPE prize
   │   ├─ Tier 1 (Jackpot) → 500K KPEPE
   │   ├─ Tier 2 (Match 5) → 100K KPEPE
   │   └─ ... (other tiers)
   │
   └─> Adds KPEPE to pending balance
       └─> kpepePrizesPending[player] += 500000

4. Winner calls claimKPEPEPrize()
   ├─> Contract checks pending balance
   ├─> Calls KPEPE token transfer
   └─> ✅ Sends 500K KPEPE to winner's wallet

Example: Jackpot winner gets:
  - KLV prize (40% of pool)
  - 500,000 KPEPE tokens (automatic)
```

---

## 🔍 Verification Commands

### Check Configuration:

```javascript
// Get KPEPE token address
getKPEPEToken()  // Should return: kpepe-1eod

// Get staking contract address
getKPEPEStaking()  // Should return: your-staking-contract

// Get KPEPE prize amounts
getKPEPEPrizes()  // Returns all 9 tier amounts

// Check contract KPEPE balance
getKPEPEBalance()  // Should show funding amount
```

### Check User Prizes:

```javascript
// Get pending KPEPE for a user
getPendingKPEPE('klv1xxx...user-address')

// Get all free tickets available
getFreeTicketsAvailable()  // Returns current user's free tickets

// Check ticket results
checkTicketResult(ticket_id)  // Returns (tier, prize_amount)
```

---

## ⚠️ Important Notes

### KPEPE Token Requirements:

1. **Token address must be correct:**
   - Mainnet: `kpepe-1eod`
   - Testnet: `kpepe-testnet-xxx` (adjust as needed)

2. **Contract must have sufficient KPEPE:**
   - Recommended: 10,000,000 KPEPE minimum
   - Add more as needed for additional draws
   - Monitor balance regularly

3. **Prize amounts in base units:**
   - 500K KPEPE = 500000 * 1e12 = 500000000000000
   - 100K KPEPE = 100000 * 1e12 = 100000000000000

### Staking Contract Requirements:

1. **Must have `getStake(address)` function:**
   ```javascript
   getStake(userAddress) → uint256  // Returns staked amount
   ```

2. **Must return amount in base units:**
   - If display unit is "1 KPEPE"
   - Base unit is "1e12" (like KLV)

3. **Return 0 if no stake:**
   - Users with no stake get rejected with "Insufficient stake" error

---

## 📋 Pre-Launch Checklist

### Configuration:
- [ ] KPEPE token address set: `kpepe-1eod`
- [ ] KPEPE staking contract address set (if available)
- [ ] Prize amounts configured (all 9 tiers)
- [ ] Contract funded with KPEPE tokens (10M+ recommended)

### Testing:
- [ ] Test buying tickets with KLV (should deduct 15%/85%)
- [ ] Test free tickets (if staking available)
- [ ] Test draw completion
- [ ] Test KPEPE prize distribution
- [ ] Test KPEPE claiming

### Mainnet Deployment:
- [ ] All settings verified on testnet
- [ ] KPEPE funding transferred to contract
- [ ] Announce to users with setup confirmation

---

## 🚀 Deployment Command Reference

### All-in-One Setup (after contract deployment):

```javascript
// 1. Initialize wallets (one-time)
initializeWallets(
    'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
    'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2'
)

// 2. Set KPEPE token
setKPEPEToken('kpepe-1eod')

// 3. Set staking contract (when ready)
setKPEPEStaking('klv1xxx...staking-contract')

// 4. Configure all prize amounts
setKPEPEPrizes(
    500000000000000,
    100000000000000,
    50000000000000,
    25000000000000,
    15000000000000,
    10000000000000,
    5000000000000,
    2000000000000,
    1000000000000
)

// 5. Fund contract with KPEPE (send tokens separately)

// 6. Verify setup
getKPEPEToken()           // Should show kpepe-1eod ✅
getKPEPEStaking()         // Should show staking address ✅
getKPEPEBalance()         // Should show funding amount ✅
```

---

## 📞 Support

**Questions?**
- KPEPE token address: `kpepe-1eod` ✅
- Prize pool funding: Will receive KPEPE deposits ✅
- Free tickets: Fixed with staking verification ✅
- Auto-distribution: 500K KPEPE to jackpot winners ✅

**Status:** 🟢 **READY FOR DEPLOYMENT**
