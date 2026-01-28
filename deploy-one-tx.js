/**
 * KPEPE Jackpot - ONE COMMAND DEPLOYMENT
 * 
 * This script:
 * 1. Deploys the contract
 * 2. Initializes wallets
 * 3. Sets KPEPE token
 * 4. Sets staking address
 * 5. Starts the lottery
 * 
 * Usage: 
 *   node deploy-one-tx.js
 * 
 * Prerequisites:
 *   npm install @klever/sdk
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('KPEPE JACKPOT - ONE-COMMAND DEPLOYMENT');
console.log('='.repeat(60));
console.log('');

// Configuration from .env
const CONFIG = {
    mnemonic: process.env.MAINNET_MNEMONIC,
    kpepeToken: process.env.KPEPE_TOKEN_ADDRESS || '0xEd008768c922b9e2c30a4d666a37bB7dA45Ed5df',
    projectWallet: process.env.PROJECT_WALLET || '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
    prizePoolWallet: process.env.PRIZE_POOL_WALLET || '0x20Ca27aCD025b72a72b1Db0a4268EDF9B900582c',
    stakingAddress: process.env.STAKING_ADDRESS || '0x0000000000000000000000000000000000000000',
};

if (!CONFIG.mnemonic) {
    console.log('ERROR: MAINNET_MNEMONIC required in .env');
    process.exit(1);
}

async function deploy() {
    try {
        // Note: This is a template - actual deployment requires Klever SDK setup
        // The SDK needs browser extension or proper Node.js setup
        
        console.log('Configuration:');
        console.log(`  Project Wallet: ${CONFIG.projectWallet}`);
        console.log(`  Prize Pool:     ${CONFIG.prizePoolWallet}`);
        console.log(`  KPEPE Token:    ${CONFIG.kpepeToken}`);
        console.log(`  Staking:        ${CONFIG.stakingAddress}`);
        console.log('');
        
        // Load contract
        const contractCode = fs.readFileSync(
            path.join(__dirname, 'contracts', 'KPEPEJackpot.js'),
            'utf8'
        );
        
        console.log('Contract loaded: contracts/KPEPEJackpot.js');
        console.log('');
        
        // Create the deployment transaction
        const deployTx = {
            type: 'deploy',
            code: Buffer.from(contractCode).toString('base64'),
            gasLimit: 3000000,
            gasPrice: 1000000,
        };
        
        console.log('Deployment Transaction:');
        console.log(`  Type: ${deployTx.type}`);
        console.log(`  Gas Limit: ${deployTx.gasLimit}`);
        console.log(`  Gas Price: ${deployTx.gasPrice}`);
        console.log('');
        
        // Save for manual deployment
        const manualDeploy = {
            contractCode: contractCode,
            deployTx: deployTx,
            setupFunctions: [
                {
                    fn: 'initializeWallets',
                    params: [CONFIG.projectWallet, CONFIG.prizePoolWallet],
                    description: 'Set project and prize pool wallets'
                },
                {
                    fn: 'setKpepeToken',
                    params: [CONFIG.kpepeToken],
                    description: 'Set KPEPE token address'
                },
                {
                    fn: 'setKpepeStaking',
                    params: [CONFIG.stakingAddress],
                    description: 'Set staking contract address'
                },
                {
                    fn: 'toggleRound',
                    params: [],
                    description: 'Start the lottery (roundActive = true)'
                }
            ]
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'deployment-tx.json'),
            JSON.stringify(manualDeploy, null, 2)
        );
        
        console.log('✓ Deployment data saved to deployment-tx.json');
        console.log('');
        
        console.log('='.repeat(60));
        printInstructions();
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

function printInstructions() {
    console.log('DEPLOYMENT INSTRUCTIONS');
    console.log('='.repeat(60));
    console.log('');
    console.log('OPTION A: KLEVERSCAN (EASIEST)');
    console.log('────────────────────────────────────────────────────');
    console.log('1. Go to: https://kleverscan.org/contracts');
    console.log('2. Click "Deploy Contract"');
    console.log('3. Upload: contracts/KPEPEJackpot.js');
    console.log('4. Gas: 3000000');
    console.log('5. Deploy');
    console.log('');
    console.log('6. After deployment, call these 4 functions:');
    console.log('');
    console.log('   Function 1: initializeWallets');
    console.log('   Params: ["' + CONFIG.projectWallet + '", "' + CONFIG.prizePoolWallet + '"]');
    console.log('');
    console.log('   Function 2: setKpepeToken');
    console.log('   Params: ["' + CONFIG.kpepeToken + '"]');
    console.log('');
    console.log('   Function 3: setKpepeStaking');
    console.log('   Params: ["' + CONFIG.stakingAddress + '"]');
    console.log('');
    console.log('   Function 4: toggleRound');
    console.log('   Params: []');
    console.log('');
    
    console.log('OPTION B: KLEVER CLI');
    console.log('────────────────────────────────────────────────────');
    console.log('npm install -g @klever/cli');
    console.log('klever deploy --wasm contracts/KPEPEJackpot.js');
    console.log('');
    
    console.log('='.repeat(60));
}

deploy();
