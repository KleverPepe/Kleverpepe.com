#!/usr/bin/env node

require('dotenv').config();
const { Account } = require('@klever/sdk-node');

const mnemonic = process.env.LOTTERY_SIGNER_MNEMONIC;

console.log('Testing Account initialization...');

if (!mnemonic) {
  console.error('❌ LOTTERY_SIGNER_MNEMONIC not set');
  process.exit(1);
}

try {
  const account = new Account(mnemonic);
  console.log('✅ Account object created');
  
  // Check available methods
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(account))
    .filter(m => !m.startsWith('_'));
  console.log('Available methods:', methods.slice(0, 10).join(', '));
  
  // Try to get address
  console.log('Attempting getAddress...');
  account.getAddress()
    .then(addr => {
      console.log('✅ getAddress succeeded:', addr);
      process.exit(0);
    })
    .catch(e => {
      console.error('❌ getAddress failed:', e.message);
      process.exit(1);
    });
    
} catch (e) {
  console.error('❌ Account creation threw error:', e.message);
  console.error('Full error:', e);
  process.exit(1);
}

// Timeout after 5 seconds
setTimeout(() => {
  console.error('⏱️  Timeout waiting for getAddress');
  process.exit(1);
}, 5000);
