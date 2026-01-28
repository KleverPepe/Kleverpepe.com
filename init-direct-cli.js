#!/usr/bin/env node

/**
 * Direct Klever Network Call - Initialize Wallets
 * Uses Klever node RPC endpoint
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
require('dotenv').config();

// Constants
const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const OWNER_ADDRESS = 'klv1ye2cdac523kpkyejkatnt3qfw68sghg8vrz37tnvjmutv3wjud2s2q0vtw';

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Initialize Lottery - Direct Node Call               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const mnemonic = process.env.MAINNET_MNEMONIC;
    if (!mnemonic) {
        throw new Error('MAINNET_MNEMONIC not in .env');
    }

    try {
        // Step 1: Try using KleverChain CLI
        console.log('🔐 Attempting direct CLI call...\n');
        
        // Build the transaction using klever-cli (if available)
        const command = buildCleverTransaction();
        console.log('Command:', command);
        console.log('');

        console.log('❌ Note: Klever CLI not installed');
        console.log('   The contract function needs to be called with:');
        console.log('   - Function: initialize_wallets');
        console.log('   - Parameter: ' + PROJECT_WALLET);
        console.log('');

        // Step 2: Show manual workaround
        console.log('📋 Manual Workaround for KleverScan:');
        console.log('');
        console.log('1. Go to: https://kleverscan.org/address/' + CONTRACT_ADDRESS);
        console.log('2. Click "Write Contract"');
        console.log('3. Connect your wallet (the owner: ' + OWNER_ADDRESS + ')');
        console.log('4. Find function: initialize_wallets');
        console.log('5. Enter project_wallet: ' + PROJECT_WALLET);
        console.log('6. Click "Write"');
        console.log('');

        // Step 3: Show what we're trying to do
        console.log('📝 Technical Details:');
        console.log('   Contract Call Data:');
        
        // Encode the wallet address as hex for the call
        const walletHex = Buffer.from(PROJECT_WALLET).toString('hex');
        const callData = 'initialize_wallets@' + walletHex;
        
        console.log('   - Function: initialize_wallets');
        console.log('   - Wallet param: ' + PROJECT_WALLET);
        console.log('   - Hex encoding: ' + walletHex);
        console.log('   - Full call data: ' + callData);
        console.log('');

        console.log('🔍 Checking if we can use Klever Node directly...');
        
        // Try to call Klever node
        try {
            const endpoint = 'https://node.mainnet.klever.org';
            console.log('   Testing endpoint: ' + endpoint);
            console.log('');
            
            // Try a simple RPC call
            const result = await rpcCall(endpoint, 'eth_chainId', []);
            console.log('   ✅ Node is responding!');
            console.log('   Chain ID:', result);
            
        } catch (error) {
            console.log('   ⚠️  Node endpoint test failed:', error.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

function buildCleverTransaction() {
    // Build the transaction string that would work with Klever CLI
    return `klever tx call \\
  --receiver ${CONTRACT_ADDRESS} \\
  --function initialize_wallets \\
  --arguments ${PROJECT_WALLET}`;
}

async function rpcCall(endpoint, method, params) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const request = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.result || parsed);
                } catch (e) {
                    reject(new Error('Invalid JSON response: ' + data.substring(0, 100)));
                }
            });
        });

        request.on('error', reject);
        request.write(JSON.stringify({
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: 1
        }));
        request.end();
    });
}

main().catch(console.error);
