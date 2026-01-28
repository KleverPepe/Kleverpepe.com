#!/usr/bin/env node

/**
 * Test the lottery purchase flow
 * Simulates what the frontend does
 */

const http = require('http');

const CONTRACT_ADDRESS = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';
const TICKET_PRICE = 1;  // 1 KLV

// Simulate selected numbers: [10, 12, 22, 25, 49, 14]
const selectedMainNumbers = [10, 12, 22, 25, 49];
const selectedEightball = 14;

console.log('🎰 Testing Lottery Ticket Purchase');
console.log('═'.repeat(50));
console.log('Selected numbers:', selectedMainNumbers, 'Lucky 8Ball:', selectedEightball);
console.log('');

// Build the data array like the frontend does
const data = [selectedMainNumbers.toString(), String(selectedEightball)];
console.log('Call data:', data);

// Encode as base64
const dataString = Buffer.from(data.join('@')).toString('base64');
console.log('Encoded (base64):', dataString);
console.log('');

// Build transaction
const tx = {
  type: 0,
  receiver: CONTRACT_ADDRESS,
  amount: TICKET_PRICE * 100000000,
  data: dataString
};

console.log('Transaction to sign:');
console.log(JSON.stringify(tx, null, 2));
console.log('');

// Send to signing server
console.log('Sending to signing server at http://localhost:3001/sign-transaction...');

const postData = JSON.stringify(tx);

const req = http.request('http://localhost:3001/sign-transaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => (body += chunk));
  res.on('end', () => {
    console.log('');
    console.log(`Server Response (${res.statusCode}):`);
    try {
      const result = JSON.parse(body);
      console.log(JSON.stringify(result, null, 2));
      
      if (result.hash) {
        console.log('');
        console.log('✅ SUCCESS!');
        console.log('Main Transaction Hash:', result.hash);
        
        if (result.projectHash && result.prizeHash) {
          console.log('');
          console.log('💰 REVENUE SPLIT:');
          console.log('  Project TX:', result.projectHash);
          console.log('  Prize TX:', result.prizeHash);
          console.log('');
          console.log('  Split Details:');
          console.log(`    Project (15%): ${result.split.project / 1e8} KLV → ${result.split.projectWallet?.substring(0, 30)}...`);
          console.log(`    Prize (85%): ${result.split.prizePool / 1e8} KLV → ${result.split.prizePoolWallet?.substring(0, 30)}...`);
        }
        
        console.log('');
        console.log('🎫 Ticket Details:');
        console.log('   Numbers:', selectedMainNumbers.join(', '));
        console.log('   Lucky 8Ball:', selectedEightball);
        console.log('   Amount Paid:', TICKET_PRICE, 'KLV');
      } else {
        console.error('❌ No hash in response');
      }
    } catch (e) {
      console.log(body);
      console.error('Error parsing response:', e.message);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

req.write(postData);
req.end();
