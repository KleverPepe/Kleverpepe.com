# KleverChain Contract Deployment Research - Findings

## Summary
After researching the codebase and Klever SDK documentation, here's what I found about programmatically deploying smart contracts to KleverChain Mainnet.

---

## Key Findings

### 1. **Klever SDK Transaction Types**
The `@klever/sdk-node` v2.4.2 provides these transaction types:
- **Type 63: SmartContract** - Used for smart contract operations
- Type 0: Transfer
- Type 1: CreateAsset
- ...etc

**Important:** There is NO dedicated `DeployContract` transaction type. Contract deployment must be done via:
- KleverScan UI (https://kleverscan.org/contracts)
- Klever Wallet Extension
- Klever CLI tools

### 2. **SmartContract Transaction Type (63)**
Used for **calling** deployed contracts, NOT deploying them:

```javascript
const { Account, TransactionType } = require('@klever/sdk-node');

const payload = {
  scType: 'InvokeContract',  // Type of smart contract operation
  contractAddress: 'klv1qqq...',  // Already deployed contract
  callValue: 0,
  callData: [
    'functionName',  // Contract function to call
    'arg1',
    'arg2'
  ]
};

const tx = await account.buildTransaction({
  type: TransactionType.SmartContract,  // Type 63
  payload
});
```

### 3. **Contract Deployment Options**

#### ❌ **NOT Available via SDK:**
```javascript
// This DOES NOT exist in @klever/sdk-node:
const deployed = await klever.deployContract(code, options); // ❌ Not available
```

#### ✅ **Available Methods:**

**A) KleverScan UI (Recommended - Easiest)**
1. Go to https://kleverscan.org/contracts
2. Click "Deploy Contract"
3. Select "JavaScript/WASM"
4. Upload `contracts/KPEPEJackpot.js`
5. Set gas limit: 3,000,000
6. Sign with wallet
7. Get contract address from transaction

**B) Klever Wallet Extension**
1. Install Klever Extension
2. Import wallet
3. Go to "Contracts" → "Deploy"
4. Upload contract file
5. Sign and deploy

**C) Klever CLI (If available)**
```bash
npm install -g @klever/cli
klever deploy ./contracts/KPEPEJackpot.js
```

### 4. **What the SDK CAN Do**

#### ✅ After Deployment - Initialize Contract:
```javascript
#!/usr/bin/env node
const { Account, TransactionType } = require('@klever/sdk-node');
require('dotenv').config();

async function initializeContract() {
  const CONTRACT_ADDRESS = 'klv1qqq...'; // From deployment
  const mnemonic = process.env.MAINNET_MNEMONIC;
  
  // Create account
  const account = new Account(mnemonic);
  await account.ready;
  
  // Build transaction to call initializeWallets
  const tx = await account.buildTransaction([{
    type: TransactionType.SmartContract,
    payload: {
      scType: 'InvokeContract',
      contractAddress: CONTRACT_ADDRESS,
      callValue: 0,
      callData: [
        'initializeWallets',
        'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
        'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2'
      ]
    }
  }]);
  
  // Sign and broadcast
  const signedTx = await account.signTransaction(tx);
  const result = await account.broadcastTransactions([signedTx]);
  
  console.log('Transaction Hash:', result.txsHashes[0]);
}

initializeContract();
```

### 5. **Contract File Format**
- **Location:** `contracts/KPEPEJackpot.js` (32KB)
- **Format:** JavaScript/WASM compiled contract
- **Language:** Compiled from Rust or C++ to WASM

### 6. **Deployment Workflow**

```
┌─────────────────────────────────────────────────┐
│ STEP 1: Deploy via KleverScan UI               │
│  - Upload contracts/KPEPEJackpot.js             │
│  - Get contract address: klv1qqq...             │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ STEP 2: Update .env                             │
│  CONTRACT_ADDRESS=klv1qqq...                    │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ STEP 3: Initialize via SDK (Programmable)      │
│  - Call initializeWallets(pw, ppw)              │
│  - Call setKPEPEToken(token)                    │
│  - Call toggleRound()                           │
└─────────────────────────────────────────────────┘
```

### 7. **Example Scripts in Codebase**

**Deployment Transaction Builder** (for Klever Wallet):
- `deploy-kleider-transactions.js` - Creates unsigned deployment transaction
- `deploy-kleider.js` - Creates transactions for manual signing

**Initialization Scripts** (SDK-based):
- `deploy-wallet-init.js` - Calls initializeWallets using SDK
- `sign-transaction-server.js` - Signs and broadcasts contract calls
- `deploy-init-final.js` - Complete initialization flow

### 8. **Working Code Pattern for Contract Calls**

```javascript
const { Account, TransactionType } = require('@klever/sdk-node');
const fs = require('fs');

require('dotenv').config();

const CONFIG = {
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  MNEMONIC: process.env.MAINNET_MNEMONIC,
  PROJECT_WALLET: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
  PRIZE_POOL_WALLET: 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2'
};

async function callContractFunction(functionName, args = []) {
  console.log(`Calling ${functionName}...`);
  
  // Create account from mnemonic
  const account = new Account(CONFIG.MNEMONIC);
  await account.ready;
  
  // Build smart contract call
  const tx = await account.buildTransaction([{
    type: TransactionType.SmartContract,
    payload: {
      scType: 'InvokeContract',
      contractAddress: CONFIG.CONTRACT_ADDRESS,
      callValue: 0,
      callData: [functionName, ...args]
    }
  }]);
  
  // Sign transaction
  const signedTx = await account.signTransaction(tx);
  
  // Broadcast
  const result = await account.broadcastTransactions([signedTx]);
  
  if (result && result.txsHashes && result.txsHashes.length > 0) {
    const txHash = result.txsHashes[0];
    console.log(`✅ Success! TX: ${txHash}`);
    console.log(`https://kleverscan.org/transaction/${txHash}`);
    return txHash;
  } else {
    throw new Error('Transaction failed');
  }
}

// Usage examples:
async function setupContract() {
  // Initialize wallets
  await callContractFunction('initializeWallets', [
    CONFIG.PROJECT_WALLET,
    CONFIG.PRIZE_POOL_WALLET
  ]);
  
  // Set token
  await callContractFunction('setKPEPEToken', ['kpepe-1eod']);
  
  // Enable lottery
  await callContractFunction('toggleRound', []);
  
  console.log('Contract setup complete!');
}

setupContract().catch(console.error);
```

---

## Conclusion

**For Programmatic Deployment:**
1. ❌ Cannot deploy contracts directly via @klever/sdk-node
2. ✅ Must use KleverScan UI or Klever Wallet for deployment
3. ✅ Can initialize and manage deployed contracts via SDK

**Recommended Approach:**
1. Deploy contract via KleverScan UI (manual, 5 minutes)
2. Copy contract address
3. Use SDK scripts to initialize and manage contract (automated)

**Alternative Approaches:**
- Investigate Klever CLI tools for programmatic deployment
- Use browser automation (Puppeteer/Selenium) to automate KleverScan UI
- Contact Klever team for backend deployment API (if available)

---

## Files to Review

1. **Contract File:**
   - `contracts/KPEPEJackpot.js` - 32KB WASM contract

2. **Example Scripts:**
   - `deploy-wallet-init.js` - Working SDK initialization
   - `sign-transaction-server.js` - Transaction signing server
   - `deploy-kleider-transactions.js` - Transaction builders

3. **Documentation:**
   - `DEPLOY_NOW.md` - Step-by-step deployment guide
   - `MAINNET_DEPLOYMENT_CHECKLIST.md` - Complete checklist
   - `node_modules/@klever/sdk-node/README.md` - SDK docs
