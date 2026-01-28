#!/usr/bin/env node

/**
 * Initialize KPEPE Jackpot Wallets - Direct Method
 * Sends the initializeWallets transaction via Klever SDK
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const PRIZE_POOL_WALLET = 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2';

// Load environment
require('dotenv').config();

const mnemonic = process.env.MAINNET_MNEMONIC;

if (!mnemonic) {
    console.error('❌ ERROR: MAINNET_MNEMONIC not found in .env');
    console.error('Add this to .env file:');
    console.error('MAINNET_MNEMONIC=your mnemonic phrase');
    process.exit(1);
}

// Import ethers for wallet management
const { ethers } = require('ethers');

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        KPEPE Jackpot - Initialize Wallets                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // Create wallet from mnemonic
        console.log('🔐 Loading wallet from mnemonic...');
        const wallet = ethers.HDNodeWallet.fromMnemonic(
            ethers.Mnemonic.fromPhrase(mnemonic),
            "m/44'/7278'/0'/0"
        );

        console.log('👤 Wallet address:', wallet.address);
        console.log('');

        // Create transaction
        console.log('📝 Building initializeWallets transaction...');
        console.log('');
        
        const transactionData = {
            type: 0,  // Smart contract call
            payload: {
                receiver: CONTRACT_ADDRESS,
                amount: 0,
                kda: '',
                data: [
                    'initializeWallets',
                    PROJECT_WALLET,
                    PRIZE_POOL_WALLET
                ]
            }
        };

        console.log('📊 Transaction Details:');
        console.log('─────────────────────────────────────────');
        console.log('Function:        initializeWallets');
        console.log('Contract:        ' + CONTRACT_ADDRESS);
        console.log('Project Wallet:  ' + PROJECT_WALLET);
        console.log('Prize Pool:      ' + PRIZE_POOL_WALLET);
        console.log('Amount:          0 KLV (just gas)');
        console.log('─────────────────────────────────────────');
        console.log('');

        // Save transaction for manual use
        const txFile = path.join(__dirname, 'init-wallets-tx.json');
        fs.writeFileSync(txFile, JSON.stringify(transactionData, null, 2));
        console.log('💾 Transaction saved to: init-wallets-tx.json');
        console.log('');

        console.log('✅ NEXT STEPS:');
        console.log('─────────────────────────────────────────');
        console.log('');
        console.log('Since Klever CLI is not officially available,');
        console.log('use one of these methods to send the transaction:');
        console.log('');
        console.log('1️⃣  MOBILE APP (Recommended):');
        console.log('   • Open Klever Wallet on your phone');
        console.log('   • Tap "Send" → "Advanced" → "Smart Contract"');
        console.log('   • Fill in exactly:');
        console.log('     To: ' + CONTRACT_ADDRESS);
        console.log('     Method: initializeWallets');
        console.log('     Arg 1: ' + PROJECT_WALLET);
        console.log('     Arg 2: ' + PRIZE_POOL_WALLET);
        console.log('   • Confirm and sign');
        console.log('');
        console.log('2️⃣  KLEVERSCAN (If available):');
        console.log('   • Go to: https://kleverscan.org/address/' + CONTRACT_ADDRESS);
        console.log('   • Click "Write Contract"');
        console.log('   • Select "initializeWallets"');
        console.log('   • Enter both wallet addresses');
        console.log('   • Sign with your wallet');
        console.log('');
        console.log('3️⃣  JAVASCRIPT/WEB3:');
        console.log('   • Use the transaction JSON from: init-wallets-tx.json');
        console.log('   • Send via your preferred Web3 provider');
        console.log('');
        console.log('─────────────────────────────────────────');
        console.log('');
        console.log('⏳ After sending:');
        console.log('   1. Wait 30 seconds for confirmation');
        console.log('   2. Check https://kleverscan.org/address/' + CONTRACT_ADDRESS);
        console.log('   3. Verify wallets are set (not 0x0000...)');
        console.log('   4. Test with a new ticket purchase');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
