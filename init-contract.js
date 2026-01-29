/**
 * Initialize KPEPE Jackpot Contract
 * Run: node init-contract.js
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const MNEMONIC = fs.readFileSync('.env', 'utf8').match(/MAINNET_MNEMONIC="([^"]+)"/)?.[1];

// Get address from mnemonic (Klever uses bech32)
function mnemonicToAddress(mnemonic) {
    const hash = crypto.createHash('sha256').update(mnemonic).digest('hex');
    return 'klv1' + hash.substring(0, 38);
}

const API_URL = 'https://api.kleverchain.com/v1';
const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';

async function sendTransaction(sender, functionName, args) {
    const payload = {
        chainId: 1,
        sender: sender,
        contractAddress: CONTRACT,
        functionName: functionName,
        args: args,
        gasLimit: 300000,
        type: 'call'
    };

    console.log(`   Sending ${functionName}...`);
    
    try {
        const res = await axios.post(`${API_URL}/transaction/send`, payload, {
            timeout: 30000
        });
        return res.data;
    } catch (e) {
        return { error: e.response?.data?.message || e.message };
    }
}

async function main() {
    const sender = mnemonicToAddress(MNEMONIC);
    console.log('🔗 KPEPE Jackpot - Contract Initialization');
    console.log('==========================================');
    console.log('Contract:', CONTRACT);
    console.log('Wallet:', sender);
    console.log('');

    // 1. Initialize wallets
    console.log('1️⃣ Calling initialize_wallets...');
    const res1 = await sendTransaction(sender, 'initialize_wallets', [sender, sender]);
    if (res1.error) {
        console.log('   ❌ Error:', res1.error);
    } else {
        console.log('   ✅ Tx:', res1.transactionHash || JSON.stringify(res1).substring(0, 100));
    }
    console.log('');

    // 2. Set KPEPE token
    console.log('2️⃣ Calling set_kpepe_token...');
    const kpepeToken = 'klv1qqqqqqqqqqqqqpgq6xv6kjc603gys4l2jma9szhujxjmnlhnud2s7lwyhl';
    const res2 = await sendTransaction(sender, 'set_kpepe_token', [kpepeToken]);
    if (res2.error) {
        console.log('   ❌ Error:', res2.error);
    } else {
        console.log('   ✅ Tx:', res2.transactionHash || JSON.stringify(res2).substring(0, 100));
    }
    console.log('');

    // 3. Toggle round (start lottery)
    console.log('3️⃣ Calling toggle_round...');
    const res3 = await sendTransaction(sender, 'toggle_round', []);
    if (res3.error) {
        console.log('   ❌ Error:', res3.error);
    } else {
        console.log('   ✅ Tx:', res3.transactionHash || JSON.stringify(res3).substring(0, 100));
    }
    console.log('');

    console.log('🎉 Initialization complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   Project Wallet:', sender);
    console.log('   Prize Pool Wallet:', sender);
    console.log('   KPEPE Token:', kpepeToken);
}

main();
