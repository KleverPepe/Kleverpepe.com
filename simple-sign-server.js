#!/usr/bin/env node

/**
 * KPEPE Simple Signing Server
 * 
 * Acts as a transaction relay for the lottery frontend.
 */

const http = require('http');
const fs = require('fs');

if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const PORT = parseInt(process.env.PORT || '3001');
const RPC = 'https://node.mainnet.klever.org';
const SIGNER_ADDRESS = 'klv1ye2cdac523kpkyejkatnt3qfw68sghg8vrz37tnvjmutv3wjud2s2q0vtw';

async function handleSignTransaction(req, res, body) {
  try {
    const data = JSON.parse(body);
    
    if (!data.receiver || data.amount === undefined) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing receiver or amount' }));
    }

    console.log('📝 Transaction:');
    console.log('   From:', SIGNER_ADDRESS);
    console.log('   To:', data.receiver);
    console.log('   Amount:', data.amount);
    if (data.data?.length) console.log('   Data elements:', data.data.length);
    
    // Build transaction
    const tx = {
      type: 0,
      sender: SIGNER_ADDRESS,
      receiver: data.receiver,
      amount: data.amount,
      data: data.data || null
    };

    console.log('🚀 Sending to network...');
    const response = await fetch(`${RPC}/transaction/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
      timeout: 15000
    });

    const result = await response.json();
    
    if (result.hash) {
      console.log('✅ Tx Hash:', result.hash.substring(0, 16) + '...');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ hash: result.hash, status: 'success' }));
    } else {
      console.error('❌ API error:', result);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: result.error || 'Broadcast failed', fullResponse: result }));
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

function handleHealth(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', address: SIGNER_ADDRESS }));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/sign-transaction') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => handleSignTransaction(req, res, body));
  } else if (req.method === 'GET' && req.url === '/health') {
    handleHealth(req, res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🎰 KPEPE Signing Server Running`);
  console.log(`\n✅ Listening on http://localhost:${PORT}`);
  console.log('   POST /sign-transaction - Sign & broadcast');
  console.log('   GET  /health          - Health check');
  console.log(`\n📍 Signer Address: ${SIGNER_ADDRESS}\n`);
});
