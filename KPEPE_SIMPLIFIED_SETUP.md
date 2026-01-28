# KPEPE Lottery - Simplified Configuration

**Updated:** January 28, 2026  
**Status:** ✅ **SIMPLIFIED & PRODUCTION READY**

---

## 🎯 Simplified System (User Request)

### Free Tickets: ONE TIER ONLY
```
Staking Requirement: 50,000 KPEPE minimum
Daily Claim: 1 free ticket per day
Expiration: Before daily draw (use it or lose it)
Cooldown: 1 day between claims
```

### KPEPE Prizes: JACKPOT ONLY
```
Grand Prize (5 Main + 8-Ball): 500,000 KPEPE 🏆
All Other Tiers (2-9): PAID FROM KLV POOL
```

### KLV Prizes: AUTOMATIC DISTRIBUTION ✅
```
All prizes automatically transferred to winners
No manual payouts needed
Prize pool covers all rewards
```

### Fund Management
```
Withdrawal Wallet: Can withdraw KPEPE/KLV as needed
Set via: setWithdrawalWallet('wallet_address')
```

---

## 🚀 Setup Steps (2 Commands Only!)

### Step 1: Set KPEPE Jackpot Prize
```javascript
setKPEPEJackpot(500000000000000)  // 500K KPEPE
```

### Step 2: Set Withdrawal Wallet (for fund management)
```javascript
setWithdrawalWallet('klv1xxx...your-management-wallet')
```

### Step 3: Fund Contract with KPEPE
```
Send: 500,000 KPEPE minimum (for jackpot winners)
To: klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
Token: kpepe-1eod
```

**That's it! System is ready to use.** ✅

---

## 📊 How the System Works Now

### For Ticket Buyers:

```
User Action               KLV Flow
─────────────────────────────────────
1. Buy 1 ticket → Pay 1 KLV
                ├─ 0.15 KLV → Project wallet
                └─ 0.85 KLV → Prize pool

2. Draw completes
   ├─ Each winner gets KLV prize (auto-transferred)
   └─ Jackpot winner also gets 500K KPEPE
```

### For Free Ticket Claimers (50K+ KPEPE stakers):

```
Daily Action              Ticket Status
─────────────────────────────────────
1. Claim free ticket → Receive 1 ticket
   (once per day, max)
   
2. Use ticket before draw
   └─ Can play lottery with it

3. Draw happens
   └─ Ticket expires (must claim daily)
   
4. Next day: Claim another ticket
   └─ Repeat process
```

### On Draw Completion (Automatic):

```
Contract Actions:
├─ Generate winning numbers
├─ Check all tickets against winning numbers
├─ For each winner:
│  ├─ Transfer KLV prize immediately ✅ AUTO
│  └─ If jackpot: Credit 500K KPEPE pending
└─ Emit events

Winner Actions:
├─ Claim KLV: Already received ✅
└─ If jackpot winner: claimKPEPEPrize()
   └─ Receive 500K KPEPE
```

---

## 💰 Prize Distribution

### All 9 Tiers (All paid from KLV pool - AUTOMATIC)

| Tier | Condition | Prize |
|------|-----------|-------|
| 1 | 5 Main + 8-Ball | **40%** of pool + 500K KPEPE 🏆 |
| 2 | 5 Main Numbers | **15%** of pool |
| 3 | 4 Main + 8-Ball | **8%** of pool |
| 4 | 4 Main Numbers | **5%** of pool |
| 5 | 3 Main + 8-Ball | **6%** of pool |
| 6 | 3 Main Numbers | **4.5%** of pool |
| 7 | 2 Main + 8-Ball | **3%** of pool |
| 8 | 1 Main + 8-Ball | **1.5%** of pool |
| 9 | 8-Ball Only | **1.25%** of pool |

**All percentages = Automatic KLV transfer ✅**

---

## 🔧 Configuration Commands Reference

### Essential Commands:

```javascript
// 1. Set jackpot ONLY (no other KPEPE tiers)
setKPEPEJackpot(500000000000000)  // 500K KPEPE

// 2. Set withdrawal wallet
setWithdrawalWallet('klv1xxx...your-wallet')

// 3. Set KPEPE token (if not already set)
setKPEPEToken('kpepe-1eod')

// 4. Set staking contract (when ready)
setKPEPEStaking('klv1xxx...staking-contract')
```

### Verification Commands:

```javascript
// Check configuration
getKPEPEJackpot()        // Should show: 500K KPEPE
getWithdrawalWallet()    // Should show: wallet address
getKPEPEBalance()        // Should show: 500K+ tokens

// Check user status
getPendingKPEPE(user_address)   // KPEPE waiting to claim
getFreeTicketsAvailable()       // Daily ticket for 50K stakers

// Check draw results
checkTicketResult(ticket_id)    // Returns (tier, prize_amount)
```

---

## 📋 Pre-Launch Checklist

### Configuration:
- [ ] Call `setKPEPEJackpot(500000000000000)`
- [ ] Call `setWithdrawalWallet('klv1xxx...')`
- [ ] Send 500K+ KPEPE to contract
- [ ] Verify `getKPEPEBalance()` > 500K

### Testing:
- [ ] Buy test ticket (1 KLV)
- [ ] Verify revenue split (0.15 + 0.85 = 1.0)
- [ ] Run test draw
- [ ] Verify KLV prize auto-transferred
- [ ] If jackpot winner: Test `claimKPEPEPrize()`

### Staking Integration (Optional):
- [ ] Have staking contract deployed
- [ ] Know contract address
- [ ] Call `setKPEPEStaking(address)`
- [ ] Test free ticket claiming

### Launch:
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Go live! 🚀

---

## ✅ What's Automatic vs Manual

### ✅ AUTOMATIC (Contract Handles It):
- ✅ KLV prize transfers (all tiers)
- ✅ KPEPE tracking (jackpot winners)
- ✅ Draw results calculation
- ✅ Ticket verification
- ✅ Revenue split (15%/85%)

### ⏳ MANUAL (You Need To Do):
- ⏳ Claim free tickets (if 50K+ staker)
- ⏳ Claim KPEPE prize (if jackpot winner)
- ⏳ Set withdrawal wallet (for management)
- ⏳ Monitor KPEPE balance

---

## 🎯 Key Numbers

```
KPEPE Token:        kpepe-1eod
Contract Address:   klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
Project Wallet:     klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
Prize Pool Wallet:  klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2

Staking Minimum:    50,000 KPEPE
Free Tickets:       1 per day (expires before draw)
Jackpot Prize:      500,000 KPEPE (automatic to winners)
Minimum KPEPE Fund: 500,000 (can add more for multiple jackpots)
```

---

## 💡 Examples

### Example 1: Winning Tier 2 (Match 5 Numbers)

```
Draw Results:  5, 12, 23, 34, 47 (8-Ball: 8)
Your Ticket:   5, 12, 23, 34, 47 (8-Ball: 15) ❌ Wrong 8-Ball

Prize Pool: 10,000 KLV
Tier 2 Prize: 15% = 1,500 KLV

✅ Result: 1,500 KLV automatically transferred to your wallet
(No KPEPE - only jackpot gets KPEPE)
```

### Example 2: Winning Jackpot (Tier 1)

```
Draw Results:  5, 12, 23, 34, 47 (8-Ball: 8)
Your Ticket:   5, 12, 23, 34, 47 (8-Ball: 8) ✅ Perfect match!

Prize Pool: 100,000 KLV
Tier 1 Prize: 40% = 40,000 KLV

✅ Results:
├─ 40,000 KLV automatically transferred to wallet
├─ 500,000 KPEPE added to pending
└─ Call claimKPEPEPrize() to get KPEPE
```

### Example 3: Free Ticket (50K KPEPE Staker)

```
Day 1:
├─ You have 50K KPEPE staked
├─ Call claimFreeTicket()
└─ Receive 1 free ticket

Day 1 (before draw):
└─ Use the free ticket to play

Day 1 (draw happens):
└─ Ticket expires (you must claim daily)

Day 2:
├─ Call claimFreeTicket() again
└─ Receive 1 new free ticket
```

---

## 🚨 Important Notes

### KPEPE Funding:
- Minimum: 500,000 KPEPE (for 1 jackpot winner)
- Recommended: 1,000,000+ KPEPE (for multiple jackpot winners)
- Monitor: Check balance before each draw
- Refill: Use withdrawal wallet to manage funds

### KLV Automatic Distribution:
- ✅ NO manual work needed
- ✅ All 9 tiers auto-transferred
- ✅ Happens on draw completion
- ✅ Winners see KLV in wallet immediately

### Free Tickets:
- Exactly 1 ticket per day
- Must be claimed before draw
- Expires after draw (can't carry over)
- Requires 50K KPEPE staked

---

## 📞 Summary

**What you need to do:**
1. Call `setKPEPEJackpot(500000000000000)`
2. Call `setWithdrawalWallet('your-wallet')`
3. Send 500K+ KPEPE to contract
4. Test and launch

**What the contract does automatically:**
- Transfers all KLV prizes (tiers 1-9)
- Tracks KPEPE jackpot (tier 1 only)
- Handles revenue split
- Manages draws
- Processes claims

**Status:** 🟢 **READY FOR PRODUCTION**
