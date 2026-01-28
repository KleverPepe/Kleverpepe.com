#!/usr/bin/env node

require('dotenv').config();
const { Account } = require('@klever/sdk-node');

const mnemonic = process.env.LOTTERY_SIGNER_MNEMONIC;
console.log('Mnemonic exists:', !!mnemonic);

console.log('\n--- Creating Account ---');
const account = new Account(mnemonic);
console.log('Account created successfully');

console.log('\n--- Type of account.ready ---');
console.log('Type of account.ready:', typeof account.ready);

console.log('\n--- Account prototype methods ---');
const proto = Object.getPrototypeOf(account);
const methods = Object.getOwnPropertyNames(proto);
console.log('First 20 methods:', methods.slice(0, 20));

console.log('\n--- Checking for ready ---');
if (typeof account.ready === 'function') {
  console.log('account.ready is a function');
} else if (account.ready instanceof Promise) {
  console.log('account.ready is a Promise');
} else {
  console.log('account.ready is:', account.ready);
}

console.log('\n--- Checking address property ---');
console.log('address:', account.address);

console.log('\n--- Awaiting ready Promise ---');
account.ready.then(() => {
  console.log('✅ Ready promise resolved');
  console.log('address after ready:', account.address);
  console.log('Done');
  process.exit(0);
}).catch(err => {
  console.error('Ready promise rejected:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});
