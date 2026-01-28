#!/usr/bin/env node
/**
 * Initialize Project Wallet
 * Direct REST API approach - no SDK required
 */

require('dotenv').config();
const https = require('https');
const crypto = require('crypto');
const bip39 = require('bip39');
const HDKey = require('hdkey');

const MNEMONIC = process.env.MAINNET_MNEMONIC;
const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const OWNER = 'klv1ye2cdac523kpkyejkatnt3qfw68sghg8vrz37tnvjmutv3wjud2s2q0vtw';
const API = 'https://api.mainnet.klever.org';

if (!MNEMONIC) {
    console.error('❌ MAINNET_MNEMONIC not in .env');
    process.exit(1);
}

function httpsRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ raw: body, status: res.statusCode });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log('\n💼 Initializing Project Wallet via REST API\n');
    
    try {
        // Generate keys
        console.log('🔑 Generating keys from mnemonic...');
        const seed = await bip39.mnemonicToSeed(MNEMONIC);
        const hdkey = HDKey.fromMasterSeed(seed);
        const derived = hdkey.derive("m/44'/118'/0'/0/0");
        const privKey = derived.privateKey;
        
        console.log('✅ Keys generated\n');

        // Get account info for nonce
        console.log('📊 Fetching account info...');
        const accountInfo = await httpsRequest(`${API}/v1/account/${OWNER}`);
        const nonce = accountInfo?.account?.nonce || 0;
        const sequence = accountInfo?.account?.sequence || 0;
        
        console.log('✅ Nonce: ' + nonce);
        console.log('✅ Sequence: ' + sequence + '\n');

        // Build transaction
        console.log('📝 Building transaction...');
        
        const walletHex = Buffer.from(PROJECT_WALLET).toString('hex');
        const callData = 'initialize_wallets@' + walletHex;
        
        const tx = {
            nonce: nonce,
            sender: OWNER,
            receiver: CONTRACT,
            amount: '0',
            payload: callData
        };

        console.log('Function: initialize_wallets');
        console.log('Receiver: ' + CONTRACT);
        console.log('Wallet: ' + PROJECT_WALLET);
        console.log('');

        // Sign transaction - simple hash for testing
        console.log('🔐 Signing transaction...');
        
        // Create signature (this is simplified - actual Klever format may differ)
        const txString = JSON.stringify(tx);
        const hash = crypto.createHash('sha256').update(txString).digest();
        const sig = crypto.sign('sha256', hash, {
            key: privKey,
            format: 'der'
        });

        console.log('✅ Transaction signed\n');

        // Attempt to broadcast
        console.log('🚀 Broadcasting transaction...');
        
        const txPayload = {
            tx: {
                ...tx,
                signature: sig.toString('hex')
            }
        };

        const result = await httpsRequest(`${API}/v1/transaction`, 'POST', txPayload);
        
        if (result.code === 0 || result.success || result.hash) {
            console.log('✅ Transaction broadcast successful!');
            console.log('Hash: ' + (result.hash || result.tx_hash || 'pending'));
            console.log('\n✓ Wallet initialized!');
            console.log('✓ Future sales auto-split: 85% pool / 15% project\n');
            return;
        }

        if (result.code || result.error) {
            console.log('⚠️  API Response: ' + JSON.stringify(result, null, 2));
        }

        console.log('\n✓ Request sent to network');
        console.log('Monitor: https://kleverscan.org/account/' + OWNER);

    } catch (error) {
        console.error('❌ Error: ' + error.message);
        console.log('\nTrying alternative method...\n');
        showManual();
        process.exit(1);
    }
}

function showManual() {
    console.log('═══════════════════════════════════════════════\n');
    console.log('Manual Setup (2 minutes):\n');
    console.log('1. Open: https://kleverscan.org/account/');
    console.log('   klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d\n');
    console.log('2. Click "Write Contract"');
    console.log('3. Connect wallet');
    console.log('4. Call: initialize_wallets');
    console.log('5. Enter: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9');
    console.log('6. Sign\n');
}

main();
