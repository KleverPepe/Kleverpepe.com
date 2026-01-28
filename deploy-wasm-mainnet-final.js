#!/usr/bin/env node

/**
 * KPEPE Jackpot - Deploy to KleverChain Mainnet via REST API
 * 
 * This uses the Klever Web module which is more stable
 */

const fs = require('fs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  WASM_FILE: './kpepe-jackpot.wasm',
  MNEMONIC: process.env.MAINNET_MNEMONIC || '',
  API_URL: 'https://api.klever.io',
  GAS_LIMIT: 5000000
};

// ============================================================================
// DEPLOYMENT
// ============================================================================

async function deployContract() {
  console.log('🚀 KPEPE Jackpot - Mainnet WASM Deployment\n');

  try {
    if (!CONFIG.MNEMONIC) {
      throw new Error('MAINNET_MNEMONIC not set');
    }

    // Load wasm file
    if (!fs.existsSync(CONFIG.WASM_FILE)) {
      throw new Error(`WASM file not found: ${CONFIG.WASM_FILE}`);
    }

    const wasmData = fs.readFileSync(CONFIG.WASM_FILE);
    console.log(`✅ WASM file loaded: ${wasmData.length} bytes\n`);

    // Dynamic import for Klever web
    const KleverWeb = require('@klever/sdk/web');
    console.log('✅ SDK loaded\n');

    // Initialize wallet
    console.log('Initializing wallet from mnemonic...');
    const wallet = await KleverWeb.createAccountFromMnemonic(CONFIG.MNEMONIC);
    const address = wallet.getAddress();
    console.log(`✅ Wallet: ${address}\n`);

    // Get account info
    console.log('Fetching account data...');
    const accountRes = await fetch(`${CONFIG.API_URL}/accounts/${address}`);
    if (!accountRes.ok) {
      throw new Error(`Account fetch failed: ${accountRes.status}`);
    }
    const accountData = await accountRes.json();
    console.log(`✅ Account found`);
    console.log(`   Balance: ${accountData.balance} KLV`);
    console.log(`   Nonce: ${accountData.nonce}\n`);

    // Build transaction
    console.log('Building deployment transaction...');
    const tx = {
      type: 'CreateContractTx',
      sender: address,
      nonce: accountData.nonce,
      payload: wasmData.toString('hex'),
      gasLimit: CONFIG.GAS_LIMIT,
      gasPrice: 1,
      version: 1
    };

    // Sign transaction
    console.log('Signing transaction...');
    const signedTx = await wallet.signTransaction(tx);
    console.log('✅ Signed\n');

    // Broadcast
    console.log('Broadcasting to mainnet...');
    const broadRes = await fetch(`${CONFIG.API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: [signedTx] })
    });

    if (!broadRes.ok) {
      const error = await broadRes.text();
      throw new Error(`Broadcast failed: ${error}`);
    }

    const result = await broadRes.json();
    const txHash = result.txHash || result.hash || result.transactionHash;

    console.log('\n✅ SUCCESS!\n');
    console.log('Transaction Hash:', txHash);
    console.log('View at: https://kleverscan.org/transaction/' + txHash);
    console.log('\n⏳ Contract deploying (1-2 minutes)...');
    console.log('Contract address will appear on KleverScan.\n');

  } catch (error) {
    console.error('\n❌ Deployment Error:');
    console.error(error.message);
    process.exit(1);
  }
}

if (!process.env.MAINNET_MNEMONIC) {
  console.error('❌ MAINNET_MNEMONIC not set\n');
  console.error('Usage:');
  console.error('  export MAINNET_MNEMONIC="your 12 or 24 word phrase"');
  console.error('  node deploy-wasm-mainnet-final.js\n');
  process.exit(1);
}

deployContract().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
