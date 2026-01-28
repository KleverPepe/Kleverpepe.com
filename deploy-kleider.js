// Klever IDE Compatible Deployment Script
// Run in VS Code terminal or any Node.js environment

const fs = require('fs');
const { KleverWeb, Utils } = require('@klever/connect-wallet');
const { TransactionBuilder } = require('@klever/connect-transactions');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  // Your 24-word mnemonic
  MNEMONIC: 'crack spider unhappy junior escape blossom brisk swear arrive side pistol sugar vocal concert code teach scissors lawn table switch awful kiwi verb diagram',
  
  // Network
  NETWORK: 'mainnet',
  RPC_URL: 'https://mainnet-gateway.klever.finance',
  
  // KPEPE Token Address
  KPEPE_TOKEN: '0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df',
  
  // Project and Prize Pool Wallet (derived from mnemonic)
  PROJECT_WALLET: '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
  PRIZE_POOL_WALLET: '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
  
  // Gas settings
  GAS_LIMIT: 5000000,
  GAS_PRICE: 1000000000 // 1 Gwei
};

// Load contract data
const bytecode = fs.readFileSync('./kleider-deploy/bytecode.txt', 'utf8').trim();
const abi = JSON.parse(fs.readFileSync('./kleider-deploy/abi.json', 'utf8'));

console.log('=== KPEPE Jackpot Deployment Script ===\n');
console.log('Configuration:');
console.log('- Network:', CONFIG.NETWORK);
console.log('- RPC:', CONFIG.RPC_URL);
console.log('- Deployer:', CONFIG.PROJECT_WALLET);
console.log('- KPEPE Token:', CONFIG.KPEPE_TOKEN);
console.log('');

// Generate wallet from mnemonic
function getPrivateKeyFromMnemonic(mnemonic, path = "m/44'/7278'/0'/0") {
  const { HDNode } = require('ethers');
  const wallet = HDNode.fromMnemonic(mnemonic, path);
  return wallet.privateKey;
}

// Create deployment transaction
async function createDeployTransaction() {
  console.log('Creating deployment transaction...');
  
  const privateKey = getPrivateKeyFromMnemonic(CONFIG.MNEMONIC);
  
  // Create transaction using Klever SDK
  const tx = {
    type: 15, // Smart contract creation
    payload: {
      code: bytecode,
      gasLimit: CONFIG.GAS_LIMIT,
      gasPrice: CONFIG.GAS_PRICE
    }
  };
  
  return tx;
}

// Create initialize wallets transaction
async function createInitializeTx(contractAddress) {
  console.log('Creating initialize wallets transaction...');
  
  const tx = {
    type: 15, // Smart contract execution
    payload: {
      contractAddress: contractAddress,
      method: 'initializeWallets',
      args: [
        CONFIG.PROJECT_WALLET,
        CONFIG.PRIZE_POOL_WALLET
      ],
      gasLimit: 200000,
      gasPrice: CONFIG.GAS_PRICE
    }
  };
  
  return tx;
}

// Create set KPEPE token transaction
async function createSetTokenTx(contractAddress) {
  console.log('Creating set KPEPE token transaction...');
  
  const tx = {
    type: 15,
    payload: {
      contractAddress: contractAddress,
      method: 'setKPEPEToken',
      args: [CONFIG.KPEPE_TOKEN],
      gasLimit: 200000,
      gasPrice: CONFIG.GAS_PRICE
    }
  };
  
  return tx;
}

// Broadcast transaction
async function broadcastTransaction(tx) {
  console.log('Note: Transactions must be signed in Klever Wallet');
  console.log('');
  console.log('Transaction data (copy to Klever Wallet):');
  console.log('---');
  console.log(JSON.stringify(tx, null, 2));
  console.log('---');
  console.log('');
  
  // Save transaction for later
  fs.writeFileSync('./pending-transaction.json', JSON.stringify(tx, null, 2));
  console.log('Transaction saved to pending-transaction.json');
  console.log('');
  console.log('To sign and broadcast:');
  console.log('1. Open Klever Wallet');
  console.log('2. Go to Developer Tools > Sign Transaction');
  console.log('3. Paste the transaction data');
  console.log('4. Sign and broadcast');
}

// Deploy main function
async function deploy() {
  try {
    // Step 1: Deploy contract
    console.log('Step 1: Deploying KPEPE Jackpot Contract...');
    const deployTx = await createDeployTransaction();
    await broadcastTransaction(deployTx);
    
    console.log('===========================================');
    console.log('⚠️  IMPORTANT: After signing the deploy transaction,');
    console.log('    you will receive a contract address.');
    console.log('===========================================');
    console.log('');
    console.log('Enter the deployed contract address below:');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Continue with initialization
async function initialize(contractAddress) {
  try {
    // Step 2: Initialize wallets
    console.log('\nStep 2: Initializing Wallets...');
    const initTx = await createInitializeTx(contractAddress);
    await broadcastTransaction(initTx);
    
    // Step 3: Set KPEPE token
    console.log('\nStep 3: Setting KPEPE Token...');
    const tokenTx = await createSetTokenTx(contractAddress);
    await broadcastTransaction(tokenTx);
    
    console.log('===========================================');
    console.log('✅ All transactions created!');
    console.log('===========================================');
    console.log('');
    console.log('Next steps:');
    console.log('1. Sign all 3 transactions in Klever Wallet');
    console.log('2. Verify contract on KleverScan');
    console.log('3. Update frontend with contract address');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);

if (args[0] === '--init' && args[1]) {
  initialize(args[1]);
} else if (args[0] === '--help') {
  console.log('Usage:');
  console.log('  node deploy-kleider.js          - Create deploy transaction');
  console.log('  node deploy-kleider.js --init <CONTRACT_ADDRESS> - Create init transactions');
  console.log('  node deploy-kleider.js --help   - Show this help');
} else {
  deploy();
}

module.exports = { deploy, initialize, CONFIG, bytecode, abi };
