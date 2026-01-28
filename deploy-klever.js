/**
 * KPEPE Jackpot - Deployment Script for Klever Mainnet
 * 
 * Usage:
 *   node deploy-klever.js
 * 
 * Before running:
 *   1. Make sure .env has your MAINNET_MNEMONIC
 *   2. npm install @klever/sdk
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Load contract
const contractPath = path.join(__dirname, 'contracts', 'KPEPEJackpot.js');
const contractCode = fs.readFileSync(contractPath, 'utf8');

// Configuration
const CONFIG = {
    mnemonic: process.env.MAINNET_MNEMONIC,
    gasLimit: parseInt(process.env.GAS_LIMIT) || 3000000,
    gasPrice: parseInt(process.env.GAS_PRICE) || 1000000,
    rpcUrl: process.env.KLEVER_MAINNET_URL || 'https://mainnet-gateway.klever.finance',
};

console.log('='.repeat(60));
console.log('KPEPE JACKPOT - KLEVER MAINNET DEPLOYMENT');
console.log('='.repeat(60));
console.log('');

if (!CONFIG.mnemonic) {
    console.log('ERROR: MAINNET_MNEMONIC not found in .env file');
    console.log('');
    console.log('Add this to your .env file:');
    console.log('MAINNET_MNEMONIC="your 24 word mnemonic here"');
    process.exit(1);
}

console.log('Configuration:');
console.log(`  RPC URL: ${CONFIG.rpcUrl}`);
console.log(`  Gas Limit: ${CONFIG.gasLimit}`);
console.log(`  Gas Price: ${CONFIG.gasPrice}`);
console.log('');

async function deploy() {
    try {
        // Note: Klever SDK requires browser extension or backend setup
        // This script prepares the deployment package
        
        console.log('Preparing deployment package...');
        console.log('');
        
        // Create deployment package
        const deploymentPackage = {
            contract: 'KPEPEJackpot',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            code: contractCode,
            config: {
                ticketPrice: 10000000000, // 100 KLV
                mainCount: 5,
                eightRange: 20,
                mainRange: 50,
                prizes: {
                    jackpot: 4000,      // 40%
                    match5: 1500,      // 15%
                    match4_8b: 800,    // 8%
                    match4: 500,       // 5%
                    match3_8b: 600,    // 6%
                    match3: 450,       // 4.5%
                    match2_8b: 300,    // 3%
                    match1_8b: 150,    // 1.5%
                    match8b_only: 125, // 1.25%
                },
                poolRetention: 1975, // 19.75%
                maxPool: 100000000000000, // 1M KLV
            }
        };
        
        // Save deployment package
        const deployPath = path.join(__dirname, 'deployment-package.json');
        fs.writeFileSync(deployPath, JSON.stringify(deploymentPackage, null, 2));
        console.log(`✓ Deployment package saved to: ${deployPath}`);
        console.log('');
        
        // Create setup script for post-deployment
        const setupScript = `/**
 * KPEPE Jackpot - Post-Deployment Setup
 * Run this after deploying the contract
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Load deployment info
const deployment = require('./deployment-package.json');

const MNEMONIC = process.env.MAINNET_MNEMONIC;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!MNEMONIC) {
    console.log('ERROR: MAINNET_MNEMONIC required in .env');
    process.exit(1);
}

if (!CONTRACT_ADDRESS) {
    console.log('ERROR: CONTRACT_ADDRESS required in .env');
    console.log('Add: CONTRACT_ADDRESS=0x...');
    process.exit(1);
}

async function setup() {
    console.log('Setting up KPEPE Jackpot contract...');
    console.log(\`Contract: \${CONTRACT_ADDRESS}\`);
    console.log('');
    
    // Setup functions to call (example)
    const setupSteps = [
        {
            name: 'Initialize Wallets',
            fn: 'initializeWallets',
            params: [
                process.env.PROJECT_WALLET || '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
                process.env.PRIZE_POOL_WALLET || '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c'
            ]
        },
        {
            name: 'Set KPEPE Token',
            fn: 'setKpepeToken',
            params: [process.env.KPEPE_TOKEN_ADDRESS || '0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df']
        },
        {
            name: 'Set KPEPE Staking',
            fn: 'setKpepeStaking',
            params: [process.env.KPEPE_STAKING_ADDRESS || '0x0000000000000000000000000000000000000000']
        },
        {
            name: 'Toggle Round (Start)',
            fn: 'toggleRound',
            params: []
        }
    ];
    
    console.log('Setup steps to execute via KleverScan:');
    console.log('');
    
    setupSteps.forEach((step, i) => {
        console.log(\`\${i + 1}. \${step.name}\`);
        console.log(\`   Function: \${step.fn}\`);
        console.log(\`   Params: \${JSON.stringify(step.params)}\`);
        console.log('');
    });
    
    console.log('Go to: https://kleverscan.org/contracts/\${CONTRACT_ADDRESS}');
    console.log('Click "Write Contract" and call each function above.');
}

setup();
`;

        const setupPath = path.join(__dirname, 'post-deploy-setup.js');
        fs.writeFileSync(setupPath, setupScript);
        console.log(`✓ Post-deployment setup saved to: ${setupPath}`);
        console.log('');
        
        console.log('='.repeat(60));
        console.log('DEPLOYMENT READY');
        console.log('='.repeat(60));
        console.log('');
        console.log('OPTION 1: Deploy via KleverScan (RECOMMENDED)');
        console.log('  1. Go to https://kleverscan.org/contracts');
        console.log('  2. Click "Deploy Contract"');
        console.log('  3. Upload file: contracts/KPEPEJackpot.js');
        console.log('  4. Gas Limit: 3,000,000');
        console.log('  5. Connect wallet and confirm');
        console.log('');
        console.log('OPTION 2: Deploy via CLI');
        console.log('  npm install -g @klever/cli');
        console.log('  klever deploy --wasm rust-contract/target/.../kpepe_jackpot.wasm');
        console.log('');
        console.log('AFTER DEPLOYMENT:');
        console.log('  1. Add CONTRACT_ADDRESS to .env');
        console.log('  2. Run: node post-deploy-setup.js');
        console.log('');
        
    } catch (error) {
        console.error('Deployment preparation failed:', error.message);
        process.exit(1);
    }
}

deploy();
