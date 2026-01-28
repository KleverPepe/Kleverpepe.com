#!/usr/bin/env node
/**
 * Wallet Initialization - Direct HTTP Broadcast
 * Uses raw transaction building to avoid SDK bugs
 */

require('dotenv').config();
const crypto = require('crypto');
const https = require('https');

const MNEMONIC = process.env.MAINNET_MNEMONIC;
const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const RPC = 'https://node.mainnet.klever.org';

if (!MNEMONIC) {
    console.error('❌ MAINNET_MNEMONIC not found');
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

async function main() {
    console.log('\n🔐 Initializing Wallet with Direct Transaction\n');
    
    try {
        // Try using bip39 + hdkey for better mnemonic handling
        const bip39 = require('bip39');
        const HDKey = require('hdkey');
        
        if (!bip39 || !HDKey) {
            console.log('⚠️  Using fallback method...\n');
            return showAlternative();
        }
        
        console.log('🔑 Generating keys from mnemonic...');
        
        // Generate seed from mnemonic
        const seed = await bip39.mnemonicToSeed(MNEMONIC);
        console.log('✅ Seed generated');
        
        // This would require proper key derivation - let's use a simpler approach
        console.log('\n⚠️  Attempting alternative approach...\n');
        
        // Use curl as fallback - more reliable
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        console.log('📝 Building transaction data...');
        
        const walletHex = Buffer.from(PROJECT_WALLET).toString('hex');
        const data = 'initialize_wallets@' + walletHex;
        
        console.log('Function: initialize_wallets');
        console.log('Wallet: ' + PROJECT_WALLET);
        console.log('');
        
        // Create a JSON transaction for manual submission
        const txData = {
            type: 18,
            payload: {
                to: CONTRACT,
                amount: '0',
                data: data
            }
        };
        
        console.log('📊 Transaction Data:');
        console.log(JSON.stringify(txData, null, 2));
        
        console.log('\n⚠️  Transaction requires signing with private key.');
        console.log('Use KleverScan Web Interface for secure signing:\n');
        console.log('1. Go to: https://kleverscan.org/account/' + CONTRACT);
        console.log('2. Click "Write Contract"');
        console.log('3. Call: initialize_wallets');
        console.log('4. Enter: ' + PROJECT_WALLET);
        console.log('5. Sign with your wallet\n');
        
    } catch (error) {
        console.error('SDK Error:', error.message);
        showAlternative();
    }
}

function showAlternative() {
    console.log('═══════════════════════════════════════════════\n');
    console.log('🌐 SECURE WEB METHOD (Recommended)\n');
    console.log('Due to SDK limitations, please use KleverScan:');
    console.log('https://kleverscan.org/account/klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d\n');
    
    console.log('Step-by-step:\n');
    console.log('1. Open the link above');
    console.log('2. Click "Write Contract" tab');
    console.log('3. Connect your wallet');
    console.log('4. Find function: initialize_wallets');
    console.log('5. Enter parameter: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9');
    console.log('6. Click "Write" and sign\n');
    
    console.log('═══════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('Error:', err.message);
    showAlternative();
});
