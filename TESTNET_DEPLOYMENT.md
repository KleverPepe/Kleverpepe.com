# KPEPE Jackpot - Testnet Deployment Guide

## Prerequisites

1. **Node.js** v18+ installed
2. **Hardhat** installed
3. **Testnet wallet** with KLV for deployment
4. **Klever SDK** (optional, for address conversion)

## Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

## Setup Environment

Create `.env` file:

```env
# Testnet (for testing)
TESTNET_MNEMONIC="your testnet wallet 12 word mnemonic here"

# Mainnet (for production)
MAINNET_MNEMONIC="your mainnet wallet 12 word mnemonic here"
```

## Deploy to Testnet

```bash
npm run testnet:deploy
```

This will:
1. ✅ Deploy KPEPE Jackpot contract to KleverChain testnet
2. ✅ Initialize wallets
3. ✅ Test ticket purchases (3 players)
4. ✅ Test invalid purchases (should revert)
5. ✅ Test draw process
6. ✅ Check winners and prize claims
7. ✅ Test owner functions
8. ✅ Run security tests

## Verify on KleverScan

```bash
npm run verify:testnet
```

## Deploy to Mainnet

```bash
# Update hardhat.config.js with mainnet RPC if needed
npm run mainnet:deploy
npm run verify:mainnet
```

## Contract Functions

### Anyone Can Call:
- `buyTicket(uint8[5] nums, uint8 eightBall)` - Buy ticket (100 KLV)
- `quickPick()` - Buy random ticket
- `claimPrize(uint256 ticketId)` - Claim winnings
- `claimKPEPEPrize()` - Claim KPEPE rewards
- `checkTicketResult(uint256 ticketId)` - Check ticket status

### Owner Only:
- `initializeWallets(addr project, addr pool)` - Set wallets (once)
- `setProjectWallet(addr)` - Change project wallet
- `setPrizePoolWallet(addr)` - Change prize wallet
- `setKPEPEToken(addr)` - Set KPEPE token
- `startDraw()` - Begin draw
- `completeDraw()` - Complete draw & pay winners
- `withdrawPrizePool(uint256 amount)` - Withdraw max 10% of pool
- `toggleRound()` - Pause/resume

## Security Features

✅ Reentrancy guard on prize distribution
✅ Blockhash-based randomness (not timestamp)
✅ Pool cap at 1M KLV
✅ Max 10% withdrawal per transaction
✅ OnlyOwner on all critical functions
✅ Safe KPEPE transfer with return check

## Troubleshooting

### "Insufficient funds"
- Get testnet KLV from KleverChain faucet

### "Only owner can call"
- Make sure you're using the deployer account

### Contract deployment fails
- Check network connectivity
- Verify gas limit is sufficient

### Can't verify on KleverScan
- Wait a few minutes after deployment
- Check contract is compiled with same version
