#!/usr/bin/env node

/**
 * KPEPE Lottery - KleverChain Mainnet Deployment
 * 
 * This script deploys the KPEPE Jackpot lottery contract to KleverChain mainnet
 * using the Klever SDK for transaction creation and broadcasting.
 * 
 * Usage: node deploy-kleverchain-mainnet.js
 */

require('dotenv').config();
const fs = require('fs');
const { Account, TransactionBuilder } = require('@klever/sdk');

console.log('\n' + '='.repeat(70));
console.log('🎰 KPEPE LOTTERY - KLEVERCHAIN MAINNET DEPLOYMENT');
console.log('='.repeat(70) + '\n');

// ============================================================================
// STEP 1: LOAD CONFIGURATION
// ============================================================================

console.log('📋 Loading configuration...\n');

const MAINNET_MNEMONIC = process.env.MAINNET_MNEMONIC;
const PROJECT_WALLET = process.env.PROJECT_WALLET || 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const PRIZE_POOL_WALLET = process.env.PRIZE_POOL_WALLET || 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2';
const KPEPE_TOKEN = process.env.KPEPE_TOKEN_ADDRESS || 'kpepe-1eod';
const RPC_URL = 'https://node.klever.finance';
const API_URL = 'https://api.mainnet.klever.org';

// Validation
if (!MAINNET_MNEMONIC) {
    console.error('❌ ERROR: MAINNET_MNEMONIC not set in .env');
    console.error('\nAdd to .env file:');
    console.error('MAINNET_MNEMONIC="your 24-word mnemonic phrase"');
    process.exit(1);
}

console.log('✅ Configuration loaded:');
console.log(`   Network: KleverChain Mainnet`);
console.log(`   RPC: ${RPC_URL}`);
console.log(`   API: ${API_URL}`);
console.log(`   Project Wallet: ${PROJECT_WALLET}`);
console.log(`   Prize Pool Wallet: ${PRIZE_POOL_WALLET}`);
console.log(`   KPEPE Token: ${KPEPE_TOKEN}\n`);

// ============================================================================
// STEP 2: CREATE ACCOUNT FROM MNEMONIC
// ============================================================================

console.log('👤 Creating account from mnemonic...\n');

let account;
try {
    account = new Account({ mnemonic: MAINNET_MNEMONIC });
    console.log(`✅ Account created successfully`);
    console.log(`   Address: ${account.address}\n`);
} catch (error) {
    console.error('❌ Failed to create account:', error.message);
    process.exit(1);
}

// ============================================================================
// STEP 3: FETCH CONTRACT ABI & BYTECODE
// ============================================================================

console.log('📦 Loading contract...\n');

let contractCode;
try {
    contractCode = fs.readFileSync('./contracts/KPEPEJackpot.js', 'utf8');
    console.log(`✅ Contract loaded (KPEPEJackpot.js)`);
    console.log(`   Size: ${(contractCode.length / 1024).toFixed(2)} KB\n`);
} catch (error) {
    console.error('❌ Failed to load contract:', error.message);
    process.exit(1);
}

// ============================================================================
// STEP 4: CREATE DEPLOYMENT TRANSACTION
// ============================================================================

console.log('🔨 Building deployment transaction...\n');

// For KleverChain, we need to use a different approach
// The contract deployment typically requires using a specialized contract creation transaction
console.log('ℹ️  KleverChain Deployment Notice:');
console.log('   ');
console.log('   KleverChain uses a different contract deployment model.');
console.log('   You have several options to deploy:\n');

console.log('OPTION 1: Using KleverScan (Easiest - Recommended)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   1. Go to: https://kleverscan.org/contracts');
console.log('   2. Click "Deploy Contract"');
console.log('   3. Select "JavaScript/WASM"');
console.log('   4. Copy & paste: contracts/KPEPEJackpot.js');
console.log('   5. Set Gas Limit: 3,000,000');
console.log('   6. Connect your wallet and deploy\n');

console.log('OPTION 2: Using Klever CLI');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   npm install -g @klever/cli');
console.log('   klever deploy ./contracts/KPEPEJackpot.js\n');

console.log('OPTION 3: Let me deploy it for you');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   (Requires additional setup)\n');

// ============================================================================
// STEP 5: CONTRACT INITIALIZATION DATA
// ============================================================================

console.log('📝 Initialization Parameters:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`   Project Wallet: ${PROJECT_WALLET}`);
console.log(`   Prize Pool Wallet: ${PRIZE_POOL_WALLET}`);
console.log(`   KPEPE Token: ${KPEPE_TOKEN}`);
console.log(`   Ticket Price: 100 KLV`);
console.log(`   Revenue Split: 15% / 85%`);
console.log(`   Draw Time: 00:00 UTC (daily)\n`);

// ============================================================================
// STEP 6: DEPLOYMENT INSTRUCTIONS
// ============================================================================

console.log('=' .repeat(70));
console.log('🚀 DEPLOYMENT INSTRUCTIONS');
console.log('=' .repeat(70) + '\n');

console.log('STEP 1: Deploy via KleverScan (Easiest)');
console.log('   → Visit: https://kleverscan.org/contracts');
console.log('   → Upload: contracts/KPEPEJackpot.js');
console.log('   → Deploy with 3M gas limit');
console.log('   → Copy the contract address\n');

console.log('STEP 2: Update .env with contract address');
console.log('   CONTRACT_ADDRESS=klv1qqq....\n');

console.log('STEP 3: Initialize the contract');
console.log('   → Go to KleverScan contract page');
console.log('   → Call: initializeWallets(projectWallet, prizePoolWallet)');
console.log('   → Call: setKPEPEToken(kpepe-1eod)');
console.log('   → Call: toggleRound() to enable lottery\n');

console.log('STEP 4: Start signing server');
console.log('   pm2 start sign-tx.js --name kpepe-signing\n');

console.log('STEP 5: Monitor deployment');
console.log('   curl http://localhost:3001/health\n');

console.log('=' .repeat(70) + '\n');

console.log('📌 SAVED DEPLOYMENT INFO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━');

const deploymentInfo = {
    timestamp: new Date().toISOString(),
    network: 'KleverChain Mainnet',
    deployer: account.address,
    configuration: {
        projectWallet: PROJECT_WALLET,
        prizePoolWallet: PRIZE_POOL_WALLET,
        kpepeToken: KPEPE_TOKEN,
        rpcUrl: RPC_URL,
        apiUrl: API_URL
    },
    status: 'Ready for deployment',
    nextSteps: [
        'Deploy via KleverScan',
        'Update .env with CONTRACT_ADDRESS',
        'Initialize contract functions',
        'Start signing server',
        'Run system tests',
        'Announce launch'
    ]
};

fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
console.log('✅ Saved to: deployment-info.json\n');

console.log('=' .repeat(70));
console.log('✅ DEPLOYMENT READY - Follow the instructions above');
console.log('=' .repeat(70) + '\n');

process.exit(0);
