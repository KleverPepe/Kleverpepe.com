# KPEPE Jackpot Lottery - Mainnet Deployment Guide

## ⚠️ BEFORE DEPLOYING TO MAINNET

1. ✅ Contract tested on local Hardhat network
2. ✅ Contract tested on KleverChain testnet (if available)
3. ✅ All security vulnerabilities fixed
4. ✅ KPEPE token address confirmed
5. ✅ Wallet addresses verified
6. ✅ Sufficient KLV for deployment gas

## DEPLOYMENT CHECKLIST

### 1. Environment Setup

```bash
# Clone and install
cd /Users/chotajarvis/clawd/klevertepepe-redesign
npm install

# Create .env from example
cp .env.example .env

# Edit .env with your mainnet info
nano .env
```

### 2. Configure .env

```env
# Mainnet Wallet Mnemonic (12-word seed)
MAINNET_MNEMONIC=your 12 word mnemonic here

# KPEPE Token Address
KPEPE_TOKEN_ADDRESS=0x... (get from Kleverscan)

# Project Wallet (converted to hex)
PROJECT_WALLET_HEX=0x...
PRIZE_POOL_WALLET_HEX=0x...
```

### 3. Convert KLV Addresses to Hex

KleverChain uses "klv1..." format but Solidity needs hex:
- Go to: https://kleverscan.org/address-converter
- Enter: `klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9`
- Copy the hex address to `.env`

### 4. Compile Contract

```bash
npm run compile
```

### 5. Deploy to Mainnet

```bash
npm run mainnet:deploy
```

### 6. Verify on KleverScan

```bash
npx hardhat verify --network kleverMainnet <CONTRACT_ADDRESS>
```

### 7. Update Frontend

Edit `kpepe-lottery-deploy/index.html`:
```javascript
const CONTRACT_ADDRESS = "0xDeployedAddress...";
const KPEPE_TOKEN_ADDRESS = "0xKPEPEAddress...";
```

Then commit and push:
```bash
cd /Users/chotajarvis/clawd/kpepe-lottery-deploy
git add index.html
git commit -m "Update: Contract address for mainnet"
git push origin gh-pages
```

## CONTRACT ADDRESSES

| Item | Address |
|------|---------|
| Contract | `0x...` (after deployment) |
| KPEPE Token | `0x...` (from Kleverscan) |
| Project Wallet | `0x...` (from .env) |
| Prize Pool | `0x...` (from .env) |

## MAINNET CONTRACTS

After deployment, add verified contract links:

- **Lottery Contract**: https://kleverscan.org/address/YOUR_ADDRESS
- **KPEPE Token**: https://kleverscan.org/token/KPEPE-1EOD

## SECURITY CHECKLIST ✓

- [x] Reentrancy guard on prize distribution
- [x] Blockhash-based randomness (not timestamp)
- [x] Pool cap at 1M KLV
- [x] Max 10% withdrawal per transaction
- [x] OnlyOwner on all critical functions
- [x] Safe KPEPE transfer with return check
- [x] No duplicate setProjectWallet() vulnerability
- [x] No emergencyWithdrawAll() that steals pool

## FUNCTIONS REFERENCE

### Anyone Can Call:
- `buyTicket(uint8[5] nums, uint8 eb)` - Buy ticket (100 KLV)
- `quickPick()` - Buy random ticket
- `claimPrize(uint256 ticketId)` - Claim winnings
- `claimKPEPEPrize()` - Claim KPEPE rewards
- `checkTicketResult(uint256 ticketId)` - Check ticket status

### Owner Only:
- `initializeWallets(addr proj, addr pool)` - Set wallets (once)
- `setProjectWallet(addr)` - Change project wallet
- `setPrizePoolWallet(addr)` - Change prize wallet
- `setKPEPEToken(addr)` - Set KPEPE token
- `startDraw()` - Begin draw
- `completeDraw()` - Generate winners & pay
- `withdrawPrizePool(uint256 amount)` - Max 10% of pool
- `toggleRound()` - Pause/resume

## TROUBLESHOOTING

### "Insufficient funds"
- Get more KLV from exchange
- Reduce gas limit if possible

### "Only owner can call"
- Make sure you're using the deployer account
- Check .env MAINNET_MNEMONIC is correct

### "Transaction reverted"
- Check contract is verified on KleverScan
- Verify all parameters are correct

### Contract size warning
- Contract is ~24KB (under EIP-170 limit with optimizer)
- Should deploy fine on KleverChain

## NEXT STEPS

1. Announce launch on social media
2. Share contract address
3. Monitor pool growth
4. Schedule first draw
5. Engage with early players
