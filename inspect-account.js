#!/usr/bin/env node

const { Account } = require('@klever/sdk');

// ⚠️ SECURITY: Load private key from environment variable, not hardcoded
const privKey = process.env.PRIVATE_KEY || process.env.TEST_PRIVATE_KEY;
if (!privKey) {
  console.error('❌ ERROR: PRIVATE_KEY not found in .env file');
  process.exit(1);
}
const account = new Account(privKey);

console.log('Account object methods and properties:');
const props = Object.getOwnPropertyNames(Object.getPrototypeOf(account));
props.forEach(prop => {
  const type = typeof account[prop];
  if (type === 'function') {
    console.log(`  ✓ ${prop}() - function`);
  }
});

console.log('\nDirect properties:');
console.log('  account.address:', account.address);
console.log('  account.publicKey:', account.publicKey);
