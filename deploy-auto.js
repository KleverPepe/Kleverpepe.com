#!/usr/bin/env node

/**
 * KPEPE Lottery - One-Click Deployment Script
 * Deploys the contract with automatic initialization
 */

require('dotenv').config();
const fs = require('fs');

const PROJECT_WALLET = process.env.PROJECT_WALLET || 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9';
const CONTRACT_FILE = './kpepe-jackpot.wasm';

console.log('\n🚀 KPEPE Lottery - Auto-Deploy Script\n');
console.log('═'.repeat(70));

// Check if contract file exists
if (!fs.existsSync(CONTRACT_FILE)) {
  console.error('\n❌ Error: Contract file not found!');
  console.error(`   Looking for: ${CONTRACT_FILE}`);
  console.error('\n   Please run: cd rust-contract && cargo build --release\n');
  process.exit(1);
}

const stats = fs.statSync(CONTRACT_FILE);
console.log(`\n✅ Contract file found: ${CONTRACT_FILE}`);
console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`\n📋 Deployment Configuration:`);
console.log(`   Project Wallet: ${PROJECT_WALLET}`);
console.log(`   Network: Mainnet`);
console.log(`   Auto-Initialize: YES ✨`);

console.log('\n' + '═'.repeat(70));
console.log('\n📝 DEPLOYMENT INSTRUCTIONS:\n');

console.log('Since KleverChain requires browser-based signing, please:');
console.log('\n1. Go to: https://kleverscan.org/contracts');
console.log('2. Click "Connect Wallet" and approve');
console.log('3. Click "Deploy Contract"');
console.log('4. Upload: kpepe-jackpot.wasm (from this directory)');
console.log('\n5. IMPORTANT - Set Init Parameters:');
console.log(`   ┌────────────────────────────────────────────────────────────────┐`);
console.log(`   │ project_wallet: ${PROJECT_WALLET} │`);
console.log(`   └────────────────────────────────────────────────────────────────┘`);
console.log('\n6. Set Gas Limit: 5,000,000');
console.log('7. Click "Deploy & Initialize"');
console.log('8. Sign the transaction in Klever Extension');
console.log('9. Wait ~10 seconds for confirmation');
console.log('10. Copy the contract address (format: klv1qqq...)');

console.log('\n' + '═'.repeat(70));
console.log('\n📌 AFTER DEPLOYMENT:\n');

console.log('Add the contract address to your .env file:');
console.log('   CONTRACT_ADDRESS=klv1qqq...');
console.log('\nThen restart your server:');
console.log('   pkill -f "node sign-transaction-server"');
console.log('   node sign-transaction-server.js &');
console.log('\nYour lottery will be IMMEDIATELY READY! 🎰');

console.log('\n' + '═'.repeat(70));
console.log('\n✨ The contract will automatically:');
console.log('   ✓ Set project wallet');
console.log('   ✓ Initialize prize pool to 0');
console.log('   ✓ Activate the lottery round');
console.log('   ✓ Set draw interval to 24 hours');
console.log('   ✓ Be ready to accept tickets!');

console.log('\n💡 TIP: You can verify initialization by checking:');
console.log('   https://kleverscan.org/account/YOUR_CONTRACT_ADDRESS\n');

console.log('═'.repeat(70) + '\n');
