#!/usr/bin/env node

/**
 * KPEPE Jackpot - Revenue Split Setup Script
 * 
 * This script helps the contract owner:
 * 1. Initialize the project wallet (one-time setup)
 * 2. Withdraw accumulated 15% revenue from previous ticket sales
 * 
 * Prerequisites:
 * - Node.js installed
 * - npm install @klever/sdk-js
 * - Create .env file with MAINNET_MNEMONIC
 * 
 * Usage:
 * node setup-revenue-split.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
if (fs.existsSync('.env')) {
    require('dotenv').config();
}

// Configuration
const CONFIG = {
  CONTRACT: 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d',
  PROJECT_WALLET: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
  RPC: 'https://node.mainnet.klever.org',
  CHAIN_ID: 100
};

const ACCUMULATED_REVENUE = 30000000n; // 30 KLV in precision units

async function main() {
    console.log('\n💼 KPEPE Jackpot Revenue Split Setup');
    console.log('====================================\n');
    console.log('Contract:      ' + CONFIG.CONTRACT);
    console.log('Project Wallet: ' + CONFIG.PROJECT_WALLET);
    console.log('Network:       KleverChain Mainnet');
    console.log('');
    
    // Check for mnemonic
    const MNEMONIC = process.env.MAINNET_MNEMONIC || process.env.MNEMONIC;
    
    if (!MNEMONIC) {
        console.error('❌ Error: MAINNET_MNEMONIC not found in .env');
        console.log('\nSetup Instructions:');
        console.log('1. Create a .env file in this directory');
        console.log('2. Add your owner wallet mnemonic:');
        console.log('   MAINNET_MNEMONIC="word1 word2 word3 ... word12"');
        console.log('3. Save and run: node setup-revenue-split.js\n');
        process.exit(1);
    }

    try {
        // Load Klever SDK
        let KleverSDK;
        try {
            KleverSDK = require('@klever/sdk');
        } catch (e) {
            console.error('❌ @klever/sdk not installed');
            console.log('\nInstall with: npm install @klever/sdk\n');
            process.exit(1);
        }

        const { Account } = KleverSDK;
        
        console.log('🔗 Connecting to KleverChain...\n');
        
        // Create account from mnemonic
        const account = new Account({
            mnemonic: MNEMONIC
        });

        // Set provider
        account.provider.setProvider(CONFIG.RPC);

        const ownerAddress = account.address;
        console.log('✅ Connected as: ' + ownerAddress);
        
        // Get balance
        try {
            const balance = await account.getBalance();
            const klvAmount = Number(balance) / 1e6;
            console.log('💰 Balance: ' + klvAmount.toFixed(2) + ' KLV');
            
            if (klvAmount < 0.1) {
                console.warn('⚠️  Warning: Low balance (need at least 0.1 KLV for gas)');
            }
        } catch (e) {
            console.log('⚠️  Could not fetch balance');
        }
        console.log('');

        // Step 1: Initialize project wallet
        console.log('📝 Step 1: Initialize Project Wallet');
        console.log('-----------------------------------');
        console.log('Function: initialize_wallets');
        console.log('Parameter: ' + CONFIG.PROJECT_WALLET);
        console.log('');
        console.log('🚀 Sending transaction...\n');

        try {
            const initTx = {
                receiver: CONFIG.CONTRACT,
                data: 'initialize_wallets@' + Buffer.from(CONFIG.PROJECT_WALLET).toString('hex'),
                amount: '0'
            };

            const initResult = await account.sendTransaction(initTx);
            const initHash = initResult.hash || initResult.txHash || initResult;
            
            console.log('✅ Step 1 Complete');
            console.log('   Hash: ' + initHash);
            console.log('');
            console.log('⏳ Waiting 5 seconds before Step 2...\n');
            await sleep(5000);

        } catch (error) {
            console.error('❌ Step 1 Failed: ' + error.message);
            console.log('\nTroubleshooting:');
            console.log('- Ensure MAINNET_MNEMONIC is correct');
            console.log('- Verify wallet is the contract owner');
            console.log('- Check account has sufficient KLV balance\n');
            process.exit(1);
        }

        // Step 2: Withdraw accumulated revenue
        console.log('📝 Step 2: Withdraw Accumulated Revenue');
        console.log('--------------------------------------');
        console.log('Function: withdraw');
        console.log('Amount: 30 KLV (30000000 precision)');
        console.log('');
        console.log('🚀 Sending transaction...\n');

        try {
            const withdrawTx = {
                receiver: CONFIG.CONTRACT,
                data: 'withdraw@' + ACCUMULATED_REVENUE.toString(16).padStart(16, '0'),
                amount: '0'
            };

            const withdrawResult = await account.sendTransaction(withdrawTx);
            const withdrawHash = withdrawResult.hash || withdrawResult.txHash || withdrawResult;
            
            console.log('✅ Step 2 Complete');
            console.log('   Hash: ' + withdrawHash);
            console.log('');

        } catch (error) {
            console.error('❌ Step 2 Failed: ' + error.message);
            console.log('\nNote: Step 1 may have succeeded even if Step 2 failed');
            console.log('Check kleverscan.org for transaction status\n');
            process.exit(1);
        }

        // Success
        console.log('\n✅✅ Setup Complete!');
        console.log('====================\n');
        console.log('📊 Summary:');
        console.log('  ✓ Project wallet initialized');
        console.log('  ✓ 30 KLV withdrawn to project wallet');
        console.log('  ✓ Future tickets will auto-split: 85% pool / 15% project\n');
        
        console.log('📍 Verify on KleverScan:');
        console.log('  Contract: https://kleverscan.org/account/' + CONFIG.CONTRACT);
        console.log('  Project:  https://kleverscan.org/account/' + CONFIG.PROJECT_WALLET + '\n');

    } catch (error) {
        console.error('❌ Fatal Error: ' + error.message);
        process.exit(1);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

module.exports = { CONFIG, ACCUMULATED_REVENUE };
