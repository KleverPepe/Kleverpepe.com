#!/usr/bin/env node

/**
 * DEPLOY: Initialize KPEPE Jackpot Wallets
 * Sends the actual transaction to the blockchain
 */

require('dotenv').config();
const { TransactionType } = require('@klever/sdk-node');
const { Account, Transaction } = require('@klever/sdk-node');

// Configuration
const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const PRIZE_POOL_WALLET = 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2';
const NODE_URL = 'https://node.mainnet.klever.finance';

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      DEPLOYING: Initialize Wallets Transaction            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const mnemonic = process.env.MAINNET_MNEMONIC;

    if (!mnemonic) {
        console.error('❌ ERROR: MAINNET_MNEMONIC not found in .env');
        process.exit(1);
    }

    try {
        console.log('🔐 Creating account from mnemonic...');
        const account = new Account(mnemonic);
        await account.ready();
        
        const address = await account.getAddress();
        console.log('✅ Wallet address:', address);
        console.log('');

        // Get account info
        console.log('📊 Fetching account balance...');
        const accountInfo = await account.getAccountInfo();
        const balance = accountInfo?.balance || 0;
        console.log('💰 Balance:', (balance / 1e6).toFixed(6), 'KLV');
        
        if (balance < 3000000) { // 3 KLV in base units
            console.warn('⚠️  Warning: Low balance. Need at least 3 KLV for gas.');
        }
        console.log('');

        // Build the smart contract transaction
        console.log('📝 Building smart contract transaction...');
        
        const tx = await account.buildTransaction({
            type: TransactionType.SmartContract,
            payload: {
                scType: 'InvokeContract',
                contractAddress: CONTRACT_ADDRESS,
                callValue: 0,
                callData: [
                    'initializeWallets',
                    PROJECT_WALLET,
                    PRIZE_POOL_WALLET
                ]
            }
        });

        console.log('');
        console.log('📊 Transaction Details:');
        console.log('─────────────────────────────────────────');
        console.log('Type:            Smart Contract Call');
        console.log('Contract:        ' + CONTRACT_ADDRESS);
        console.log('Function:        initializeWallets');
        console.log('Project Wallet:  ' + PROJECT_WALLET);
        console.log('Prize Pool:      ' + PRIZE_POOL_WALLET);
        console.log('─────────────────────────────────────────');
        console.log('');

        // Sign the transaction
        console.log('🔏 Signing transaction...');
        const signedTx = await account.signTransaction(tx);
        console.log('✅ Transaction signed');
        console.log('');

        // Broadcast
        console.log('🚀 Broadcasting to KleverChain mainnet...');
        console.log('⏳ Please wait...');
        console.log('');

        const result = await account.broadcastTransaction(signedTx);

        if (result && result.hash) {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║                  ✅ SUCCESS!                                ║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
            console.log('🎉 Transaction sent successfully!');
            console.log('');
            console.log('📋 Transaction Hash:', result.hash);
            console.log('🔗 View on KleverScan:');
            console.log('   https://kleverscan.org/transaction/' + result.hash);
            console.log('');
            console.log('⏳ Wait 30-60 seconds for confirmation, then:');
            console.log('');
            console.log('1. Check contract state:');
            console.log('   https://kleverscan.org/address/' + CONTRACT_ADDRESS);
            console.log('');
            console.log('2. Verify wallets are set:');
            console.log('   • projectWallet should be: ' + PROJECT_WALLET);
            console.log('   • prizePoolWallet should be: ' + PRIZE_POOL_WALLET);
            console.log('');
            console.log('3. Test with a new ticket purchase');
            console.log('   • 85% should go to prize pool ✓');
            console.log('   • 15% should go to project wallet ✓');
            console.log('');
        } else {
            console.error('❌ Transaction failed - no hash returned');
            console.error('Response:', JSON.stringify(result, null, 2));
            process.exit(1);
        }

    } catch (error) {
        console.error('');
        console.error('╔════════════════════════════════════════════════════════════╗');
        console.error('║                    ❌ ERROR                                 ║');
        console.error('╚════════════════════════════════════════════════════════════╝');
        console.error('');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data || error.response, null, 2));
        }
        
        if (error.message.includes('already initialized')) {
            console.error('');
            console.error('ℹ️  Note: This might mean wallets are already initialized.');
            console.error('   Check the contract state on KleverScan to verify.');
        }
        
        console.error('');
        process.exit(1);
    }
}

main();
