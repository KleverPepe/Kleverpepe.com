/**
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
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
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
        console.log(`${i + 1}. ${step.name}`);
        console.log(`   Function: ${step.fn}`);
        console.log(`   Params: ${JSON.stringify(step.params)}`);
        console.log('');
    });
    
    console.log('Go to: https://kleverscan.org/contracts/${CONTRACT_ADDRESS}');
    console.log('Click "Write Contract" and call each function above.');
}

setup();
