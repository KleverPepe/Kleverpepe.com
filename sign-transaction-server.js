#!/usr/bin/env node

/**
 * KPEPE Lottery Signing Server - Direct Private Key Version
 * Uses @klever/sdk to sign and broadcast transactions
 */

const http = require('http');
const fs = require('fs');

if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  MNEMONIC: process.env.LOTTERY_SIGNER_MNEMONIC
};

let signingAccount = null;

async function initSigningAccount() {
  if (!CONFIG.MNEMONIC) {
    console.error('❌ LOTTERY_SIGNER_MNEMONIC not set in .env');
    process.exit(1);
  }

  try {
    const { Account, TransactionType } = require('@klever/sdk-node');
    
    console.log('🔐 Initializing account from mnemonic...');
    
    // Create account from mnemonic using @klever/sdk-node
    signingAccount = new Account(CONFIG.MNEMONIC);
    
    // Initialize and sync with network
    await signingAccount.init();
    await signingAccount.sync();
    
    // Get address for confirmation
    const address = signingAccount.getAddress();
    console.log('✅ Signing account ready');
    console.log('   Address:', address);
    
  } catch (err) {
    console.error('❌ Failed to initialize account:', err.message);
    process.exit(1);
  }
}

function handleHealth(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    address: signingAccount ? '(ready)' : 'not-initialized'
  }));
}

async function handleSignTransaction(req, res, body) {
  try {
    const { TransactionType } = require('@klever/sdk-node');
    const data = JSON.parse(body);

    if (!data.receiver || data.amount === undefined) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing receiver or amount' }));
    }

    console.log('\n📝 Processing transaction:');
    console.log('   To:', data.receiver);
    console.log('   Amount:', data.amount);
    if (data.data) console.log('   Data:', data.data.substring(0, 60) + (data.data.length > 60 ? '...' : ''));

    console.log('   Building transaction...');

    // Build transaction
    let tx;
    if (data.data) {
      // Smart contract call - use SmartContract type
      tx = await signingAccount.buildTransaction({
        type: TransactionType.SmartContract,
        payload: {
          scType: 'InvokeContract',
          contractAddress: data.receiver,
          callValue: data.amount || 0,
          callData: data.data  // Raw data string with @ separators
        }
      });
    } else {
      // Regular transfer
      tx = await signingAccount.buildTransaction({
        receiver: data.receiver,
        amount: String(data.amount)
      });
    }

    console.log('   Signing transaction...');
    const signedTx = await signingAccount.signTransaction(tx);
    
    console.log('   Broadcasting...');
    const result = await signingAccount.broadcastTransaction(signedTx);
    
    const hash = result?.hash || result?.txHash || result;

    if (hash) {
      console.log('✅ Transaction sent!');
      console.log('   Hash:', hash.substring(0, 16) + '...');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ hash: hash, status: 'success' }));
    }

    console.error('❌ No hash in response:', result);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Broadcast failed', fullResponse: result }));
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: err.message }));
  }
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
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => handleSignTransaction(req, res, body));
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    return handleHealth(req, res);
  }

  res.writeHead(404);
  res.end('Not found');
});

(async () => {
  // Suppress unhandled promise rejections from SDK network initialization
  process.on('unhandledRejection', (reason) => {
    // Silently ignore DNS errors from SDK network setup
    if (reason?.message?.includes('getaddrinfo ENOTFOUND') || reason?.code === 'ENOTFOUND') {
      return;
    }
    if (reason?.message?.includes('fetch failed')) {
      return;
    }
    console.error('Unhandled rejection:', reason);
  });
  
  console.log('🎰 KPEPE Lottery Signing Server');
  console.log('═'.repeat(50));
  
  try {
    await initSigningAccount();
  } catch (err) {
    console.error('⚠️  Account init error:', err.message);
  }

  server.listen(CONFIG.PORT, () => {
    console.log(`✅ Listening on http://localhost:${CONFIG.PORT}`);
    console.log('   POST /sign-transaction');
    console.log('   GET  /health');
    console.log('═'.repeat(50));
  });
})();
