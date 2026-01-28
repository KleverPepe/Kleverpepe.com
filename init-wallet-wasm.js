#!/usr/bin/env node

/**
 * KPEPE Wallet Initialization - Direct WASM Transaction Builder
 * 
 * This creates the exact transaction format needed to call
 * initializeWallets on the WASM contract, bypassing KleverScan's
 * ABI loading issues.
 */

const CONTRACT = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const PROJECT_WALLET = 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const PRIZE_POOL_WALLET = 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2';

// For WASM contracts, we use type 0 with data field containing the method name and args
const transaction = {
  type: 0,
  payload: {
    receiver: CONTRACT,
    amount: 0,
    kda: "",
    data: ["initializeWallets", PROJECT_WALLET, PRIZE_POOL_WALLET]
  }
};

console.log('\n=== KPEPE Wallet Initialization Transaction ===\n');
console.log('Type: 0 (Call Contract)\n');
console.log('Payload:');
console.log(JSON.stringify(transaction.payload, null, 2));

console.log('\n\n=== How to Submit (3 Options) ===\n');

console.log('OPTION 1: Using Klever Extension (if installed in browser)');
console.log('-----------------------------------------------------------');
console.log(`
const tx = ${JSON.stringify(transaction)};
window.kleverWeb.request({
  method: 'sendTransaction',
  params: [tx]
});
`);

console.log('\nOPTION 2: Manually via KleverScan');
console.log('-----------------------------------');
console.log(`
1. Go to: https://kleverscan.org/address/${CONTRACT}
2. Click "Write Contract"
3. Look for "initializeWallets" or "initialize_wallets" function
4. Fill in parameters:
   - pw (project wallet): ${PROJECT_WALLET}
   - ppw (prize pool wallet): ${PRIZE_POOL_WALLET}
5. Click "Write" and sign with your Klever Wallet mobile app
`);

console.log('\nOPTION 3: Using Klever CLI (if installed)');
console.log('-------------------------------------------');
console.log(`
klever transaction send-contract \\
  --contract ${CONTRACT} \\
  --method initializeWallets \\
  --arguments ${PROJECT_WALLET} ${PRIZE_POOL_WALLET}
`);

console.log('\nOPTION 4: Raw JSON Transaction (for advanced users)');
console.log('-----------------------------------------------------');
console.log(JSON.stringify(transaction, null, 2));

console.log('\n\n=== What This Does ===');
console.log('- Calls: initializeWallets(projectWallet, prizePoolWallet)');
console.log('- Sets 15% revenue split to: ' + PROJECT_WALLET);
console.log('- Sets 85% prize pool to: ' + PRIZE_POOL_WALLET);
console.log('- Fee: ~3 KLV');
console.log('- Status: Permanent, one-time only\n');

console.log('=== If KleverScan Shows "Function Not Found" ===');
console.log('- This is a WASM contract (Rust-based)');
console.log('- KleverScan may not have loaded the ABI yet');
console.log('- Wait 5 minutes and try again');
console.log('- Or use Klever CLI option above');
console.log('- Or contact KleverScan support\n');
