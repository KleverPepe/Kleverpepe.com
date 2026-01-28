const fs = require('fs');
const { Provider, TransactionBuilder, Account } = require('@klever/sdk-node');

async function deployContract() {
  try {
    // Configuration
    const mnemonic = 'crack spider unhappy junior escape blossom brisk swear arrive side pistol sugar vocal concert code teach scissors lawn table switch awful kiwi verb diagram';
    const rpcUrl = 'https://node.mainnet.klever.org:6001';
    
    // Read WASM file
    const wasmPath = '/Users/chotajarvis/clawd/klevertepepe-redesign/kpepe-jackpot.wasm';
    const wasmBuffer = fs.readFileSync(wasmPath);
    console.log(`✅ Loaded WASM: ${wasmPath} (${wasmBuffer.length} bytes)`);
    
    // Create account from mnemonic
    const account = new Account({ mnemonic });
    console.log(`✅ Account Address: ${account.address}`);
    
    // Create provider
    const provider = new Provider(rpcUrl);
    
    // Get account info for nonce
    const accountInfo = await provider.getAccount(account.address);
    const nonce = accountInfo.nonce || 0;
    console.log(`✅ Current Nonce: ${nonce}`);
    
    // Build transaction
    const tx = new TransactionBuilder()
      .sender(account.address)
      .receiver(account.address) // Contract deploy to self
      .type('DeploySmartContract')
      .data(wasmBuffer)
      .nonce(nonce)
      .gasLimit(10000000)
      .build();
    
    console.log(`✅ Transaction built`);
    
    // Sign transaction
    account.sign(tx);
    console.log(`✅ Transaction signed`);
    
    // Send transaction
    console.log(`📤 Sending transaction...`);
    const result = await provider.sendTransaction(tx);
    
    console.log(`\n✅ DEPLOYMENT SUCCESSFUL!`);
    console.log(`Transaction Hash: ${result.txHash}`);
    console.log(`Contract Address: ${result.contractAddress || 'Pending...'}`);
    console.log(`\nCheck: https://kleverscan.org/tx/${result.txHash}`);
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    console.error(error);
  }
}

deployContract();
