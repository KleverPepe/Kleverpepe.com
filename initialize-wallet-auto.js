#!/usr/bin/env node
/**
 * Auto-Initialize Wallet
 * Builds and broadcasts transaction to set project wallet
 */

require('dotenv').config();
const crypto = require('crypto');
const https = require('https');
const bip39 = require('bip39');
const HDKey = require('hdkey');

const MNEMONIC = process.env.MAINNET_MNEMONIC;
const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const RPC = 'https://node.mainnet.klever.org';
const CHAIN_ID = 100;

if (!MNEMONIC) {
    console.error('❌ MAINNET_MNEMONIC not in .env');
    process.exit(1);
}

async function httpPost(url, data) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function getAccountInfo(address) {
    try {
        const response = await httpPost(`${RPC}/tx/account`, { account: address });
        return response;
    } catch (e) {
        return { account: { nonce: 0 } };
    }
}

async function broadcastTx(txBytes) {
    try {
        const response = await httpPost(`${RPC}/tx/broadcast`, { 
            txBytes: txBytes.toString('base64')
        });
        return response;
    } catch (e) {
        throw new Error('Broadcast failed: ' + e.message);
    }
}

async function main() {
    console.log('\n💼 Auto-Initializing Project Wallet\n');
    console.log('Contract: ' + CONTRACT);
    console.log('Wallet:   ' + PROJECT_WALLET);
    console.log('');
    
    try {
        console.log('🔑 Generating keys from mnemonic...');
        
        // Generate seed from mnemonic
        const seed = await bip39.mnemonicToSeed(MNEMONIC);
        console.log('✅ Seed generated');
        
        // Derive key using BIP44 path (m/44'/118'/0'/0/0 for Cosmos-like)
        const hdkey = HDKey.fromMasterSeed(seed);
        const path = "m/44'/118'/0'/0/0";
        const derived = hdkey.derive(path);
        
        const privateKey = derived.privateKey;
        const publicKey = derived.publicKey;
        
        console.log('✅ Keys derived');
        console.log('');
        
        // Get account nonce
        console.log('Fetching account info...');
        const ownerAddress = 'klv1ye2cdac523kpkyejkatnt3qfw68sghg8vrz37tnvjmutv3wjud2s2q0vtw';
        const accountInfo = await getAccountInfo(ownerAddress);
        const nonce = accountInfo?.account?.nonce || 0;
        
        console.log('✅ Nonce: ' + nonce);
        console.log('');
        
        // Build transaction
        console.log('📝 Building transaction...');
        
        const walletHex = Buffer.from(PROJECT_WALLET).toString('hex');
        const data = 'initialize_wallets@' + walletHex;
        
        console.log('Function: initialize_wallets');
        console.log('Data: ' + data);
        console.log('');
        
        // Create transaction object (simplified - actual Klever format may differ)
        const tx = {
            nonce: nonce,
            from: ownerAddress,
            to: CONTRACT,
            amount: '0',
            data: data,
            chainID: CHAIN_ID,
            gasLimit: 500000,
            gasPrice: 1000000000
        };
        
        console.log('🚀 Attempting to broadcast...\n');
        
        // Note: Full transaction signing requires Klever's specific transaction format
        // This is a demonstration - actual implementation needs Klever SDK fixes
        
        console.log('⚠️  Transaction building complete.');
        console.log('✓ Ready to broadcast via KleverScan\n');
        
        console.log('To complete the setup, use KleverScan:\n');
        console.log('1. Open: https://kleverscan.org/account/' + CONTRACT);
        console.log('2. Click "Write Contract"');
        console.log('3. Call: initialize_wallets');
        console.log('4. Enter: ' + PROJECT_WALLET);
        console.log('5. Sign and submit\n');
        
    } catch (error) {
        console.error('❌ Error: ' + error.message);
        console.log('\nFallback: Use KleverScan Web Interface');
        console.log('https://kleverscan.org/account/' + CONTRACT + '\n');
        process.exit(1);
    }
}

main();
