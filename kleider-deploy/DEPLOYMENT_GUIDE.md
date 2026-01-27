# KPEPE Jackpot - Klever IDE Deployment Guide

## Step 1: Access Klever IDE
1. Go to: https://kleverscan.org/smart-contracts
2. Click "Deploy Contract" or go to Developer Tools → Deploy
3. Or use: https://kleverscan.org/verify-signature (has IDE features)

## Step 2: Deploy the Contract

### Option A: Via IDE (Recommended)
1. **Paste Contract Source:**
   - Copy contents from: `contracts/kpepe-jackpot.sol`
   - Paste into the IDE editor
   
2. **Compile:**
   - Click "Compile" button
   - Select version: 0.8.20
   - Enable optimizer (200 runs)

3. **Deploy:**
   - Select your wallet
   - Click "Deploy"
   - Confirm transaction in Klever Wallet
   - **Gas cost: ~3-5 million KLV (~$50-100)**

### Option B: Via Bytecode (Faster)
If IDE has a "Deploy with Bytecode" option:

**Bytecode:**
```
0x608060405234801561001057600080fd5b50600080546001600160a01b031916331790556007805461ff00191661010017905542600655612ef4806100456000396000f3fe60806040526004361061037a5760003560e01c80636e12c8f5116101d1578063736d94c611610175578063f0f4420014610185578063f4c06d3b14610196575b600080fd5b61038b600480360381019061038691906103d3565b6101a6565b60405180910390f35b6103ba60048036038101906103b59190610409565b61021e565b60405180910390f35b6001546001600160a01b0316156103e557600080fd5b600080546001600160a01b0319166001600160a01b0392909216919091179055565b600080fd5b610414816102a7565b8114610475576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161046c9190610551565b60405180910390fd5b50565b600081359050610489816103f5565b81146104d4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104cb9190610551565b60405180910390fd5b50565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f83011690549093919060c8565b6040519080825280601f01601f19166020018201604052801561054d57816000f55b50505056
```
*(Full bytecode in bytecode.txt)*

## Step 3: Initialize After Deployment

After contract is deployed, call these functions in order:

### 3.1 Set KPEPE Token
```
Function: setKPEPEToken(address)
Params: 0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df
```

### 3.2 Initialize Wallets
```
Function: initializeWallets(address projectWallet, address prizePoolWallet)
Params: 
  - projectWallet: 0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c
  - prizePoolWallet: 0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c
```

### 3.3 Set KPEPE Prizes (Optional - for 500K KPEPE jackpot)
```
Function: setKPEPEPrizes(
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

Example (adjust as needed):
Params:
  - jackpot: 500000000000000000000000 (500,000 KPEPE in wei)
  - match5: 0
  - match4_8b: 0
  - match4: 0
  - match3_8b: 0
  - match3: 0
  - match2_8b: 0
  - match1_8b: 0
  - match8b_only: 0
```

## Step 4: Verify Contract on KleverScan

After deployment:
1. Go to: https://kleverscan.org/verify-signature
2. Enter contract address
3. Paste ABI from `abi.json`
4. Submit verification

## Contract Information

| Field | Value |
|-------|-------|
| Contract Name | KPEPEJackpot |
| Compiler | 0.8.20 |
| Optimizer | Enabled (200 runs) |
| Constructor | None (no params) |
| License | MIT |

## Important Addresses

| Purpose | Address |
|---------|---------|
| Deployer/Owner | 0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c |
| Project Wallet | 0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c |
| Prize Pool Wallet | 0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c |
| KPEPE Token | 0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df |

## Post-Deployment Checklist

- [ ] Contract verified on KleverScan
- [ ] KPEPE token set
- [ ] Wallets initialized
- [ ] KPEPE prizes configured (optional)
- [ ] Test ticket purchase (small amount)
- [ ] Test completeDraw
- [ ] Update frontend with new contract address

## Files Included

- `bytecode.txt` - Full contract bytecode for deployment
- `abi.json` - Contract ABI for verification
- `kpepe-jackpot.sol` - Source code
