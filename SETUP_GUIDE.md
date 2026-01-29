# KPEPE Jackpot - Complete Setup Guide

**For when you're at your computer (not phone)**

---

## Current Status

| Item | Status |
|------|--------|
| Contract Deployed | ✅ `klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d` |
| Website Live | ✅ https://kleverpepe.com/lottery/ |
| Contract NOT Initialized | ❌ Cannot buy tickets yet |

---

## Option 1: Quick Fix (5 minutes)

### Step 1: Open Browser with Klever Extension
Use Chrome or Brave with Klever Wallet extension installed and unlocked.

### Step 2: Go to KleverScan
```
https://kleverscan.org/contract/klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
```

### Step 3: Click "Write Contract" or "Interact"

### Step 4: Call These Functions

| Function | Parameter |
|----------|-----------|
| `initialize_wallets` | Your wallet address (same in both fields) |
| `set_kpepe_token` | `klv1qqqqqqqqqqqqqpgq6xv6kjc603gys4l2jma9szhujxjmnlhnud2s7lwyhl` |
| `toggle_round` | (none) |

---

## Option 2: Deploy New Contract (15 minutes)

If the above doesn't work, deploy a fresh Rust contract:

### Step 1: Open VS Code
```bash
open -a "Visual Studio Code"
```

### Step 2: Open Project
- File → Open
- Select: `/Users/chotajarvis/clawd/klevertepepe-redesign/rust-contract`

### Step 3: Deploy via Klever IDE
1. Click **Klever icon** in sidebar
2. Click **"Deploy Contract"**
3. Select: `src/lib.rs`
4. Gas: **3000000**
5. Click **"Deploy"**

### Step 4: Copy New Address
- Get the new contract address from the output

### Step 5: Update Website
```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign
```
Edit `lottery/index.html` line 610:
```
CONTRACT_ADDRESS = "NEW_ADDRESS_HERE"
```

### Step 6: Push to GitHub
```bash
git add lottery/index.html
git commit -m "Update contract address"
git push origin main
```

### Step 7: Netlify Auto-Deploy
- Website will update automatically

---

## Wallet Address to Use

**Your KLV address:**
```
klv1a84816aaa16a7d0ed57b012526dcd0d0692d02
```

---

## Contract Address

```
klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
```

**KleverScan:** https://kleverscan.org/contract/klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d

---

## After Initialization

✅ Users can buy tickets (100 KLV each)
✅ Winners get paid automatically when you call `complete_draw`
✅ 85% to prize pool, 15% to project wallet

---

*Guide created: 2026-01-28*
