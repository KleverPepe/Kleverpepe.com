# KPEPE Jackpot - Mainnet Deployment Ready

## Deployment Info (Saved for later)

### Wallet (24-word mnemonic)
See .env file (mnemonic already configured)

### KPEPE Token Address
0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df

### Deployer Address
0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c

## Deployment Steps (when RPC is available)

```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign
npm run compile
node deploy-direct.js
```

## If RPC still fails, try:

1. Mobile hotspot (bypass DNS issue)
2. VPN service
3. Different internet connection
4. Use Klever Wallet IDE directly

## Contract Details
- File: contracts/kpepe-jackpot.sol
- ABI: artifacts/contracts/kpepe-jackpot.sol/KPEPEJackpot.json
- Gas: ~3-5M (needs ~50-100 KLV)
