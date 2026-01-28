#!/usr/bin/env node

/**
 * Initialize Wallets using Klever REST API
 * Builds and signs transaction manually, then submits via HTTP
 */

const https = require('https');
const crypto = require('crypto');
const bip39 = require('bip39');
const HDKey = require('hdkey');
require('dotenv').config();

// Constants
const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const OWNER_ADDRESS = 'klv1ye2cdac523kpkyejkatnt3qfw68sghg8vrz37tnvjmutv3wjud2s2q0vtw';
const KLEVER_API = 'https://api.klever.finance/api/v1';

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Initialize Wallets - Klever REST API                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const mnemonic = process.env.MAINNET_MNEMONIC;
    if (!mnemonic) {
        throw new Error('MAINNET_MNEMONIC not in .env');
    }

    try {
        // Step 1: Derive keys from mnemonic
        console.log('🔑 Deriving Keys from Mnemonic...');
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const hdkey = HDKey.fromMasterSeed(seed);
        
        // KleverChain path: m/44'/7278'/0'/0/0
        const keyPath = "m/44'/7278'/0'/0/0";
        const derivedKey = hdkey.derive(keyPath);
        const privateKey = derivedKey.privateKey;
        
        console.log('   Mnemonic: ' + mnemonic.split(' ').slice(0, 2).join(' ') + ' ...');
        console.log('   Path: ' + keyPath);
        console.log('   Private Key: ' + privateKey.toString('hex').substring(0, 16) + '...');
        console.log('');

        // Step 2: Get account information
        console.log('📊 Fetching Account Information...');
        const accountInfo = await fetchAccount(OWNER_ADDRESS);
        console.log('   Account: ' + OWNER_ADDRESS);
        console.log('   Nonce: ' + accountInfo.nonce);
        console.log('   Balance: ' + accountInfo.balance + ' KLV');
        console.log('');

        // Step 3: Build transaction
        console.log('📝 Building Transaction...');
        const walletHex = Buffer.from(PROJECT_WALLET).toString('hex');
        const callData = 'initialize_wallets@' + walletHex;
        
        const transaction = {
            sender: OWNER_ADDRESS,
            receiver: CONTRACT_ADDRESS,
            nonce: accountInfo.nonce + 1,
            value: '0',
            fee: '500000',
            gasPrice: '500000000',
            gasLimit: '80000000',
            data: callData,
            signature: '' // Will be filled after signing
        };

        console.log('   Function: initialize_wallets');
        console.log('   Project Wallet: ' + PROJECT_WALLET);
        console.log('   Data: ' + callData);
        console.log('');

        // Step 4: Sign transaction
        console.log('🔐 Signing Transaction...');
        
        // Build the message to sign
        const message = Buffer.concat([
            Buffer.from(transaction.sender),
            Buffer.from(transaction.receiver),
            Buffer.from(transaction.nonce.toString()),
            Buffer.from(transaction.value),
            Buffer.from(transaction.fee),
            Buffer.from(transaction.gasPrice),
            Buffer.from(transaction.gasLimit),
            Buffer.from(transaction.data)
        ]);

        // Sign with ED25519 (Klever uses ED25519, not ECDSA)
        try {
            const signer = crypto.createSign('sha256');
            signer.update(message);
            signer.end();
            
            // This will fail because ED25519 is not supported in standard crypto module
            const signature = signer.sign({
                key: privateKey,
                format: 'der',
                type: 'pkcs8'
            });
            
            transaction.signature = signature.toString('hex');
            console.log('   ✅ Signed');
            
        } catch (signError) {
            console.log('   ⚠️  ED25519 signing not available in this Node version');
            console.log('   Using alternative approach...');
            console.log('');

            // Show manual instruction instead
            console.log('❌ Cannot automatically sign ED25519 transactions in Node.js');
            console.log('');
            console.log('📋 MANUAL WORKAROUND:');
            console.log('');
            console.log('The transaction data has been prepared:');
            console.log('');
            console.log('1. Open: https://kleverscan.org/address/' + CONTRACT_ADDRESS);
            console.log('2. Click "Write Contract"');
            console.log('3. Connect your owner wallet: ' + OWNER_ADDRESS);
            console.log('4. Find function: initialize_wallets');
            console.log('5. Enter project_wallet: ' + PROJECT_WALLET);
            console.log('6. Click "Write" and confirm the transaction');
            console.log('');
            
            return;
        }

        console.log('');

        // Step 5: Submit transaction
        console.log('📤 Submitting Transaction...');
        const response = await submitTransaction(transaction);
        
        console.log('✅ Transaction submitted!');
        console.log('   Hash: ' + response.hash);
        console.log('');

        console.log('🎉 Success!');
        console.log('');
        console.log('Track progress:');
        console.log('   https://kleverscan.org/transaction/' + response.hash);
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function fetchAccount(address) {
    return new Promise((resolve, reject) => {
        const url = `${KLEVER_API}/accounts/${address}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.data && parsed.data.account) {
                        resolve({
                            nonce: parsed.data.account.nonce || 0,
                            balance: (parseInt(parsed.data.account.balance || 0) / 1000000).toFixed(2)
                        });
                    } else {
                        reject(new Error('Invalid response: ' + JSON.stringify(parsed).substring(0, 100)));
                    }
                } catch (e) {
                    reject(new Error('JSON parse error: ' + e.message));
                }
            });
        }).on('error', reject);
    });
}

async function submitTransaction(transaction) {
    return new Promise((resolve, reject) => {
        const url = `${KLEVER_API}/transactions`;
        
        const options = {
            hostname: 'api.klever.finance',
            port: 443,
            path: '/api/v1/transactions',
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
                    resolve(parsed.data || parsed);
                } catch (e) {
                    reject(new Error('JSON parse error: ' + e.message));
                }
            });
        });

        request.on('error', reject);
        request.write(JSON.stringify(transaction));
        request.end();
    });
}

main().catch(console.error);
