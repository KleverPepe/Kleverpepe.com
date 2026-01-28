# KPEPE Lottery Contract Deployment Guide

## ⚠️ Current Status
The KPEPE lottery smart contract has **not been deployed yet**. The contract bytecode and ABI are ready, but the contract needs to be deployed to KleverChain Mainnet.

## 🚀 Deployment Options

### Option 1: Using Klever IDE (kleider-deploy) - RECOMMENDED
1. Open `kleider-deploy/index.html` in your browser
2. Make sure Klever Wallet extension is installed and connected to **Mainnet**
3. Click "Deploy Contract"
4. Approve the transaction in your wallet (requires ~50-100 KLV for gas)
5. Wait for confirmation
6. Copy the contract address returned
7. Update `CONTRACT_ADDRESS` in `lottery/index.html` line 436

### Option 2: Using KleverScan Web Interface
1. Go to https://kleverscan.org/smart-contracts (connect your wallet)
2. Click "Deploy Contract"
3. Upload the WASM bytecode from `kleider-deploy/bytecode.txt`
4. Select network: **Mainnet (0x8F4)**
5. Approve and pay gas
6. Get the contract address from the transaction
7. Update CONTRACT_ADDRESS in lottery code

### Option 3: Using CLI
```bash
# If you have Klever CLI installed:
klever contract deploy \
  --bytecode ./kleider-deploy/bytecode.txt \
  --mnemonic "your 12-word seed phrase"
```

## 📝 After Deployment

Once deployed, you'll get a contract address like: `klv1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Update the lottery code:

**File**: `lottery/index.html` (Line 436)
```javascript
const CONTRACT_ADDRESS = "klv1YOUR_DEPLOYED_ADDRESS_HERE";
```

Then the lottery will be fully operational!

## 🔗 Related Files

- **Contract Source**: `contracts/kpepe-jackpot.sol` (Solidity)
- **Contract WASM**: `kleider-deploy/bytecode.txt`
- **Contract ABI**: `kleider-deploy/abi.json`
- **Deployment Frontend**: `kleider-deploy/index.html`

## ✅ Testing After Deployment

1. Open `http://localhost:8000/lottery/` in your browser
2. Connect your Klever wallet
3. Select numbers and click "Buy Ticket"
4. Approve the transaction
5. Watch the signing server console for transaction hash
6. Check KleverScan for the transaction

## 🆘 Troubleshooting

**"invalid contract" error** → Contract address doesn't exist. Redeploy.
**"Cannot read properties" error** → Wallet not connected. Reload and reconnect.
**"Permission denied" error** → Not the contract owner trying to initialize.

## 💾 Current Configuration

| Setting | Value |
|---------|-------|
| Network | KleverChain Mainnet (0x8F4) |
| Ticket Price | 1 KLV |
| Project Wallet (15%) | `klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9` |
| Prize Pool (85%) | `klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2` |
| Signing Server | `http://localhost:3001` |
| Frontend Server | `http://localhost:8000` |
