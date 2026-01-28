# KPEPE Lottery - Prize Pool Wallet Fund Management

**Updated:** January 28, 2026  
**Status:** ✅ **PRIZE POOL WALLET AS FUND MANAGER**

---

## 🏦 **New Fund Flow Architecture**

### **Prize Pool Wallet is Central Hub**

```
Prize Pool Wallet: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
├─ Receives: 85% of all ticket sales (KLV)
├─ Receives: 500,000 KPEPE (one-time funding)
└─ Distributes: Prizes to all winners (KLV + KPEPE)
```

---

## 📊 **Complete Revenue Flow**

### **STEP 1: User Buys Ticket**
```
User pays: 1 KLV
│
├─ 15% (0.15 KLV) → Project Wallet (klv19a7...)
│  └─ Project funding
│
└─ 85% (0.85 KLV) → Prize Pool Wallet (klv1zz5...)
   └─ Accumulates for prize distribution
```

### **STEP 2: Prize Pool Accumulates (80/20 Split)**
```
Prize Pool Wallet receives ticket sales (85% of payments)
│
├─ Draw happens
│
├─ 80% → Distributed to winners (KLV from pool)
│  ├─ All 9 tiers paid from pool
│  ├─ Winners get KLV directly
│  └─ Automatic transfer
│
└─ 20% → Rolls over to next draw (stays in pool)
   └─ Progressive jackpot grows
```

### **STEP 3: KPEPE Prizes (Jackpot Only)**
```
Jackpot Winner (Tier 1: 5 Main + 8-Ball)
│
├─ Gets KLV prize from pool (40% of pool)
│  └─ Automatic transfer from Prize Pool Wallet
│
├─ Gets 500K KPEPE bonus
│  ├─ Tracked by contract
│  ├─ Credited to pending balance
│  └─ Winner claims: claimKPEPEPrize()
│      └─ Transferred from Prize Pool Wallet (where 500K KPEPE is stored)
│
└─ Result: Winner receives both KLV + KPEPE
```

---

## 🔑 **Key Setup Instructions**

### **SEND 500K KPEPE TO PRIZE POOL WALLET**

```
FROM:     Your KPEPE wallet
TO:       klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
TOKEN:    kpepe-1eod
AMOUNT:   500,000 KPEPE
```

**NOT to the contract address!**

```
❌ WRONG: klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
✅ RIGHT: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
```

---

## 💰 **Fund Breakdown**

### **In Prize Pool Wallet**

```
KLV:   Accumulates from ticket sales (85% of each 1 KLV ticket)
       Example: 100 tickets sold = 85 KLV in pool

KPEPE: Fixed 500,000 KPEPE (one-time deposit)
       Distributed to jackpot winners
       As demand grows, can add more
```

### **Distribution Per Draw**

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
