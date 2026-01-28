#!/usr/bin/env node

const { Account } = require('@klever/sdk');

// ⚠️ SECURITY: Load private key from environment variable, not hardcoded
const testKey = process.env.TEST_PRIVATE_KEY;
if (!testKey) {
  console.error('❌ ERROR: TEST_PRIVATE_KEY not found in .env file');
  console.error('Please add TEST_PRIVATE_KEY to your .env file for testing');
  process.exit(1);
}

// Test different private key formats
const privKey1 = testKey;
const privKey2 = { privateKey: testKey };

console.log('Test 1: String private key');
try {
  const account1 = new Account(privKey1);
  console.log('✅ Success with string');
  console.log('Address:', account1.address);
} catch (e) {
  console.error('❌ Error:', e.message);
}

console.log('\nTest 2: { privateKey: string } object');
try {
  const account2 = new Account(privKey2);
  console.log('✅ Success with object');
  console.log('Address:', account2.address);
} catch (e) {
  console.error('❌ Error:', e.message);
}

console.log('\nTest 3: { privateKey: Buffer }');
try {
  const buf = Buffer.from(testKey, 'hex');
  console.error('❌ Error:', e.message);
}
