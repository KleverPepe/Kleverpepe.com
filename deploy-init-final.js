#!/usr/bin/env node

/**
 * DEPLOY: Initialize KPEPE Jackpot Wallets - FINAL VERSION
 * Uses @klever/sdk-node v2.4.2 to send transaction
 */

require('dotenv').config();
const { Account, TransactionType } = require('@klever/sdk-node');

// Configuration
const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const PRIZE_POOL_WALLET = 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2';

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
        console.log('🔐 Initializing account from mnemonic...');
        
        // Create account instance
        const account = new Account(mnemonic);
        await account.init();
        
        const address = account.getAddress();
        console.log('✅ Wallet address:', address);
        console.log('');

        // Sync with network
        console.log('🔄 Syncing with KleverChain...');
        await account.sync();
        
        const nonce = account.getNonce();
        console.log('📊 Account nonce:', nonce);
        console.log('');

        // Build smart contract call
        console.log('📝 Building initializeWallets transaction...');
        console.log('');
        console.log('Transaction Details:');
        console.log('─────────────────────────────────────────');
        console.log('Contract:        ' + CONTRACT_ADDRESS);
        console.log('Function:        initializeWallets');
        console.log('Arg 1 (pw):      ' + PROJECT_WALLET);
        console.log('Arg 2 (ppw):     ' + PRIZE_POOL_WALLET);
        console.log('─────────────────────────────────────────');
        console.log('');

        // Create transaction payload
        const payload = {
            receiver: CONTRACT_ADDRESS,
            amount: 0,
            kda: '',
            data: [
                'initializeWallets',
                PROJECT_WALLET,
                PRIZE_POOL_WALLET
            ]
        };

        // Build and sign transaction
        console.log('🔏 Signing transaction...');
        const tx = await account.buildTransaction(
            TransactionType.Transfer,
            payload
        );

        // Broadcast
        console.log('🚀 Broadcasting to KleverChain mainnet...');
        console.log('⏳ Waiting for confirmation...');
        console.log('');

        const result = await account.broadcastTransactions([tx]);

        if (result && result.txsHashes && result.txsHashes.length > 0) {
            const txHash = result.txsHashes[0];
            
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║                  ✅ SUCCESS!                                ║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
            console.log('🎉 Wallet initialization transaction sent!');
            console.log('');
            console.log('📋 Transaction Hash:');
            console.log('   ' + txHash);
            console.log('');
            console.log('🔗 View on KleverScan:');
            console.log('   https://kleverscan.org/transaction/' + txHash);
            console.log('');
            console.log('⏳ NEXT STEPS:');
            console.log('─────────────────────────────────────────');
            console.log('1. Wait 30-60 seconds for confirmation');
            console.log('');
            console.log('2. Verify wallets are initialized:');
            console.log('   https://kleverscan.org/address/' + CONTRACT_ADDRESS);
            console.log('   • Check projectWallet = ' + PROJECT_WALLET.substring(0, 20) + '...');
            console.log('   • Check prizePoolWallet = ' + PRIZE_POOL_WALLET.substring(0, 20) + '...');
            console.log('');
            console.log('3. Test with new ticket:');
            console.log('   • 85% → Prize pool ✓');
            console.log('   • 15% → Project wallet ✓');
            console.log('');
            console.log('🎊 Revenue split is now ACTIVE!');
            console.log('');
        } else {
            console.error('❌ Transaction may have failed');
            console.error('Response:', JSON.stringify(result, null, 2));
            process.exit(1);
        }

    } catch (error) {
        console.error('');
        console.error('╔════════════════════════════════════════════════════════════╗');
        console.error('║                    ❌ ERROR                                 ║');
        console.error('╚════════════════════════════════════════════════════════════╝');
        console.error('');
        console.error('Message:', error.message);
        
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data || error.response, null, 2));
        }
        
        if (error.stack) {
            console.error('');
            console.error('Stack trace:');
            console.error(error.stack.split('\n').slice(0, 5).join('\n'));
        }
        
        if (error.message.includes('already')) {
            console.error('');
            console.error('ℹ️  Wallets may already be initialized.');
            console.error('   Check: https://kleverscan.org/address/' + CONTRACT_ADDRESS);
        }
        
        console.error('');
        process.exit(1);
    }
}

main();
