#!/usr/bin/env node

const { Account } = require('@klever/sdk');

// ⚠️ SECURITY: Load private key from environment variable, not hardcoded
const privKey = process.env.PRIVATE_KEY || process.env.TEST_PRIVATE_KEY;
if (!privKey) {
  console.error('❌ ERROR: PRIVATE_KEY not found in .env file');
  process.exit(1);
}

try {
  const account = new Account({ privateKey: privKey });
  console.log('✅ Account created');
  console.log('Address:', account.getAddress());
  
  // Try sendSmartContractTransaction
  console.log('Has sendSmartContractTransaction:', typeof account.sendSmartContractTransaction);
  console.log('Has sendTransaction:', typeof account.sendTransaction);
  console.log('Has provider:', typeof account.provider);
  
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(account))
    .filter(m => !m.startsWith('_'));
  console.log('Available methods:', methods.slice(0, 15).join(', '));
} catch (e) {
  console.error('❌ Error:', e.message);
}
