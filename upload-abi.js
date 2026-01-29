// Upload ABI to Kleverscan Contract
// Usage: node upload-abi.js <contract-address>

const fs = require('fs');
const path = require('path');
const { KleverWeb } = require('@klever/sdk');
require('dotenv').config();

const RPC_URL = 'https://klever-mainnet.rpc.thirdweb.com';
const CONTRACT_ADDRESS = process.argv[2];

async function main() {
  if (!CONTRACT_ADDRESS) {
    console.log('Usage: node upload-abi.js <contract-address>');
    console.log('Example: node upload-abi.js klv1abc...def');
    process.exit(1);
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Uploading ABI to Kleverscan                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Read ABI file
  const abiPath = './kpepe-jackpot.abi.json';
  if (!fs.existsSync(abiPath)) {
    console.log('❌ ABI file not found:', abiPath);
    process.exit(1);
  }

  const abiContent = fs.readFileSync(abiPath, 'utf8');
  console.log('✅ Loaded ABI file:', abiPath);
  console.log('📄 Contract:', CONTRACT_ADDRESS);
  console.log('');

  // Initialize KleverWeb
  const web = new KleverWeb();
  await web.initialize(RPC_URL);

  // Get wallet from mnemonic
  const mnemonic = process.env.MAINNET_MNEMONIC;
  if (!mnemonic) {
    console.log('❌ MAINNET_MNEMONIC not found in .env');
    process.exit(1);
  }

  // The ABI is already in the right format for Kleverscan
  // Just show the user what to do
  console.log('📋 ABI Content (first 500 chars):');
  console.log(abiContent.substring(0, 500) + '...\n');

  console.log('════════════════════════════════════════════════════════════');
  console.log('To upload ABI to Kleverscan:');
  console.log('');
  console.log('1. Go to: https://kleverscan.org/contracts');
  console.log('2. Search for your contract: ' + CONTRACT_ADDRESS);
  console.log('3. Click on the contract');
  console.log('4. Look for "Update ABI" or "Edit Contract" button');
  console.log('5. Paste the following JSON:');
  console.log('');
  console.log('────────────────────────────────────────────────────────────');
  console.log(abiContent);
  console.log('────────────────────────────────────────────────────────────\n');

  console.log('💡 Tip: You can also use Klever IDE extension in VS Code');
  console.log('       Right-click contract → "Invoke Contract"');
}

main().catch(console.error);
