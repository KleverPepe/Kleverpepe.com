# 🚀 AUTO-INITIALIZED DEPLOYMENT GUIDE

Your contract is now configured to **automatically initialize everything** when you deploy it!

## What Happens Automatically:

When you deploy `kpepe-jackpot.wasm`, it will automatically:
- ✅ Set your project wallet address
- ✅ Initialize prize pool to 0
- ✅ Set draw interval to 24 hours
- ✅ Activate the lottery round
- ✅ Set ticket counter to 0

**No manual initialization needed!** The contract is ready to accept tickets immediately after deployment.

---

## Deployment Steps

### Option 1: KleverScan (Easiest - Recommended)

1. **Go to KleverScan**
   ```
   https://kleverscan.org/contracts
   ```

2. **Connect Your Wallet**
   - Click "Connect Wallet"
   - Approve the connection

3. **Deploy Contract**
   - Click "Deploy Contract" button
   - Upload: `kpepe-jackpot.wasm`
   - **IMPORTANT: Set Init Parameters**:
     ```
     Project Wallet: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
     ```
   - Set Gas Limit: `5,000,000`
   - Click "Deploy & Initialize"

4. **Confirm Transaction**
   - Sign in Klever Extension
   - Wait ~10 seconds for confirmation

5. **Copy Contract Address**
   - Will be format: `klv1qqq...`
   - Save this for your `.env` file

### Option 2: Programmatic Deployment (Advanced)

If you want to deploy via code, you'll need to encode the init parameter:

```javascript
const { web, TransactionType, utils } = require('@klever/sdk-web');
const fs = require('fs');

// Your project wallet address
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';

// Read the wasm file
const wasmCode = fs.readFileSync('kpepe-jackpot.wasm');
const base64Code = wasmCode.toString('base64');

// Encode the init parameter (Klever address to hex)
const initParams = [PROJECT_WALLET]; // Array of init parameters

const payload = {
  type: TransactionType.DeployContract,
  payload: {
    contractCode: base64Code,
    scType: 0, // VM type
    gasLimit: 5000000,
    initParams: initParams
  }
};

// Sign and broadcast using Klever SDK
// See deploy-with-init.js for full implementation
```

---

## After Deployment

### 1. Update Environment

Add the contract address to your `.env`:

```env
CONTRACT_ADDRESS=klv1qqq... # Your deployed contract address
PROJECT_WALLET=klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
PRIZE_POOL_WALLET=klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
NETWORK=mainnet
```

### 2. Restart Your Services

```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign

# Stop old server
pkill -f "node sign-transaction-server" 2>/dev/null

# Start new server
node sign-transaction-server.js &

# Or use PM2
pm2 restart kpepe-signing-server
```

### 3. Test Immediately

The contract is ready to use right away!

```bash
# Check if lottery is active
curl "https://api.kleverscan.org/v1.0/vm/YOUR_CONTRACT_ADDRESS/query/isActive"
# Should return: {"data": {"result": true}}

# Check prize pool
curl "https://api.kleverscan.org/v1.0/vm/YOUR_CONTRACT_ADDRESS/query/getPool"
# Should return: {"data": {"result": "0"}}

# Test buying a ticket through your website
# Should work immediately!
```

---

## What Changed from Before

### OLD Way (2-Step Process):
1. Deploy contract → Contract inactive
2. Call `initialize_wallets()` → Now ready

### NEW Way (1-Step Process):
1. Deploy with init params → **Contract ready immediately!** ✨

---

## Init Parameters Explained

The contract's `init` function now accepts:

```rust
fn init(&self, project_wallet: ManagedAddress)
```

**project_wallet**: The wallet that receives 15% of each ticket sale

On deployment, it automatically:
- Validates the wallet address (must not be zero address)
- Sets the project wallet
- Initializes prize pool to 0 KLV
- Sets draw interval to 86400 seconds (24 hours)
- Marks the round as active
- Sets total tickets to 0

---

## Verification

After deployment, verify everything is initialized:

```bash
# Replace CONTRACT_ADDRESS with your actual address
CONTRACT=klv1qqq...

# Check project wallet is set (should return your wallet)
curl "https://api.kleverscan.org/v1.0/vm/$CONTRACT/storage/project_wallet"

# Check lottery is active (should return true)
curl "https://api.kleverscan.org/v1.0/vm/$CONTRACT/query/isActive"

# Check prize pool exists (should return 0)
curl "https://api.kleverscan.org/v1.0/vm/$CONTRACT/query/getPool"
```

All three should return valid responses immediately after deployment!

---

## Troubleshooting

### "Invalid project wallet" Error
- Make sure you're passing a valid Klever address
- Must start with `klv1`
- Must be 62 characters long

### "Insufficient gas" Error
- Increase gas limit to 10,000,000
- The init function needs extra gas for the setup

### Contract Deploys but Not Active
- Check that you passed the init parameter
- Verify on KleverScan that the init transaction succeeded

---

## Support

- **Updated Contract**: `kpepe-jackpot.wasm` (13 KB)
- **Built**: January 28, 2025
- **Features**: Auto-initialization on deployment

Everything is now **one-click deployment**! 🎉

