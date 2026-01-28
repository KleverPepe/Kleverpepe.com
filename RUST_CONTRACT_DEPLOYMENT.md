# KPEPE Lottery Smart Contract - Deployment Guide

## ✅ BUILD SUCCESSFUL!

**Contract File**: `kpepe-jackpot.wasm` (13 KB)  
**Location**: `/Users/chotajarvis/clawd/klevertepepe-redesign/kpepe-jackpot.wasm`  
**Platform**: KleverChain Mainnet (Klever Virtual Machine)  
**Language**: Rust (compiled to WebAssembly)

---

## Contract Details

### Endpoints

**Owner Functions:**
- `init()` - Initialize contract
- `initializeWallets()` - Set project and prize pool wallets
- `toggleRound()` - Open/close ticket sales
- `startDraw()` - Begin drawing process
- `completeDraw(n1, n2, n3, n4, n5, eb)` - Set winning numbers
- `withdraw(amount)` - Withdraw from project wallet

**User Functions:**
- `buyTicket(n1, n2, n3, n4, n5, eb)` - Purchase ticket for 100 KLV
  - Numbers 1-5: Range 1-50
  - Eight Ball (eb): Range 1-20
- `claimPrize(ticket_id)` - Claim winnings

**View Functions:**
- `getPool()` - Current prize pool size
- `getNextDraw()` - Next draw timestamp
- `getWinning()` - Winning numbers (1-5)
- `getWinningEb()` - Winning Eight Ball
- `getTotal()` - Total tickets sold
- `isActive()` - Round open/closed
- `isDrawing()` - Draw in progress

### Prize Structure

| Match | Prize % |
|-------|---------|
| 5 + EB | 40% (Jackpot) |
| 5 + no EB | 15% |
| 4 + EB | 8% |
| 4 + no EB | 5% |
| 3 + EB | 6% |
| 3 + no EB | 4.5% |
| 2 + EB | 3% |
| 1 + EB | 1.5% |
| 0 + EB | 1.25% |

### Payment Distribution

Per 100 KLV ticket:
- 85 KLV → Prize Pool (85%)
- 15 KLV → Project Wallet (15%)

---

## Deployment Steps

### Option 1: KleverScan (Recommended)

1. **Visit KleverScan**
   ```
   https://kleverscan.org/contracts
   ```

2. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve connection with Klever Extension

3. **Upload Contract**
   - Click "Deploy Contract"
   - Upload: `kpepe-jackpot.wasm`
   - Set Gas Limit: **5,000,000**
   - Click "Deploy"

4. **Sign Transaction**
   - Confirm in Klever Extension
   - Wait for confirmation (~10 seconds)

5. **Get Contract Address**
   - Copy the deployed contract address
   - Format: `klv1...` (62 characters)

### Option 2: Klever SDK (Programmatic)

```javascript
const { TransactionType } = require('@klever/sdk');
const fs = require('fs');

const wasmCode = fs.readFileSync('kpepe-jackpot.wasm');
const base64Code = wasmCode.toString('base64');

const payload = {
  type: TransactionType.DeployContract,
  payload: {
    contractCode: base64Code,
    scType: 0, // VM type
    gasLimit: 5000000
  }
};

// Send transaction using Klever SDK
// See deploy-contract-programmatic.js for full implementation
```

---

## Post-Deployment Setup

### Step 1: Initialize Wallets

Call `initializeWallets()` with:
- **Project Wallet**: Your fee collection address
- **Gas**: 1,000,000

### Step 2: Configure Environment

Update `.env` in your project:
```env
CONTRACT_ADDRESS=klv1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NETWORK=mainnet
```

### Step 3: Restart Services

```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign
pm2 restart kpepe-signing-server
```

### Step 4: Test Integration

```bash
# Test ticket purchase
curl -X POST http://localhost:3001/buy-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "klv1...",
    "numbers": [5, 12, 23, 34, 45],
    "eightBall": 7
  }'
```

---

## Contract Verification

### Check Contract Status

Visit: `https://kleverscan.org/account/[CONTRACT_ADDRESS]`

Should show:
- ✅ Contract Type: Smart Contract
- ✅ SC Type: VM (KleverChain Virtual Machine)
- ✅ Balance: 0 KLV (initially)
- ✅ Code: kpepe-jackpot.wasm

### View Contract Code

```bash
# Download and verify
curl "https://api.kleverscan.org/v1.0/contracts/[ADDRESS]" | jq
```

---

## Monitoring

### Prize Pool

```bash
# Get current pool
curl "https://api.kleverscan.org/v1.0/vm/[CONTRACT]/query/getPool"
```

### Active Status

```bash
# Check if round is active
curl "https://api.kleverscan.org/v1.0/vm/[CONTRACT]/query/isActive"
```

### Next Draw

```bash
# Get next draw timestamp
curl "https://api.kleverscan.org/v1.0/vm/[CONTRACT]/query/getNextDraw"
```

---

## Troubleshooting

### Deployment Fails

**Error**: "Gas limit exceeded"  
**Solution**: Increase gas limit to 10,000,000

**Error**: "Invalid contract code"  
**Solution**: Ensure you're uploading the `.wasm` file, not `.js`

**Error**: "Insufficient balance"  
**Solution**: Ensure deploying wallet has 10+ KLV for fees

### Function Calls Fail

**Error**: "Execution failed"  
**Solution**: Check function parameters match expected types

**Error**: "Unauthorized"  
**Solution**: Owner-only functions require contract deployer address

---

## Gas Costs (Estimated)

| Operation | Gas | KLV Cost |
|-----------|-----|----------|
| Deploy | 5,000,000 | ~0.5 KLV |
| Initialize | 1,000,000 | ~0.1 KLV |
| Buy Ticket | 500,000 | ~0.05 KLV |
| Claim Prize | 500,000 | ~0.05 KLV |
| Start Draw | 300,000 | ~0.03 KLV |
| Complete Draw | 300,000 | ~0.03 KLV |

---

## Support

- **KleverChain Docs**: https://docs.klever.org
- **Smart Contract Guide**: https://docs.klever.org/vm/
- **KleverScan**: https://kleverscan.org
- **Klever Support**: https://t.me/KleverExchange

---

## Build Information

**Built**: January 28, 2025  
**Rust Version**: 1.93.0  
**Klever SDK**: 0.45.0  
**Optimization**: -Oz, LTO enabled  
**Contract Size**: 13 KB (optimized)

