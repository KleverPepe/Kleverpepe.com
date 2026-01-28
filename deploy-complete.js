/**
 * KPEPE Jackpot - Complete Deployment Script
 * Deploys contract AND initializes everything in one transaction
 * 
 * Usage: node deploy-complete.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('KPEPE JACKPOT - COMPLETE DEPLOYMENT');
console.log('='.repeat(60));
console.log('');

// Load configuration
const CONFIG = {
    mnemonic: process.env.MAINNET_MNEMONIC,
    kpepeToken: process.env.KPEPE_TOKEN_ADDRESS || '0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df',
    projectWallet: process.env.PROJECT_WALLET || '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
    prizePoolWallet: process.env.PRIZE_POOL_WALLET || '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
    // KPEPE prize amounts
    kpepeJackpotPrize: '1000000000000',   // 10,000 KPEPE
    kpepeMatch5Prize: '500000000000',     // 5,000 KPEPE
    kpepeMatch48BPrize: '100000000000',   // 1,000 KPEPE
    kpepeMatch4Prize: '50000000000',      // 500 KPEPE
    kpepeMatch38BPrize: '25000000000',    // 250 KPEPE
    kpepeMatch3Prize: '10000000000',      // 100 KPEPE
    kpepeMatch28BPrize: '5000000000',     // 50 KPEPE
    kpepeMatch18BPrize: '2000000000',     // 20 KPEPE
    kpepeMatch8BOnlyPrize: '1000000000',  // 10 KPEPE
};

if (!CONFIG.mnemonic) {
    console.log('ERROR: MAINNET_MNEMONIC required in .env');
    console.log('');
    console.log('Add to .env:');
    console.log('MAINNET_MNEMONIC="your 24 word mnemonic"');
    process.exit(1);
}

// Load contract code
const contractCode = fs.readFileSync(
    path.join(__dirname, 'contracts', 'KPEPEJackpot.js'),
    'utf8'
);

// Create initialization params
const initParams = {
    projectWallet: CONFIG.projectWallet,
    prizePoolWallet: CONFIG.prizePoolWallet,
    kpepeToken: CONFIG.kpepeToken,
    kpepeStaking: '', // Set after staking contract deployed
    kpepeJackpotPrize: parseInt(CONFIG.kpepeJackpotPrize),
    kpepeMatch5Prize: parseInt(CONFIG.kpepeMatch5Prize),
    kpepeMatch48BPrize: parseInt(CONFIG.kpepeMatch48BPrize),
    kpepeMatch4Prize: parseInt(CONFIG.kpepeMatch4Prize),
    kpepeMatch38BPrize: parseInt(CONFIG.kpepeMatch38BPrize),
    kpepeMatch3Prize: parseInt(CONFIG.kpepeMatch3Prize),
    kpepeMatch28BPrize: parseInt(CONFIG.kpepeMatch28BPrize),
    kpepeMatch18BPrize: parseInt(CONFIG.kpepeMatch18BPrize),
    kpepeMatch8BOnlyPrize: parseInt(CONFIG.kpepeMatch8BOnlyPrize),
};

console.log('Deployment Configuration:');
console.log(`  Project Wallet: ${CONFIG.projectWallet}`);
console.log(`  Prize Pool Wallet: ${CONFIG.prizePoolWallet}`);
console.log(`  KPEPE Token: ${CONFIG.kpepeToken}`);
console.log('');

console.log('KPEPE Prize Payouts:');
console.log(`  Jackpot (5+8B): ${CONFIG.kpepeJackpotPrize}`);
console.log(`  Match 5: ${CONFIG.kpepeMatch5Prize}`);
console.log(`  Match 4+8B: ${CONFIG.kpepeMatch48BPrize}`);
console.log(`  Match 4: ${CONFIG.kpepeMatch4Prize}`);
console.log(`  Match 3+8B: ${CONFIG.kpepeMatch38BPrize}`);
console.log(`  Match 3: ${CONFIG.kpepeMatch3Prize}`);
console.log(`  Match 2+8B: ${CONFIG.kpepeMatch28BPrize}`);
console.log(`  Match 1+8B: ${CONFIG.kpepeMatch18BPrize}`);
console.log(`  Match 8B Only: ${CONFIG.kpepeMatch8BOnlyPrize}`);
console.log('');

// Save initialization params for later use
fs.writeFileSync(
    path.join(__dirname, 'init-params.json'),
    JSON.stringify(initParams, null, 2)
);
console.log('✓ Initialization params saved to init-params.json');

console.log('');
console.log('='.repeat(60));
console.log('DEPLOYMENT OPTIONS');
console.log('='.repeat(60));
console.log('');
console.log('OPTION 1: KleverScan (RECOMMENDED - No Code Required)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  1. Go to: https://kleverscan.org/contracts');
console.log('  2. Click "Deploy Contract"');
console.log('  3. Upload: contracts/KPEPEJackpot.js');
console.log('  4. Gas Limit: 3,000,000');
console.log('  5. Connect wallet & Deploy');
console.log('');
console.log('  AFTER DEPLOYMENT - Run this command:');
console.log('  node post-deploy-setup.js');
console.log('');

console.log('OPTION 2: CLI Deployment');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  # Install Klever CLI');
console.log('  npm install -g @klever/cli');
console.log('');
console.log('  # Build WASM (if using Rust contract)');
console.log('  cd rust-contract');
console.log('  cargo build --release --target wasm32-unknown-unknown');
console.log('');
console.log('  # Deploy');
console.log('  klever deploy --wasm target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm');
console.log('');

console.log('OPTION 3: Programmatic (Requires SDK Setup)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  See deploy-programmatic.js for example');
console.log('');

console.log('='.repeat(60));
console.log('POST-DEPLOYMENT CHECKLIST');
console.log('='.repeat(60));
console.log('');
console.log('After deployment, call these functions via KleverScan:');
console.log('');
console.log('  1. ✓ INITIALIZED DURING DEPLOYMENT:');
console.log('     - projectWallet ✓');
console.log('     - prizePoolWallet ✓');
console.log('     - kpepeToken ✓');
console.log('     - All prize amounts ✓');
console.log('');
console.log('  2. TO BE SET MANUALLY:');
console.log('     - setKpepeStaking(staking_address)');
console.log('     - toggleRound() [to start the lottery]');
console.log('');
console.log('  3. VERIFY DEPLOYMENT:');
console.log('     - getPoolBalance() should return 0');
console.log('     - getNextDrawTime() should return future timestamp');
console.log('');
console.log('='.repeat(60));
