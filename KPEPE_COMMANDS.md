# KPEPE Lottery - Quick Command Reference

---

## 🚀 SETUP (2 Commands Only!)

### Command 1: Set Jackpot Prize
```javascript
setKPEPEJackpot(500000000000000)
```
**What it does:** Sets 500K KPEPE for grand prize winners  
**Result:** ✅ Jackpot configured

### Command 2: Set Withdrawal Wallet  
```javascript
setWithdrawalWallet('klv1xxx...your-wallet-address')
```
**What it does:** Sets wallet for managing funds  
**Result:** ✅ Fund management configured

### Command 3: Fund Contract (Manual)
```
Send 500,000 KPEPE to:
klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
```
**What it does:** Provides KPEPE for jackpot prizes  
**Result:** ✅ Funded and ready to operate

---

## 📊 SYSTEM AT A GLANCE

### Free Tickets
```
Requirement:    50,000 KPEPE staked (minimum)
Claim Limit:    1 ticket per day
Expiration:     Before daily draw
Command:        claimFreeTicket()
```

### KPEPE Prizes  
```
Tier 1 Only:    500,000 KPEPE for jackpot (5+8B)
All Other:      Paid from KLV pool
Auto-Credited:  On draw completion
Claim:          claimKPEPEPrize()
```

### KLV Prizes
```
All 9 Tiers:    Distributed from KLV pool
Distribution:   Automatic ✅
Timing:         Immediately on draw
Amount:         By tier percentage
```

---

## ✅ VERIFICATION COMMANDS

```javascript
// Check configuration
getKPEPEJackpot()        → Should show: 500000000000000
getWithdrawalWallet()    → Should show: your wallet address
getKPEPEBalance()        → Should show: 500000000000000+

// Check user status
getPendingKPEPE(user)    → KPEPE waiting to claim
getFreeTicketsAvailable()→ Daily tickets available

// Check results
checkTicketResult(id)    → (tier, prize_amount)
getPoolBalance()         → Current KLV in pool
```

---

## 🎯 COMPLETE SETUP FLOW

```
1. setKPEPEJackpot(500000000000000)
   ↓
2. setWithdrawalWallet('klv1xxx...')
   ↓
3. Send 500K KPEPE to contract
   ↓
4. getKPEPEBalance() → verify ✅
   ↓
5. Ready to operate! 🚀
```

**Total time: ~5 minutes**

---

## 💰 NUMBERS TO REMEMBER

| What | Value |
|------|-------|
| KPEPE Token | kpepe-1eod |
| Jackpot Prize | 500,000 KPEPE |
| Minimum Fund | 500,000 KPEPE |
| Free Ticket Min | 50,000 KPEPE staked |
| Daily Claims | 1 ticket max |
| Revenue Split | 15% / 85% |
| Ticket Price | 1 KLV |

---

## 📋 DAILY OPERATIONS

### For Users:

**Staker claiming free ticket:**
```javascript
claimFreeTicket()  // Get 1 ticket for today
```

**After draw, if won:**
```javascript
claimKPEPEPrize()  // Only if jackpot winner
```
(KLV prizes auto-transfer)

### For Owner:

**Monitor KPEPE balance:**
```javascript
getKPEPEBalance()  // Must stay > 500K
```

**Withdraw excess:**
```javascript
// Use withdrawal wallet address
// Manual transfer from contract
```

---

## 🔄 USER EXPERIENCE

### Daily User Journey:

```
Day 1:
├─ claimFreeTicket() → Receive 1 ticket
├─ Play lottery
└─ Draw happens (ticket expires)

Day 2:
├─ claimFreeTicket() → Receive 1 new ticket
├─ Play lottery
└─ Draw happens (ticket expires)

... repeat daily
```

### If User Wins Jackpot:

```
On Draw:
├─ KLV prize auto-transferred ✅
└─ 500K KPEPE added to pending

Later:
├─ claimKPEPEPrize()
└─ 500K KPEPE transferred ✅
```

---

## 🚨 IMPORTANT REMINDERS

⚠️ **KPEPE Balance:** Monitor before each draw  
⚠️ **Fund Limit:** Keep 500K+ in contract  
⚠️ **Withdrawal:** Use setWithdrawalWallet for management  
⚠️ **Free Tickets:** Expires at draw time  
⚠️ **Daily Only:** 1 ticket per user per day  

---

## 📞 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| "Insufficient stake" | User needs 50K+ KPEPE staked |
| "Already claimed" | Wait 24 hours for cooldown |
| "Ticket expired" | Must claim before draw time |
| No KPEPE showing | Check getKPEPEBalance() |
| "Not jackpot winner" | Only tier 1 gets KPEPE |

---

## 🎉 LAUNCH CHECKLIST

- [ ] `setKPEPEJackpot(500000000000000)`
- [ ] `setWithdrawalWallet('your-wallet')`
- [ ] Send 500K KPEPE
- [ ] `getKPEPEBalance()` confirms funding
- [ ] Test: Buy ticket → Draw → Claim
- [ ] Documentation shared
- [ ] Go live!

---

**That's it! You're ready to launch.** ✅

More details? Read: [KPEPE_SIMPLIFIED_SETUP.md](KPEPE_SIMPLIFIED_SETUP.md)
