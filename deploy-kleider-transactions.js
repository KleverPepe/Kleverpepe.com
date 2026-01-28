// Simple Klever Wallet Transaction Creator
// Creates unsigned transactions that can be signed in Klever Wallet

const fs = require('fs');
const crypto = require('crypto');

// Load environment variables
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

// Configuration
const CONFIG = {
  // ⚠️ SECURITY: Load mnemonic from environment variable, not hardcoded
  MNEMONIC: process.env.MAINNET_MNEMONIC || process.env.TEST_MNEMONIC,
  KPEPE_TOKEN: '0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df',
  PROJECT_WALLET: '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
  PRIZE_POOL_WALLET: '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
  GAS_LIMIT: 5000000,
  GAS_PRICE: 1000000000
};

const bytecode = fs.readFileSync('./kleider-deploy/bytecode.txt', 'utf8').trim();

function generateTransactionID() {
  return crypto.randomBytes(8).toString('hex');
}

function createDeployTransaction() {
  return {
    id: generateTransactionID(),
    type: 'SC_DEPLOY',
    description: 'Deploy KPEPE Jackpot Contract',
    payload: {
      type: 15,
      code: bytecode,
      gasLimit: CONFIG.GAS_LIMIT,
      gasPrice: CONFIG.GAS_PRICE
    },
    meta: {
      from: CONFIG.PROJECT_WALLET,
      network: 'mainnet',
      note: 'Deploys the KPEPE Jackpot lottery contract'
    }
  };
}

function createInitTransaction(contractAddress) {
  return {
    id: generateTransactionID(),
    type: 'SC_CALL',
    description: 'Initialize KPEPE Jackpot Wallets',
    payload: {
      type: 15,
      contractAddress: contractAddress,
      method: 'initializeWallets',
      args: [
        CONFIG.PROJECT_WALLET,
        CONFIG.PRIZE_POOL_WALLET
      ],
      gasLimit: 300000,
      gasPrice: CONFIG.GAS_PRICE
    },
    meta: {
      from: CONFIG.PROJECT_WALLET,
      network: 'mainnet',
      note: 'Sets project and prize pool wallets'
    }
  };
}

function createSetTokenTransaction(contractAddress) {
  return {
    id: generateTransactionID(),
    type: 'SC_CALL',
    description: 'Set KPEPE Token Address',
    payload: {
      type: 15,
      contractAddress: contractAddress,
      method: 'setKPEPEToken',
      args: [CONFIG.KPEPE_TOKEN],
      gasLimit: 300000,
      gasPrice: CONFIG.GAS_PRICE
    },
    meta: {
      from: CONFIG.PROJECT_WALLET,
      network: 'mainnet',
      note: 'Configures KPEPE token for prize distribution'
    }
  };
}

function createSetPrizesTransaction(contractAddress) {
  return {
    id: generateTransactionID(),
    type: 'SC_CALL',
    description: 'Set KPEPE Prize Amounts (500K Jackpot)',
    payload: {
      type: 15,
      contractAddress: contractAddress,
      method: 'setKPEPEPrizes',
      args: [
        '500000000000000000000000', // 500K KPEPE jackpot
        '0',                        // Match 5
        '0',                        // Match 4+8B
        '0',                        // Match 4
        '0',                        // Match 3+8B
        '0',                        // Match 3
        '0',                        // Match 2+8B
        '0',                        // Match 1+8B
        '0'                         // 8B only
      ],
      gasLimit: 300000,
      gasPrice: CONFIG.GAS_PRICE
    },
    meta: {
      from: CONFIG.PROJECT_WALLET,
      network: 'mainnet',
      note: 'Sets 500,000 KPEPE as jackpot prize'
    }
  };
}

// Main execution
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║     KPEPE Jackpot - Klever Wallet Transaction Builder ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

const contractAddress = process.argv[2];

if (!contractAddress) {
  // Generate deploy transaction only
  const deployTx = createDeployTransaction();
  
  console.log('📦 Deploy Transaction Created\n');
  console.log(JSON.stringify(deployTx, null, 2));
  
  fs.writeFileSync('./transaction-deploy.json', JSON.stringify(deployTx, null, 2));
  console.log('\n✅ Saved to transaction-deploy.json');
  
  console.log('\n══════════════════════════════════════════════════════');
  console.log('NEXT STEPS:');
  console.log('1. Open Klever Wallet');
  console.log('2. Go to Developer Tools > Sign Transaction');
  console.log('3. Paste the transaction above');
  console.log('4. Sign and broadcast');
  console.log('5. Copy the resulting contract address');
  console.log('6. Run: node deploy-kleider-transactions.js <CONTRACT_ADDRESS>');
  console.log('══════════════════════════════════════════════════════\n');
} else {
  // Generate all initialization transactions
  const initTx = createInitTransaction(contractAddress);
  const setTokenTx = createSetTokenTransaction(contractAddress);
  const setPrizesTx = createSetPrizesTransaction(contractAddress);
  
  const allTransactions = {
    deploy: deployTransaction(contractAddress),
    initialize: initTx,
    setToken: setTokenTx,
    setPrizes: setPrizesTx
  };
  
  console.log('🔧 All Post-Deployment Transactions Created\n');
  console.log(JSON.stringify(allTransactions, null, 2));
  
  fs.writeFileSync('./transaction-initialize.json', JSON.stringify(allTransactions, null, 2));
  console.log('\n✅ Saved to transaction-initialize.json');
  
  console.log('\n══════════════════════════════════════════════════════');
  console.log('NEXT STEPS:');
  console.log('1. Sign all 3 transactions in Klever Wallet');
  console.log('2. Verify contract on KleverScan');
  console.log('3. Update frontend with address:', contractAddress);
  console.log('══════════════════════════════════════════════════════\n');
}

module.exports = { createDeployTransaction, createInitTransaction, createSetTokenTransaction, createSetPrizesTransaction };
