#!/usr/bin/env node
const https = require('https');

const contractAddr = 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d';

// Try multiple Klever endpoints to verify contract exists
const endpoints = [
  { host: 'node.mainnet.klever.org', path: `/contracts/${contractAddr}`, name: 'Klever Official' },
];

async function checkContract() {
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Checking ${endpoint.name}...`);
      const response = await fetch(`https://${endpoint.host}${endpoint.path}`);
      const data = await response.json();
      
      if (response.ok && data) {
        console.log(`✅ Contract found!`);
        console.log(JSON.stringify(data, null, 2));
        return data;
      }
    } catch (err) {
      console.log(`❌ ${endpoint.name}: ${err.message}`);
    }
  }
  
  console.log('\n⚠️ Could not verify contract via RPC');
  return null;
}

async function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode === 200,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    }).on('error', reject);
  });
}

checkContract();
