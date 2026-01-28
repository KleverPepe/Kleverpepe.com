# KPEPE Lottery - Contract-Based Fund Management

**Updated:** January 28, 2026  
**Status:** ✅ **CONTRACT AS FUND MANAGER (Path B)**

---

## 🏦 **Fund Flow Architecture**

### **Smart Contract Manages All Funds**

```
Smart Contract Address: klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
├─ Receives: All ticket payments (100 KLV each)
├─ Holds: Prize pool (85% of payments stored internally)
└─ Distributes: 15% project fee + all prizes (auto_distribute_prizes)
```

---

## 📊 **Complete Revenue Flow**

### **STEP 1: User Buys Ticket**
```
User pays: 100 KLV to contract
│
├─ 15 KLV → Project Wallet (klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9)
│  └─ Immediate transfer (sent from contract)
│
└─ 85 KLV → Contract Internal Pool
   └─ Stored in contract memory as prize_pool counter
   └─ Remains in contract balance for distribution
```

### **STEP 2: Prize Pool Accumulates in Contract**
```
Contract internal pool grows with each ticket
│
├─ Pool amount tracked in smart contract storage
│
├─ When draw happens
│
└─ auto_distribute_prizes() processes winners
   ├─ Calculates prizes based on stored pool amount
   └─ Sends prizes directly from contract balance
```

### **STEP 3: Prizes Distributed from Contract**
```
Winning Ticket
│
├─ Match Level Determined
│  └─ (5 matches + 8-ball, 5 matches, 4 + 8-ball, etc.)
│
├─ Prize Calculated from Pool
│  ├─ 5 Main + 8-Ball: 40% of pool
│  ├─ 5 Main: 15% of pool
│  ├─ 4 Main + 8-Ball: 8% of pool
│  └─ ... (9 tiers total)
│
└─ Sent from Contract Balance
   └─ direct_klv(&owner, &prize_amount)
```

---

## 🔑 **Key Setup Instructions**

### **No separate Prize Pool Wallet needed for KLV payouts**

The contract itself is the fund manager. All KLV flows through it:

```
✅ RIGHT: Contract holds all funds and manages distribution
❌ NOT USED: Prize pool wallet (klv1zz5...) for KLV transfers
```

---

## 💰 **Fund Breakdown**

### **In Contract Balance**

```
KLV:   Accumulates from ticket sales (85% of each 100 KLV ticket)
       Example: 100 tickets sold = 8,500 KLV in contract
       Used for: Prize distribution

Project Fee: 15% of each ticket sent immediately to project wallet
```

```
From Pool (80%):
├─ Jackpot winner:     40% of KLV pool
├─ Match 5 winner:     15% of KLV pool
├─ Match 4+8B:         8% of KLV pool
├─ Match 4:            5% of KLV pool
├─ Match 3+8B:         6% of KLV pool
├─ Match 3:            4.5% of KLV pool
├─ Match 2+8B:         3% of KLV pool
├─ Match 1+8B:         1.5% of KLV pool
└─ 8B Only:            1.25% of KLV pool

Plus if Jackpot:
├─ 500K KPEPE transferred from Prize Pool Wallet

Carry Forward (20%):
└─ Remains in Prize Pool Wallet for next draw
```

---

## ✅ **How It Works for Winners**

### **Winner Scenario 1: Match 5 (No KPEPE)**

```
Draw Results: 5, 12, 23, 34, 47 (8-Ball: 8)
Your Ticket: 5, 12, 23, 34, 47 (8-Ball: 15) ← Wrong 8-Ball

Prize Pool: 1,000 KLV (accumulated from sales)
Your Prize: 15% × 1,000 = 150 KLV

✅ Automatic: 150 KLV sent to your wallet from Prize Pool Wallet
```

### **Winner Scenario 2: Jackpot (KPEPE + KLV)**

```
Draw Results: 5, 12, 23, 34, 47 (8-Ball: 8)
Your Ticket: 5, 12, 23, 34, 47 (8-Ball: 8) ← Perfect match!

Prize Pool: 10,000 KLV (accumulated from sales)
Your KLV:   40% × 10,000 = 4,000 KLV
Your KPEPE: 500,000 KPEPE

✅ Automatic: 4,000 KLV sent to wallet from Prize Pool Wallet

⏳ Pending: 500K KPEPE credited to account
   
📱 Action: Call claimKPEPEPrize()

✅ Automatic: 500,000 KPEPE sent to wallet from Prize Pool Wallet
```

---

## 🔄 **Fund Flow Diagram**

```
┌─────────────────────────────────────────────────┐
│         USER BUYS LOTTERY TICKET                │
│              Pays 1 KLV                         │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
      15% (0.15 KLV)   85% (0.85 KLV)
         │                │
         ▼                ▼
    PROJECT WALLET   PRIZE POOL WALLET
    (klv19a7...)     (klv1zz5...)
                     ├─ KLV Accumulates
                     ├─ 500K KPEPE (stored)
                     └─ Ready to distribute
                          │
              ┌────────────┴───────────┐
              │                        │
          DRAW HAPPENS            DRAW HAPPENS
              │                        │
         80% paid out            20% rolls over
              │                        │
    ┌─────────┴─────────┐            │
    │                   │            │
  KLV Prizes         KPEPE Prize     Pool grows
  (tiers 2-9)        (jackpot only)  │
    │                   │            │
    ▼                   ▼            ▼
  WINNERS          JACKPOT WINNER  NEXT DRAW
  (auto)          (claim KPEPE)    (bigger pool)
```

---

## 📋 **Configuration Commands**

### **Only 2 Commands Needed!**

```javascript
// 1. Set jackpot KPEPE amount
setKPEPEJackpot(500000000000000)  // 500K KPEPE

// 2. Set withdrawal wallet (optional - for fund management)
setWithdrawalWallet('klv1xxx...management-wallet')
```

**Then send 500K KPEPE to Prize Pool Wallet (not contract!)**

---

## 🎯 **Important Addresses**

```
Contract:          klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
Project Wallet:    klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
Prize Pool Wallet: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2

SEND 500K KPEPE TO: ⬆️ Prize Pool Wallet (NOT contract)
```

---

## ✨ **Benefits of This Architecture**

✅ **Centralized Funding:** Prize Pool Wallet holds all prize funds  
✅ **Easy Management:** Monitor one wallet for all distributions  
✅ **Scalable:** Easy to add more KPEPE as demand grows  
✅ **Transparent:** All prizes come from Prize Pool Wallet  
✅ **Automatic:** Contract triggers distributions, wallet executes  
✅ **Secure:** Separation between contract and funds  

---

## 🚀 **Quick Start**

1. **Send 500K KPEPE to Prize Pool Wallet**
   ```
   To: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
   Token: kpepe-1eod
   Amount: 500,000
   ```

2. **Run setup commands:**
   ```javascript
   setKPEPEJackpot(500000000000000)
   ```

3. **Test buying ticket** - Prize distribution works automatically ✅

4. **Monitor Prize Pool Wallet** - Ensure it stays funded

---

## ⚠️ **Important Reminders**

🔴 **CRITICAL:** Send KPEPE to Prize Pool Wallet, NOT contract!

```
Prize Pool Wallet: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
Contract:         klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d

Send to: klv1zz5... ✅
DO NOT send to: klv1qqq... ❌
```

⚠️ **Monitor Balance:** Keep Prize Pool Wallet funded with:
- KLV: Automatically accumulates from ticket sales (85%)
- KPEPE: Monitor and refill as jackpot winners claim

---

## 📊 **Example: Multiple Draws**

```
DRAW 1:
├─ Ticket sales: 100 tickets × 1 KLV = 100 KLV
├─ To Prize Pool: 85 KLV
├─ To Project: 15 KLV
├─ Prize distribution: 68 KLV (80%)
├─ Rollover: 17 KLV (20%)
└─ KPEPE: If jackpot winner, 500K KPEPE sent

DRAW 2:
├─ Starting pool: 17 KLV (from Draw 1)
├─ Ticket sales: 120 tickets × 1 KLV = 120 KLV
├─ To Prize Pool: 102 KLV
├─ Total pool now: 119 KLV ← GREW!
├─ Prize distribution: 95.2 KLV (80%)
├─ Rollover: 23.8 KLV (20%)
└─ Progressive jackpot grows naturally
```

---

**Status:** 🟢 **PRODUCTION READY WITH PRIZE POOL WALLET AS FUND MANAGER**
