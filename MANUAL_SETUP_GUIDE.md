# Manual Revenue Split Setup Guide

## Overview
You need to execute 2 contract calls as the contract owner to:
1. Initialize the project wallet
2. Withdraw accumulated 30 KLV revenue (15% from 2 ticket sales)

---

## Method 1: Using KleverScan (Recommended)

### Step 1: Initialize Project Wallet

1. Go to: https://kleverscan.org/account/klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
2. Click on **"Write Contract"** tab
3. Connect your owner wallet
4. Find function: **`initialize_wallets`**
5. Enter parameter:
   - **project_wallet**: `klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9`
6. Click **"Write"** and approve the transaction

### Step 2: Withdraw Accumulated Revenue

1. Stay on the same page (Write Contract tab)
2. Find function: **`withdraw`**
3. Enter parameter:
   - **amount**: `30000000` (30 KLV with 6 decimal precision)
4. Click **"Write"** and approve the transaction

---

## Method 2: Using Klever CLI

### Prerequisites
```bash
npm install -g @klever/sdk-node
```

### Step 1: Initialize Wallet
```bash
klever-cli contract invoke \
  --contract klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d \
  --function initialize_wallets \
  --args "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9" \
  --from YOUR_OWNER_ADDRESS
```

### Step 2: Withdraw Revenue
```bash
klever-cli contract invoke \
  --contract klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d \
  --function withdraw \
  --args "30000000" \
  --from YOUR_OWNER_ADDRESS
```

---

## Method 3: Using Klever Extension (If Installed)

1. Install Klever Extension: https://chrome.google.com/webstore
2. Open: `lottery/setup-wallet.html`
3. Click "Connect Klever Extension"
4. Follow the automated 2-step process

---

## Verification

After completing both transactions, verify:

1. **Check Project Wallet Balance**:
   - Visit: https://kleverscan.org/account/klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
   - Should show +30 KLV received

2. **Test Automatic Split**:
   - Buy a new ticket (100 KLV)
   - Contract should automatically send:
     - 85 KLV → Prize Pool
     - 15 KLV → Project Wallet

---

## Summary

**Current State:**
- 2 tickets sold = 200 KLV in contract
- Prize pool: 170 KLV (85%)
- Unclaimed revenue: 30 KLV (15%)

**After Setup:**
- Project wallet initialized ✓
- 30 KLV withdrawn ✓
- Future tickets auto-split ✓

---

## Contract Details

- **Contract Address**: `klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d`
- **Project Wallet**: `klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9`
- **Network**: KleverChain Mainnet (Chain ID: 100)

---

## Need Help?

If you encounter issues:
1. Ensure you're using the contract owner wallet
2. Check wallet has enough KLV for gas fees (~0.1 KLV)
3. Verify network is KleverChain Mainnet
4. Check transaction status on kleverscan.org
