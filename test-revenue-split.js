#!/usr/bin/env node

const http = require('http');

const postData = JSON.stringify({
  receiver: 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d',
  amount: 100000000,  // 1 KLV
  data: 'MTAsMTIsMjIsMjUsNDlAMTQ='
});

const req = http.request('http://localhost:3001/sign-transaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('\n✅ Revenue Split Test Result:\n');
    console.log('Project Hash:', result.projectHash);
    console.log('Prize Hash:', result.prizeHash);
    console.log('\nSplit Details:');
    console.log('  Project (15%):', result.split.project / 1e8, 'KLV →', result.split.projectWallet?.substring(0, 30) + '...');
    console.log('  Prize (85%):', result.split.prizePool / 1e8, 'KLV →', result.split.prizePoolWallet?.substring(0, 30) + '...');
    console.log('\nTotal:', (result.split.project + result.split.prizePool) / 1e8, 'KLV');
    console.log('\nStatus:', result.mock ? 'MOCK MODE' : 'REAL TRANSACTIONS');
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(postData);
req.end();
