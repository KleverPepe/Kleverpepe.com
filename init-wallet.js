#!/usr/bin/env node
require('dotenv').config();

const MNEMONIC = process.env.MAINNET_MNEMONIC;
const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';

if (!MNEMONIC) {
    console.error('❌ MAINNET_MNEMONIC not in .env');
    process.exit(1);
}

async function main() {
    console.log('\n💼 Initializing Project Wallet\n');
    
    try {
        const SDK = require('@klever/sdk');
        const { Account } = SDK;
        
        console.log('Creating account...');
        const account = new Account({ mnemonic: MNEMONIC });
        console.log('✅ Account: ' + account.address);
        
        const walletHex = Buffer.from(PROJECT_WALLET).toString('hex');
        
        const tx = {
            receiver: CONTRACT,
            data: 'initialize_wallets@' + walletHex,
            amount: '0'
        };
        
        console.log('Signing transaction...');
        const signedTx = await account.signTransaction(tx);
        
        console.log('Broadcasting...');
        const result = await account.broadcastTransactions([signedTx]);
        
        console.log('\n✅ Transaction submitted!');
        console.log('Hash: ' + result.txs[0]);
        console.log('\n✓ Wallet initialized');
        console.log('✓ Future sales auto-split: 85% pool / 15% project\n');
        
    } catch (error) {
        console.error('❌ Error: ' + error.message);
        process.exit(1);
    }
}

main();
