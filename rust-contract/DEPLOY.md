# KPEPE Jackpot - Rust Deployment Guide

## Prerequisites

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Install wasm32-unknown-unknown Target
```bash
rustup target add wasm32-unknown-unknown
```

### 3. Install Klever VM SDK
```bash
cargo install cargo-klever  # Or clone from GitHub
```

## Build the Contract

### 1. Navigate to Rust Contract Directory
```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign/rust-contract
```

### 2. Build Release
```bash
cargo build --release --target wasm32-unknown-unknown
```

### 3. The WASM file will be at:
```
target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm
```

## Deploy to KleverChain

### Option 1: KleverScan Web Interface

1. Go to: https://kleverscan.org/contracts
2. Click **"Deploy Contract"**
3. Upload the `.wasm` file
4. Set Gas Limit: **3,000,000**
5. Connect your Klever Wallet
6. Confirm deployment

### Option 2: Using Klever CLI

```bash
# Install Klever CLI
npm install -g @klever/cli

# Deploy
klever deploy --wasm target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm \
  --gas-limit 3000000 \
  --gas-price 1000000
```

### Option 3: Using Klever SDK (Node.js)

```javascript
const Klever = require('@klever/sdk');
const fs = require('fs');

async function deploy() {
    const klever = await Klever.init({
        mnemonic: 'YOUR 24 WORD MNEMONIC'
    });
    
    const wasm = fs.readFileSync('./target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm');
    
    const deployed = await klever.deployContract(wasm, {
        gasLimit: 3000000,
        gasPrice: 1000000
    });
    
    console.log('Contract deployed at:', deployed.address);
}

deploy();
```

## Post-Deployment Setup

After deployment, call these functions via KleverScan:

### 1. Initialize Wallets
```
Function: initializeWallets
Parameters:
  - project_wallet: YOUR_PROJECT_WALLET_ADDRESS
  - prize_pool_wallet: YOUR_PRIZE_POOL_WALLET_ADDRESS
```

### 2. Set KPEPE Token Address
```
Function: setKpepeToken
Parameters:
  - token: KPEPE_TOKEN_ADDRESS
```

### 3. Set KPEPE Staking Contract
```
Function: setKpepeStaking
Parameters:
  - staking: KPEPE_STAKING_ADDRESS
```

### 4. Set Prize Amounts
```
Function: setKpepePrizes
Parameters:
  - j: JACKPOT_AMOUNT (e.g., 1000000000000 for 10,000 KPEPE)
  - m5: MATCH_5_AMOUNT
  - m48: MATCH_4_8B_AMOUNT
  - m4: MATCH_4_AMOUNT
  - m38: MATCH_3_8B_AMOUNT
  - m3: MATCH_3_AMOUNT
  - m28: MATCH_2_8B_AMOUNT
  - m18: MATCH_1_8B_AMOUNT
  - m8: MATCH_8B_ONLY_AMOUNT
```

## Contract Functions

### User Functions
- `buyTicket(nums: [u8; 5], eb: u8)` - Buy ticket with numbers
- `quickPick()` - Random ticket purchase
- `commitTicket(commitHash: Hash)` - Commit phase (anti-frontrun)
- `revealTicket(nums, eb, salt)` - Reveal phase
- `claimFreeTickets()` - Claim daily free ticket
- `claimPrize(ticketId: u64)` - Claim prize
- `claimKpepePrize()` - Claim KPEPE token prize

### Owner Functions
- `startDraw()` - Start daily draw
- `completeDraw()` - Complete draw and distribute prizes
- `initializeWallets(project, prizePool)` - Set wallets
- `setKpepeToken(address)` - Set token
- `setKpepeStaking(address)` - Set staking
- `toggleRound()` - Pause/resume ticket sales
- `setKpepePrizes(...)` - Set prize amounts
- `withdrawPrizePool(amount)` - Withdraw (max 10%)

### View Functions
- `getPoolBalance()` - View current prize pool
- `getNextDrawTime()` - When next draw occurs
- `getTicket(id)` - View ticket details
- `getPoolBalance` - Read-only pool balance

## Security Features

✓ **Reentrancy Guard** - All state-changing functions protected
✓ **Commit-Reveal Scheme** - Prevents frontrunning on ticket purchases
✓ **Secure RNG** - Cryptographically secure random number generation
✓ **Access Control** - Owner functions properly protected
✓ **Max Pool Cap** - Prevents infinite prize growth (1M KLV)
✓ **Withdrawal Limit** - Owner can only withdraw 10% of pool

## Testing

Before deploying to mainnet:

1. **Testnet First**
   - Deploy to Klever testnet
   - Test all functions
   - Verify prize distribution

2. **Security Audit**
   - Review code for vulnerabilities
   - Consider professional audit

3. **Gas Optimization**
   - Monitor deployment costs
   - Optimize if needed

## Files

```
klevertepepe-redesign/
├── rust-contract/
│   ├── Cargo.toml          # Dependencies
│   └── src/
│       └── lib.rs          # Contract source
├── contracts/
│   └── KPEPEJackpot.js     # JavaScript reference
├── test-contract.js        # Test suite
└── DEPLOY_RUST.md          # This file
```

## Support

- Klever Docs: https://docs.klever.org
- Klever GitHub: https://github.com/klever-io
- KleverScan: https://kleverscan.org
