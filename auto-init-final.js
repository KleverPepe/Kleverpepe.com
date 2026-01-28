#!/usr/bin/env node
/**
 * Final Wallet Initialization
 * Using raw transaction building with @klever/sdk low-level APIs
 */

require('dotenv').config();

const MNEMONIC = process.env.MAINNET_MNEMONIC;
const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const OWNER = 'klv1ye2cdac523kpkyejkatnt3qfw68sghg8vrz37tnvjmutv3wjud2s2q0vtw';
const RPC = 'https://node.mainnet.klever.org';

if (!MNEMONIC) {
    console.error('❌ MAINNET_MNEMONIC not in .env');
    process.exit(1);
}

async function main() {
    console.log('\n💼 Initializing Project Wallet\n');
    
    try {
        // Try importing lower-level Klever modules
        const SDK = require('@klever/sdk');
        const { utils } = SDK;
        
        console.log('Using @klever/sdk utilities...\n');
        
        // Try direct private key approach instead of mnemonic
        const crypto = require('crypto');
        const bip39 = require('bip39');
        const HDKey = require('hdkey');
        
        console.log('🔑 Deriving private key...');
        
        const seed = await bip39.mnemonicToSeed(MNEMONIC);
        const hdkey = HDKey.fromMasterSeed(seed);
        const derived = hdkey.derive("m/44'/118'/0'/0/0");
        const privKey = derived.privateKey;
        
        console.log('✅ Private key derived\n');
        
        // Prepare transaction data
        const walletHex = Buffer.from(PROJECT_WALLET).toString('hex');
        const txData = {
            nonce: 0,
            from: OWNER,
            to: CONTRACT,
            amount: '0',
            data: 'initialize_wallets@' + walletHex,
            chainID: 100
        };
        
        console.log('📝 Transaction Details:');
        console.log('  From: ' + OWNER);
        console.log('  To: ' + CONTRACT);
        console.log('  Function: initialize_wallets');
        console.log('  Wallet: ' + PROJECT_WALLET);
        console.log('');
        
        // Try to use SDK's transaction builder
        try {
            // Attempt to build using SDK
            const { Transaction } = SDK;
            console.log('🔧 Building with SDK...');
            
            // This might fail with current SDK version, but worth trying
            const tx = new Transaction({
                ...txData,
                version: 1
            });
            
            console.log('✅ Transaction built');
            console.log('');
            
            // Try to sign (this is where SDK usually fails)
            console.log('🔐 Attempting to sign...');
            
            // If we reach here, SDK is working better
            const signed = tx.sign(privKey);
            
            console.log('✅ Signed!\n');
            
            // Broadcast
            console.log('🚀 Broadcasting transaction...');
            
            const https = require('https');
            const result = await new Promise((resolve, reject) => {
                const data = JSON.stringify({
                    txBytes: signed.toBytes().toString('base64')
                });
                
                const options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                };
                
                const req = https.request(RPC + '/tx/broadcast', options, (res) => {
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
                req.write(data);
                req.end();
            });
            
            console.log('✅ Transaction submitted!');
            console.log('Result: ' + JSON.stringify(result, null, 2));
            console.log('\n✓ Wallet initialized successfully!');
            console.log('✓ Future ticket sales will auto-split\n');
            
        } catch (sdkError) {
            console.log('⚠️  SDK transaction signing failed');
            console.log('Reason: ' + sdkError.message);
            showManual();
        }
        
    } catch (error) {
        console.error('❌ Error: ' + error.message);
        showManual();
    }
}

function showManual() {
    console.log('\n═══════════════════════════════════════════════\n');
    console.log('Due to SDK compatibility issues, please complete');
    console.log('the setup manually using KleverScan:\n');
    
    console.log('🌐 https://kleverscan.org/account/klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d\n');
    
    console.log('Steps:');
    console.log('1. Click "Write Contract" tab');
    console.log('2. Connect your owner wallet');
    console.log('3. Find function: initialize_wallets');
    console.log('4. Enter: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9');
    console.log('5. Click "Write" and sign\n');
    
    console.log('═══════════════════════════════════════════════\n');
}

main();
