#!/usr/bin/env node

/**
 * KPEPE Lottery - Generate Wallet Init Transaction
 * 
 * This creates a transaction that can be signed with kleverWeb
 * It shows both the automated method (if extension is available) 
 * and manual submission instructions
 */

require('dotenv').config();

const CONTRACT_ADDRESS = "klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d";
const PROJECT_WALLET = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";
const OWNER_ADDRESS = "klv1ye2cdac523kpkyejkatnt3qfw68sghg8vrz37tnvjmutv3wjud2s2q0vtw";

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Generate Initialize Wallets Transaction              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Build Klever-formatted transaction
    const transaction = {
        type: 0, // Standard contract call
        payload: {
            receiver: CONTRACT_ADDRESS,
            amount: 0, // No KLV payment needed
            kda: "",
            data: [
                "initialize_wallets",
                PROJECT_WALLET
            ]
        }
    };

    console.log('✅ Transaction Generated:\n');
    console.log(JSON.stringify(transaction, null, 2));
    console.log('');

    console.log('📋 Transaction Details:');
    console.log('   Type: Contract Function Call');
    console.log('   Function: initialize_wallets');
    console.log('   Receiver (Contract): ' + CONTRACT_ADDRESS);
    console.log('   Parameter (Project Wallet): ' + PROJECT_WALLET);
    console.log('   Amount: 0 KLV');
    console.log('   Estimated Gas Fee: ~3 KLV');
    console.log('');

    console.log('🔑 Account to Sign With:');
    console.log('   Owner/Deployer: ' + OWNER_ADDRESS);
    console.log('');

    console.log('═'.repeat(64));
    console.log('');

    console.log('HOW TO SUBMIT:');
    console.log('');
    console.log('METHOD 1: Using Klever Extension (Automatic)');
    console.log('─'.repeat(48));
    console.log('');
    console.log('If the contract was deployed using the Klever Extension,');
    console.log('you can use it again to submit this transaction:');
    console.log('');
    console.log('1. Open console in browser (F12)');
    console.log('2. Paste this code:');
    console.log('');
    console.log(`const tx = ${JSON.stringify(transaction)};`);
    console.log('window.kleverWeb.request({ method: "sendTransaction", params: [tx] })');
    console.log('  .then(result => console.log("Success:", result))');
    console.log('  .catch(err => console.log("Error:", err));');
    console.log('');
    console.log('3. Press Enter');
    console.log('4. Scan QR code with Klever Wallet app to confirm');
    console.log('');

    console.log('METHOD 2: Using KleverScan (Manual Web Interface)');
    console.log('─'.repeat(48));
    console.log('');
    console.log('1. Go to: https://kleverscan.org/address/' + CONTRACT_ADDRESS);
    console.log('2. Click "Write Contract" tab');
    console.log('3. Click "Connect Wallet"');
    console.log('4. Scan with Klever Wallet app to connect');
    console.log('5. Find "initialize_wallets" function');
    console.log('6. Enter: ' + PROJECT_WALLET);
    console.log('7. Click "Write"');
    console.log('8. Approve in Klever Wallet app');
    console.log('');

    console.log('METHOD 3: Using Node.js (If Klever SDK is fixed)');
    console.log('─'.repeat(48));
    console.log('');
    console.log('```javascript');
    console.log('const klever = require("@klever/sdk");');
    console.log('const mnemonic = "...";  // From .env');
    console.log('');
    console.log('const account = await klever.Account.fromMnemonic(mnemonic);');
    console.log('const tx = account.signTransaction({');
    console.log('  receiver: "' + CONTRACT_ADDRESS + '",');
    console.log('  function: "initialize_wallets",');
    console.log('  args: ["' + PROJECT_WALLET + '"]');
    console.log('});');
    console.log('');
    console.log('const response = await fetch("https://api.klever.finance/transaction/send", {');
    console.log('  method: "POST",');
    console.log('  body: JSON.stringify(tx)');
    console.log('});');
    console.log('```');
    console.log('');

    console.log('═'.repeat(64));
    console.log('');
    console.log('💡 Recommendation:');
    console.log('');
    console.log('Since the contract was successfully deployed using Klever Extension,');
    console.log('the fastest and most reliable method is METHOD 1 or METHOD 2.');
    console.log('');
    console.log('Use METHOD 1 if you have the browser console open.');
    console.log('Use METHOD 2 if you prefer a web interface.');
    console.log('');

    console.log('📊 After Initialization:');
    console.log('');
    console.log('   ✅ Revenue split will be ACTIVE');
    console.log('   ✅ Every ticket sale: 85% → Prize Pool');
    console.log('   ✅ Every ticket sale: 15% → Project Wallet');
    console.log('   ✅ Accumulated 30 KLV will transfer automatically');
    console.log('');
}

main();
