#!/usr/bin/env node

/**
 * KPEPE Jackpot - Complete Contract Deployment & Initialization
 * 
 * IMPORTANT: Contract DEPLOYMENT must be done via KleverScan UI first!
 * This script handles the INITIALIZATION steps after deployment.
 * 
 * DEPLOYMENT STEPS:
 * 1. Go to https://kleverscan.org/contracts
 * 2. Click "Deploy Contract"
 * 3. Upload contracts/KPEPEJackpot.js
 * 4. Set gas limit: 3,000,000
 * 5. Sign and deploy
 * 6. Copy the contract address
 * 7. Add to .env: CONTRACT_ADDRESS=klv1qqq...
 * 8. Run this script: node deploy-contract-programmatic.js
 * 
 * This script will then:
 * - Initialize project and prize pool wallets
 * - Set KPEPE token address
 * - Enable the lottery round
 */

require('dotenv').config();
const { Account, TransactionType } = require('@klever/sdk-node');
const fs = require('fs');
const readline = require('readline');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  MNEMONIC: process.env.MAINNET_MNEMONIC,
  PROJECT_WALLET: process.env.PROJECT_WALLET || 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
  PRIZE_POOL_WALLET: process.env.PRIZE_POOL_WALLET || 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2',
  KPEPE_TOKEN: process.env.KPEPE_TOKEN_ADDRESS || 'kpepe-1eod',
  NETWORK: 'mainnet'
};

// Contract file info
const CONTRACT_FILE = './contracts/KPEPEJackpot.js';

// ============================================================================
// HELPERS
// ============================================================================

function printBanner() {
  console.log('\n' + '═'.repeat(70));
  console.log('🎰 KPEPE JACKPOT - CONTRACT DEPLOYMENT & INITIALIZATION');
  console.log('═'.repeat(70) + '\n');
}

function printError(message) {
  console.error('\n❌ ERROR:', message);
  console.error('');
}

function printSuccess(message) {
  console.log('\n✅', message);
}

function printInfo(message) {
  console.log('ℹ️ ', message);
}

function printStep(step, total, message) {
  console.log(`\n[${ step}/${total}] ${message}`);
  console.log('─'.repeat(70));
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// ============================================================================
// CONTRACT INTERACTION
// ============================================================================

async function callContractFunction(account, functionName, args = [], description = '') {
  console.log(`\n🔧 Calling: ${functionName}`);
  if (description) {
    console.log(`   ${description}`);
  }
  if (args.length > 0) {
    console.log('   Arguments:');
    args.forEach((arg, i) => {
      const displayArg = arg.length > 50 ? arg.substring(0, 47) + '...' : arg;
      console.log(`     ${i + 1}. ${displayArg}`);
    });
  }
  
  try {
    // Build transaction
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
    console.log('   🔏 Signing transaction...');
    const signedTx = await account.signTransaction(tx);
    
    // Broadcast
    console.log('   📡 Broadcasting to mainnet...');
    const result = await account.broadcastTransactions([signedTx]);
    
    if (result && result.txsHashes && result.txsHashes.length > 0) {
      const txHash = result.txsHashes[0];
      printSuccess(`Transaction sent!`);
      console.log(`   Hash: ${txHash}`);
      console.log(`   View: https://kleverscan.org/transaction/${txHash}`);
      
      // Wait a bit for confirmation
      console.log('   ⏳ Waiting 3 seconds for confirmation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return txHash;
    } else {
      throw new Error('No transaction hash returned');
    }
  } catch (error) {
    printError(`Failed to call ${functionName}: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// DEPLOYMENT GUIDE
// ============================================================================

async function showDeploymentGuide() {
  console.log('\n📋 CONTRACT DEPLOYMENT GUIDE');
  console.log('═'.repeat(70));
  console.log('\nThe Klever SDK does not support programmatic contract deployment.');
  console.log('You must deploy via KleverScan UI first:\n');
  
  console.log('STEP 1: Prepare Contract File');
  console.log('   ✓ Contract file ready at: contracts/KPEPEJackpot.js');
  
  // Check if file exists
  if (fs.existsSync(CONTRACT_FILE)) {
    const stats = fs.statSync(CONTRACT_FILE);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ✓ File size: ${sizeKB} KB`);
  } else {
    console.log('   ❌ Contract file not found!');
    return false;
  }
  
  console.log('\nSTEP 2: Deploy via KleverScan');
  console.log('   1. Visit: https://kleverscan.org/contracts');
  console.log('   2. Click "Deploy Contract"');
  console.log('   3. Select "JavaScript/WASM"');
  console.log('   4. Upload: contracts/KPEPEJackpot.js');
  console.log('   5. Gas Limit: 3000000');
  console.log('   6. Connect wallet and sign');
  console.log('   7. Wait for confirmation (2-3 minutes)');
  console.log('   8. Copy the contract address (starts with klv1qqq...)');
  
  console.log('\nSTEP 3: Update Configuration');
  console.log('   Add to .env file:');
  console.log('   CONTRACT_ADDRESS=klv1qqq...[your-contract-address]');
  
  console.log('\nSTEP 4: Run This Script Again');
  console.log('   node deploy-contract-programmatic.js');
  console.log('');
  
  const answer = await askQuestion('Have you deployed the contract and set CONTRACT_ADDRESS in .env? (yes/no): ');
  return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
}

// ============================================================================
// MAIN INITIALIZATION FLOW
// ============================================================================

async function initializeContract() {
  printBanner();
  
  // Check configuration
  console.log('📋 Configuration Check');
  console.log('─'.repeat(70));
  
  // Check contract address
  if (!CONFIG.CONTRACT_ADDRESS) {
    printError('CONTRACT_ADDRESS not set in .env');
    console.log('\nContract must be deployed first!');
    
    const proceed = await showDeploymentGuide();
    if (!proceed) {
      console.log('\n👋 Please deploy the contract first, then run this script again.\n');
      process.exit(0);
    } else {
      printError('CONTRACT_ADDRESS still not set. Exiting.');
      process.exit(1);
    }
  }
  
  console.log('   ✓ Contract Address:', CONFIG.CONTRACT_ADDRESS);
  
  // Check mnemonic
  if (!CONFIG.MNEMONIC) {
    printError('MAINNET_MNEMONIC not set in .env');
    console.log('\nAdd your 24-word mnemonic to .env:');
    console.log('MAINNET_MNEMONIC="word1 word2 ... word24"\n');
    process.exit(1);
  }
  
  console.log('   ✓ Mnemonic configured');
  console.log('   ✓ Network:', CONFIG.NETWORK);
  
  // Display wallets
  console.log('\n💼 Wallet Configuration');
  console.log('─'.repeat(70));
  console.log('   Project Wallet:   ', CONFIG.PROJECT_WALLET);
  console.log('   Prize Pool Wallet:', CONFIG.PRIZE_POOL_WALLET);
  console.log('   KPEPE Token:      ', CONFIG.KPEPE_TOKEN);
  
  // Confirm
  console.log('');
  const confirm = await askQuestion('Proceed with initialization? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('\n❌ Cancelled by user.\n');
    process.exit(0);
  }
  
  // Create account
  printStep(1, 4, 'Initializing Account');
  console.log('   Creating account from mnemonic...');
  
  const account = new Account(CONFIG.MNEMONIC);
  await account.ready;
  
  const address = account.getAddress();
  console.log('   ✓ Account address:', address);
  
  // Initialize wallets
  printStep(2, 4, 'Initialize Wallets');
  await callContractFunction(
    account,
    'initializeWallets',
    [CONFIG.PROJECT_WALLET, CONFIG.PRIZE_POOL_WALLET],
    'Setting project wallet (15% revenue) and prize pool wallet (85% revenue)'
  );
  
  // Set KPEPE token
  printStep(3, 4, 'Set KPEPE Token');
  await callContractFunction(
    account,
    'setKPEPEToken',
    [CONFIG.KPEPE_TOKEN],
    'Configuring KPEPE token for free ticket eligibility'
  );
  
  // Enable lottery
  printStep(4, 4, 'Enable Lottery');
  await callContractFunction(
    account,
    'toggleRound',
    [],
    'Activating the lottery - users can now buy tickets!'
  );
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('✅ CONTRACT INITIALIZATION COMPLETE!');
  console.log('═'.repeat(70));
  console.log('\n📊 Summary:');
  console.log('   ✓ Contract deployed at:', CONFIG.CONTRACT_ADDRESS);
  console.log('   ✓ Wallets initialized');
  console.log('   ✓ KPEPE token configured');
  console.log('   ✓ Lottery is ACTIVE');
  
  console.log('\n🔗 Next Steps:');
  console.log('   1. Verify on KleverScan:');
  console.log(`      https://kleverscan.org/contracts/${CONFIG.CONTRACT_ADDRESS}`);
  console.log('   2. Update frontend with contract address');
  console.log('   3. Test ticket purchase');
  console.log('   4. Start signing server: pm2 start sign-transaction-server.js');
  console.log('');
}

// ============================================================================
// ENTRY POINT
// ============================================================================

if (require.main === module) {
  initializeContract()
    .then(() => {
      console.log('✅ Script completed successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      printError(error.message);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { callContractFunction, CONFIG };
