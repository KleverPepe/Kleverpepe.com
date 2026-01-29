const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const mnemonic = env.match(/MAINNET_MNEMONIC=\"([^\"]+)\"/)[1];

// Simple key derivation (for Klever)
function deriveKey(mnemonic) {
    return crypto.createHash('sha256').update(mnemonic).digest('hex');
}

function deriveAddress(mnemonic) {
    const hash = crypto.createHash('sha256').update(mnemonic).digest('hex');
    return 'klv1' + hash.substring(0, 38);
}

const sender = deriveAddress(mnemonic);
const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';

async function broadcast(tx) {
    try {
        const res = await axios.post('https://api.kleverchain.com/v1/transaction/send', tx, {
            timeout: 30000,
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    } catch (e) {
        return { error: e.message, details: e.response?.data };
    }
}

async function main() {
    console.log('Sender:', sender);
    console.log('Contract:', CONTRACT);
    console.log('');
    
    // Initialize wallets
    console.log('1. initialize_wallets...');
    const tx1 = {
        chainId: 1,
        sender: sender,
        contractAddress: CONTRACT,
        functionName: 'initialize_wallets',
        args: [sender, sender],
        gasLimit: 300000,
        type: 'call'
    };
    const res1 = await broadcast(tx1);
    console.log('Result:', JSON.stringify(res1, null, 2));
}

main();
