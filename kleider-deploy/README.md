# KPEPE Jackpot - Klever IDE Complete Deployment

## Quick Start

### Option 1: Use the HTML Interface (Recommended)

1. Open `kleider-deploy/index.html` in a browser with Klever Wallet extension
2. Click "Connect Klever Wallet"
3. Click "Deploy Contract"
4. Initialize the contract

### Option 2: Manual Transaction Signing

If the HTML interface doesn't work, use these steps:

## Step 1: Deploy Contract

1. Go to https://kleverscan.org/smart-contracts
2. Click "Deploy Contract" or use Developer Tools
3. Copy bytecode from `bytecode.txt` (24KB file)
4. Deploy with your wallet (~50-100 KLV gas)

## Step 2: Initialize (After Deployment)

Use Klever Wallet Developer Tools to call these functions:

### Transaction 1: Initialize Wallets
```
Method: initializeWallets(address,address)
Params: 
  - 0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c
  - 0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c
Gas: 300000
```

### Transaction 2: Set KPEPE Token
```
Method: setKPEPEToken(address)
Params: 0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df
Gas: 300000
```

### Transaction 3: Set Jackpot Prize (Optional)
```
Method: setKPEPEPrizes(
  uint256 jackpot,
  uint256 match5,
  uint256 match4_8b,
  uint256 match4,
  uint256 match3_8b,
  uint256 match3,
  uint256 match2_8b,
  uint256 match1_8b,
  uint256 match8b_only
)
Params:
  - 500000000000000000000000 (500K KPEPE)
  - 0
  - 0
  - 0
  - 0
  - 0
  - 0
  - 0
  - 0
Gas: 300000
```

## Step 3: Verify Contract

1. Go to https://kleverscan.org/verify-signature
2. Enter contract address
3. Copy ABI from `abi.json`
4. Submit verification

## Files Reference

| File | Description |
|------|-------------|
| `bytecode.txt` | Full contract bytecode (24KB) |
| `abi.json` | Contract ABI for verification |
| `index.html` | Browser-based deployment UI |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment guide |

## Post-Deployment Checklist

- [ ] Contract deployed to mainnet
- [ ] Wallets initialized
- [ ] KPEPE token set
- [ ] Contract verified on KleverScan
- [ ] Frontend updated with contract address
- [ ] Test ticket purchase
- [ ] Test completeDraw function

## Support

If you need help:
1. Check the DEPLOYMENT_GUIDE.md for detailed instructions
2. Review Klever documentation: https://docs.klever.org
3. Ask in Klever community Telegram
