#!/usr/bin/env node

/**
 * KPEPE Jackpot - Direct WASM Deployment to KleverChain Mainnet
 * 
 * This script deploys the compiled wasm binary directly to mainnet
 * using your existing wallet with KLV balance
 */

const fs = require('fs');
const { Account, TransactionType } = require('@klever/sdk');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  WASM_FILE: './kpepe-jackpot.wasm',
  MNEMONIC: process.env.MAINNET_MNEMONIC || 'your-mnemonic-here',
  API_URL: 'https://api.klever.io',
  PROJECT_WALLET: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
  GAS_LIMIT: 5000000  // Gas for contract deployment
};

// ============================================================================
// MAIN DEPLOYMENT
// ============================================================================

async function deployContract() {
  console.log('🚀 KPEPE Jackpot - Mainnet WASM Deployment\n');

  try {
    // 1. Validate wasm file exists
    if (!fs.existsSync(CONFIG.WASM_FILE)) {
      console.error('❌ WASM file not found:', CONFIG.WASM_FILE);
      process.exit(1);
    }

    const wasmData = fs.readFileSync(CONFIG.WASM_FILE);
    console.log(`✅ WASM file loaded: ${wasmData.length} bytes\n`);

    // 2. Create account from mnemonic
    console.log('Creating account from mnemonic...');
    const account = new Account({
      mnemonic: CONFIG.MNEMONIC
    });
    const address = account.publicAccount.address;
    console.log(`✅ Account: ${address}\n`);

    // 3. Fetch account data
    console.log('Fetching account data from mainnet...');
    const response = await fetch(`${CONFIG.API_URL}/accounts/${address}`);
    if (!response.ok) {
      throw new Error(`Account not found: ${response.status}`);
    }
    const accountData = await response.json();
    console.log(`✅ Account exists on mainnet`);
    console.log(`   Nonce: ${accountData.nonce}`);
    console.log(`   Balance: ${accountData.balance} KLV\n`);

    // 4. Build deployment transaction
    console.log('Building deployment transaction...');
    const payload = wasmData.toString('hex');
    
    const tx = {
      type: TransactionType.CreateContractTx,
      payload,
      gasLimit: CONFIG.GAS_LIMIT,
      version: 1
    };

    console.log('Transaction details:');
    console.log(`  Type: Create Contract (Deploy WASM)`);
    console.log(`  Gas Limit: ${CONFIG.GAS_LIMIT}`);
    console.log(`  Payload Size: ${wasmData.length} bytes\n`);

    // 5. Sign and build transaction
    console.log('Signing and building transaction...');
    const signedTx = account.buildTransaction(tx);
    console.log('✅ Transaction signed\n');

    // 6. Broadcast transaction
    console.log('Broadcasting to KleverChain mainnet...');
    const broadcastResponse = await fetch(`${CONFIG.API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: [signedTx] })
    });
    
    if (!broadcastResponse.ok) {
      const error = await broadcastResponse.text();
      throw new Error(`Broadcast failed: ${error}`);
    }
    
    const result = await broadcastResponse.json();
    
    console.log('\n✅ SUCCESS!\n');
    console.log('Transaction Hash:', result.txHash || result.hash);
    console.log('\nYour contract is being deployed...');
    console.log('Check status at: https://kleverscan.org/transaction/' + (result.txHash || result.hash));
    console.log('\nThe contract address will appear once the transaction is confirmed (1-2 minutes).\n');
    
    return result;

  } catch (error) {
    console.error('❌ Error during deployment:');
    console.error(error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify MAINNET_MNEMONIC is set correctly');
    console.error('2. Ensure your wallet has sufficient KLV for gas fees');
    console.error('3. Check that your wallet is initialized on KleverChain mainnet');
    process.exit(1);
  }
}

// ============================================================================
// RUN
// ============================================================================

if (!process.env.MAINNET_MNEMONIC) {
  console.error('❌ MAINNET_MNEMONIC environment variable not set');
  console.error('\nTo deploy, set your mnemonic:');
  console.error('  export MAINNET_MNEMONIC="your mnemonic phrase here"');
  console.error('\nThen run:');
  console.error('  node deploy-wasm-mainnet.js');
  process.exit(1);
}

deployContract().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
