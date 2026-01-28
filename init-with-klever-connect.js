#!/usr/bin/env node

/**
 * Initialize Lottery Contract Wallets
 * Uses @klever/connect-crypto and @klever/connect-transactions for signing
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Klever packages
const kleverCore = require('@klever/sdk');
const { Account, Transaction } = kleverCore;

// Constants
const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const RPC_URL = 'https://node.mainnet.klever.org';

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Initialize Lottery Wallets - Klever Connect          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        const mnemonic = process.env.MAINNET_MNEMONIC;
        if (!mnemonic) {
            throw new Error('MAINNET_MNEMONIC not set in .env');
        }

        console.log('🔑 Account Setup');
        console.log('   Mnemonic: ' + mnemonic.split(' ').slice(0, 2).join(' ') + ' ...');
        console.log('   Contract: ' + CONTRACT_ADDRESS);
        console.log('   Project Wallet: ' + PROJECT_WALLET);
        console.log('');

        // Try building transaction using Klever SDK directly
        console.log('📝 Building Contract Call Transaction...');
        
        // Build initialize_wallets call
        // Function signature: initialize_wallets(project_wallet: ManagedAddress)
        const functionName = 'initialize_wallets';
        
        // Klever contract calls use specific format
        const contractCall = {
            receiver: CONTRACT_ADDRESS,
            data: functionName + '@' + Buffer.from(PROJECT_WALLET).toString('hex'),
            value: '0'
        };

        console.log('   Function:', functionName);
        console.log('   Data:', contractCall.data);
        console.log('   Receiver:', contractCall.receiver);
        console.log('');

        // Create transaction
        const tx = new Transaction({
            sender: await getAddressFromMnemonic(mnemonic),
            receiver: contractCall.receiver,
            amount: '0',
            payloadType: 'ContractCall',
            data: contractCall.data,
            nonce: 1, // Will be fetched from network
            gasLimit: 80000000,
            gasPrice: 500000000
        });

        console.log('✅ Transaction built');
        console.log('   From:', tx.sender);
        console.log('   To:', tx.receiver);
        console.log('');

        // Try to sign
        console.log('🔐 Signing Transaction...');
        // This is where it typically fails with @klever/sdk v4.2.1
        const signedTx = await tx.sign(mnemonic);
        console.log('✅ Signed successfully');
        console.log('');

        // Submit to network
        console.log('📤 Submitting to Klever Network...');
        const txHash = await submitTransaction(signedTx);
        console.log('✅ Transaction submitted');
        console.log('   Hash:', txHash);
        console.log('');

        console.log('🎉 Wallet initialization complete!');
        console.log('');
        console.log('📍 Track transaction:');
        console.log('   https://kleverscan.org/transaction/' + txHash);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('');
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

async function getAddressFromMnemonic(mnemonic) {
    try {
        // Try using SDK's Account
        const account = new Account();
        await account.loadFromMnemonic(mnemonic);
        return account.address;
    } catch (error) {
        console.error('Could not derive address from mnemonic:', error.message);
        throw error;
    }
}

async function submitTransaction(signedTx) {
    // TODO: Submit to Klever network
    // This requires proper RPC integration
    throw new Error('Transaction submission not yet implemented');
}

main().catch(console.error);
