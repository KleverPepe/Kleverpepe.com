#!/usr/bin/env node

/**
 * Contract Deployment Information & Helper
 * 
 * This script provides information about deploying contracts to KleverChain
 * and prepares the contract file for deployment.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONTRACT_FILE = './contracts/KPEPEJackpot.js';
const OUTPUT_DIR = './deployment-package';

// ============================================================================
// HELPERS
// ============================================================================

function printBanner() {
  console.log('\n' + '═'.repeat(70));
  console.log('📦 KLEVERCHAIN CONTRACT DEPLOYMENT INFO');
  console.log('═'.repeat(70) + '\n');
}

function printSection(title) {
  console.log('\n' + title);
  console.log('─'.repeat(70));
}

// ============================================================================
// DEPLOYMENT METHODS
// ============================================================================

function printDeploymentMethods() {
  printSection('🚀 DEPLOYMENT METHODS');
  
  console.log('\n❌ NOT AVAILABLE: Programmatic Deployment via SDK');
  console.log('   The @klever/sdk-node does NOT provide:');
  console.log('   • deployContract() method');
  console.log('   • CreateContract transaction type');
  console.log('   • Direct WASM/JavaScript deployment');
  
  console.log('\n✅ AVAILABLE: Manual Deployment Options');
  console.log('\n   Option 1: KleverScan UI (Recommended)');
  console.log('   ─────────────────────────────────────');
  console.log('   URL: https://kleverscan.org/contracts');
  console.log('   Steps:');
  console.log('     1. Click "Deploy Contract"');
  console.log('     2. Select "JavaScript/WASM"');
  console.log('     3. Upload contract file');
  console.log('     4. Set gas limit: 3,000,000');
  console.log('     5. Sign with wallet');
  console.log('     6. Get contract address from transaction');
  
  console.log('\n   Option 2: Klever Wallet Extension');
  console.log('   ──────────────────────────────────');
  console.log('   Steps:');
  console.log('     1. Install Klever Extension');
  console.log('     2. Import wallet');
  console.log('     3. Go to "Contracts" → "Deploy"');
  console.log('     4. Upload and deploy');
  
  console.log('\n   Option 3: Klever CLI (If available)');
  console.log('   ───────────────────────────────────');
  console.log('   Commands:');
  console.log('     npm install -g @klever/cli');
  console.log('     klever deploy ./contracts/KPEPEJackpot.js');
}

// ============================================================================
// SDK CAPABILITIES
// ============================================================================

function printSDKCapabilities() {
  printSection('🔧 WHAT THE SDK CAN DO');
  
  console.log('\n✅ After Deployment - Contract Interaction:');
  console.log('\n   Transaction Type 63: SmartContract');
  console.log('   Purpose: Call functions on deployed contracts');
  console.log('\n   Example:');
  console.log('   ```javascript');
  console.log('   const { Account, TransactionType } = require("@klever/sdk-node");');
  console.log('');
  console.log('   const account = new Account(mnemonic);');
  console.log('   await account.ready;');
  console.log('');
  console.log('   const tx = await account.buildTransaction([{');
  console.log('     type: TransactionType.SmartContract,  // Type 63');
  console.log('     payload: {');
  console.log('       scType: "InvokeContract",');
  console.log('       contractAddress: "klv1qqq...",  // Deployed address');
  console.log('       callValue: 0,');
  console.log('       callData: [');
  console.log('         "functionName",');
  console.log('         "arg1",');
  console.log('         "arg2"');
  console.log('       ]');
  console.log('     }');
  console.log('   }]);');
  console.log('');
  console.log('   const signedTx = await account.signTransaction(tx);');
  console.log('   const result = await account.broadcastTransactions([signedTx]);');
  console.log('   ```');
}

// ============================================================================
// CONTRACT INFO
// ============================================================================

function analyzeContractFile() {
  printSection('📄 CONTRACT FILE ANALYSIS');
  
  if (!fs.existsSync(CONTRACT_FILE)) {
    console.log('\n❌ Contract file not found:', CONTRACT_FILE);
    console.log('   Please ensure the contract is compiled and placed in the contracts/ directory.');
    return;
  }
  
  const stats = fs.statSync(CONTRACT_FILE);
  const content = fs.readFileSync(CONTRACT_FILE, 'utf8');
  
  console.log('\n   File:', CONTRACT_FILE);
  console.log('   Size:', (stats.size / 1024).toFixed(2), 'KB');
  console.log('   Lines:', content.split('\n').length);
  console.log('   Format: JavaScript/WASM');
  
  // Check for key patterns
  console.log('\n   Contract Functions Detected:');
  const functions = [
    'initializeWallets',
    'setKPEPEToken',
    'toggleRound',
    'buyTicket',
    'drawWinningNumbers',
    'claimPrize'
  ];
  
  functions.forEach(fn => {
    if (content.includes(fn)) {
      console.log(`     ✓ ${fn}`);
    } else {
      console.log(`     ? ${fn} (not found in source)`);
    }
  });
}

// ============================================================================
// PREPARE DEPLOYMENT PACKAGE
// ============================================================================

function prepareDeploymentPackage() {
  printSection('📦 PREPARING DEPLOYMENT PACKAGE');
  
  if (!fs.existsSync(CONTRACT_FILE)) {
    console.log('\n❌ Cannot prepare package - contract file not found');
    return;
  }
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Copy contract file
  const contractDest = path.join(OUTPUT_DIR, 'KPEPEJackpot.js');
  fs.copyFileSync(CONTRACT_FILE, contractDest);
  
  // Create deployment info file
  const deploymentInfo = {
    contract: 'KPEPEJackpot',
    version: '1.0.0',
    network: 'KleverChain Mainnet',
    deploymentMethod: 'KleverScan UI',
    gasLimit: 3000000,
    timestamp: new Date().toISOString(),
    files: {
      contract: 'KPEPEJackpot.js'
    },
    postDeployment: {
      step1: 'initializeWallets(projectWallet, prizePoolWallet)',
      step2: 'setKPEPEToken(tokenAddress)',
      step3: 'toggleRound()',
    },
    configuration: {
      projectWallet: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
      prizePoolWallet: 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2',
      kpepeToken: 'kpepe-1eod'
    }
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Create README
  const readme = `# KPEPE Jackpot Deployment Package

## Contract File
- **File:** KPEPEJackpot.js
- **Size:** ${(fs.statSync(CONTRACT_FILE).size / 1024).toFixed(2)} KB
- **Type:** JavaScript/WASM

## Deployment Instructions

### 1. Deploy Contract via KleverScan

1. Go to: https://kleverscan.org/contracts
2. Click "Deploy Contract"
3. Select "JavaScript/WASM"
4. Upload: \`KPEPEJackpot.js\` from this package
5. Gas Limit: **3,000,000**
6. Connect your wallet and sign
7. Wait for confirmation (2-3 minutes)
8. **COPY THE CONTRACT ADDRESS** (starts with klv1qqq...)

### 2. Update Environment

Add to your \`.env\` file:
\`\`\`
CONTRACT_ADDRESS=klv1qqq...[your-deployed-address]
\`\`\`

### 3. Initialize Contract

Run the initialization script:
\`\`\`bash
node deploy-contract-programmatic.js
\`\`\`

This will:
- Initialize project and prize pool wallets
- Set KPEPE token address
- Enable the lottery

### 4. Verify Deployment

Check your contract on KleverScan:
\`\`\`
https://kleverscan.org/contracts/[YOUR_CONTRACT_ADDRESS]
\`\`\`

## Configuration

- **Project Wallet:** ${deploymentInfo.configuration.projectWallet}
- **Prize Pool Wallet:** ${deploymentInfo.configuration.prizePoolWallet}
- **KPEPE Token:** ${deploymentInfo.configuration.kpepeToken}

## Support

For issues or questions:
- KleverChain Documentation: https://docs.klever.org
- KleverScan: https://kleverscan.org
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme);
  
  console.log('\n✅ Deployment package prepared!');
  console.log('\n   Output directory:', OUTPUT_DIR);
  console.log('\n   Files created:');
  console.log('     • KPEPEJackpot.js - Contract file');
  console.log('     • deployment-info.json - Configuration');
  console.log('     • README.md - Instructions');
  console.log('\n   Next step: Follow README.md in the deployment-package/ folder');
}

// ============================================================================
// DEPLOYMENT WORKFLOW
// ============================================================================

function printWorkflow() {
  printSection('📋 COMPLETE DEPLOYMENT WORKFLOW');
  
  console.log('\n   Step 1: Prepare');
  console.log('   ─────────────');
  console.log('   • Compile contract (already done)');
  console.log('   • Review contract code');
  console.log('   • Prepare deployment package (run this script)');
  
  console.log('\n   Step 2: Deploy (Manual - KleverScan UI)');
  console.log('   ─────────────────────────────────────');
  console.log('   • Upload contract to KleverScan');
  console.log('   • Set gas limit: 3,000,000');
  console.log('   • Sign with wallet');
  console.log('   • Get contract address');
  console.log('   • Time: ~5 minutes');
  
  console.log('\n   Step 3: Configure (Automated - SDK)');
  console.log('   ───────────────────────────────────');
  console.log('   • Update .env with CONTRACT_ADDRESS');
  console.log('   • Run: node deploy-contract-programmatic.js');
  console.log('   • Initializes wallets, token, enables lottery');
  console.log('   • Time: ~2 minutes');
  
  console.log('\n   Step 4: Verify');
  console.log('   ─────────────');
  console.log('   • Check contract on KleverScan');
  console.log('   • Test ticket purchase');
  console.log('   • Verify revenue split');
  
  console.log('\n   Total Time: ~10-15 minutes');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  printBanner();
  
  printDeploymentMethods();
  printSDKCapabilities();
  analyzeContractFile();
  printWorkflow();
  
  console.log('\n' + '═'.repeat(70));
  console.log('');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--prepare') || args.includes('-p')) {
    prepareDeploymentPackage();
  } else {
    console.log('💡 Tip: Run with --prepare to create deployment package');
    console.log('   Example: node contract-deployment-info.js --prepare');
  }
  
  console.log('');
}

// ============================================================================
// ENTRY POINT
// ============================================================================

if (require.main === module) {
  main();
}

module.exports = {
  analyzeContractFile,
  prepareDeploymentPackage
};
