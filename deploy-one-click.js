#!/usr/bin/env node

/**
 * KPEPE Lottery - Zero-Config One-Click Deployment
 * Everything is pre-configured and automated!
 */

console.log('\n🚀 KPEPE Lottery - Zero-Config Deployment\n');
console.log('═'.repeat(70));

const CONTRACT_FILE = './kpepe-jackpot.wasm';
const fs = require('fs');

if (!fs.existsSync(CONTRACT_FILE)) {
  console.error('\n❌ Contract file not found: ' + CONTRACT_FILE);
  process.exit(1);
}

const stats = fs.statSync(CONTRACT_FILE);
console.log(`\n✅ Contract ready: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`   Wallets: PRE-CONFIGURED ✨`);
console.log(`   Auto-Init: YES`);
console.log(`   Auto-Payouts: YES 💰`);

console.log('\n' + '═'.repeat(70));
console.log('\n🎯 JUST DEPLOY - EVERYTHING ELSE IS AUTOMATIC!\n');

console.log('1️⃣  Go to https://kleverscan.org/contracts');
console.log('2️⃣  Click "Connect Wallet"');
console.log('3️⃣  Click "Deploy Contract"');
console.log('4️⃣  Upload: kpepe-jackpot.wasm');
console.log('5️⃣  NO init parameters needed! ✨');
console.log('6️⃣  Set Gas: 5,000,000');
console.log('7️⃣  Click "Deploy"');
console.log('8️⃣  Sign in Klever Extension');
console.log('9️⃣  Wait ~10 seconds');
console.log('🔟 Copy contract address');

console.log('\n' + '═'.repeat(70));
console.log('\n✨ EVERYTHING AUTOMATIC:\n');
console.log('✓ Wallet addresses hardcoded');
console.log('✓ Prize pool initialized');
console.log('✓ Lottery round activated');
console.log('✓ Revenue split active (15% to you on each ticket)');
console.log('✓ Auto-payouts enabled (winners paid automatically)');
console.log('✓ No manual setup required');

console.log('\n' + '═'.repeat(70));
console.log('\n⚡ AUTO-PAYOUT FLOW:\n');
console.log('1. Draw completes');
console.log('2. Call autoDistributePrizes() endpoint');
console.log('3. Contract pays all winners automatically ✅');
console.log('4. Users never need to claim manually');

console.log('\n' + '═'.repeat(70));
console.log('\n📝 AFTER DEPLOYMENT:\n');
console.log('Add to .env:');
console.log('  CONTRACT_ADDRESS=klv1qqq...');
console.log('\nRestart server:');
console.log('  node sign-transaction-server.js &\n');

console.log('After each draw, call:');
console.log('  autoDistributePrizes(batchSize)');
console.log('  Example: autoDistributePrizes(100)');
console.log('  (100 = process 100 tickets per call)\n');

console.log('💡 That\'s it! Your lottery is LIVE with auto-payouts! 🎰\n');
console.log('═'.repeat(70) + '\n');
