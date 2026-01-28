#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

console.log('\n🚀 AUTONOMOUS CONTRACT DEPLOYMENT TO KLEVERCHAIN\n');

// Read contract  
const contractCode = fs.readFileSync('deployment-package/KPEPEJackpot.js', 'utf-8');
console.log('✅ Contract loaded:', (contractCode.length/1024).toFixed(2), 'KB\n');

// Use SDK approach - build unsigned transaction first
const buildPayload = JSON.stringify({
  type: 1,
  sender: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
  contract: [{
    type: 27,
    parameter: {
      code: Buffer.from(contractCode).toString('hex'),
      vmType: 'WasmVM',
      codeMetadata: ''
    }
  }]
});

console.log('📊 Building unsigned transaction...\n');

const buildOptions = {
  hostname: 'node.mainnet.klever.org',
  port: 443,
  path: '/transaction/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(buildOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', data.substring(0, 500));
    
    try {
      const response = JSON.parse(data);
      
      if (response.data || response.result) {
        console.log('\n✅ TRANSACTION BUILT SUCCESSFULLY!\n');
        fs.writeFileSync('deployment-tx-unsigned.json', JSON.stringify(response, null, 2));
        console.log('Unsigned transaction saved to: deployment-tx-unsigned.json');
        
        if (response.data && response.data.hash) {
          console.log('\n📊 Transaction Hash:', response.data.hash);
          console.log('🔗 View at: https://kleverscan.org/transaction/' + response.data.hash);
        }
      } else {
        console.log('\n⚠️ Unexpected response format');
        console.log('Full response:', JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.log('\n⚠️ Could not parse JSON response');
      console.log('Raw response:', data);
      console.log('\nNote: KleverChain smart contracts may require Klever SDK signing');
      console.log('Alternative: Use @klever/sdk package or KleverScan interface');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.log('\n📋 DEPLOYMENT STATUS:');
  console.log('Contract packaged and ready at: deployment-package/KPEPEJackpot.js');
  console.log('Manual upload option: https://kleverscan.org');
});

req.write(buildPayload);
req.end();
