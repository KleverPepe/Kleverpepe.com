// Upload ABI to Kleverscan via API
// This attempts to update the contract ABI programmatically

const fs = require('fs');
const { KleverWeb } = require('@klever/sdk');
require('dotenv').config();

const RPC_URL = 'https://klever-mainnet.rpc.thirdweb.com';
const KLEVERSCAN_API = 'https://api.kleverscan.org/v1';

async function uploadABI(contractAddress, abiContent) {
  const web = new KleverWeb();
  await web.initialize(RPC_URL);

  // Get wallet
  const mnemonic = process.env.MAINNET_MNEMONIC;
  if (!mnemonic) {
    throw new Error('MAINNET_MNEMONIC not found in .env');
  }

  const key = await web.loadFromMnemonic(mnemonic);
  const address = key.address;

  console.log('👤 Using address:', address);

  // Build transaction to "update" contract metadata
  // Note: Kleverscan may require API authentication for ABI updates
  // This is a workaround using the contract itself if it supports ABI updates

  console.log('\n📡 Attempting to update contract ABI...');

  // Method 1: Try Kleverscan API (may require API key)
  try {
    const response = await fetch(`${KLEVERSCAN_API}/contract/${contractAddress}/abi`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KLEVERSCAN_API_KEY || ''}`
      },
      body: JSON.stringify({
        abi: JSON.parse(abiContent)
      })
    });

    if (response.ok) {
      console.log('✅ ABI uploaded via Kleverscan API');
      return true;
    }
  } catch (e) {
    console.log('⚠️ API method failed:', e.message);
  }

  // Method 2: Direct contract call (if supported)
  console.log('📝 Alternative: Manual upload required');
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const contractAddress = args[0];

  if (!contractAddress) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Upload ABI to Kleverscan                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('Usage: node upload-abi-api.js <contract-address>\n');
    console.log('Example:');
    console.log('  node upload-abi-api.js klv1r8lqmscq5vfxczm3dukwm3z5t2wq7k2y2q8y8c\n');
    console.log('Options:');
    console.log('  1. Kleverscan UI (recommended)');
    console.log('  2. VS Code Klever IDE');
    console.log('  3. API (requires API key)\n');
    process.exit(0);
  }

  // Read ABI
  const abiPath = './kpepe-jackpot.abi.json';
  if (!fs.existsSync(abiPath)) {
    console.log('❌ ABI file not found:', abiPath);
    process.exit(1);
  }

  const abiContent = fs.readFileSync(abiPath, 'utf8');
  console.log('✅ ABI loaded from:', abiPath);
  console.log('📄 Contract:', contractAddress);

  // Try to upload
  await uploadABI(contractAddress, abiContent);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('If automatic upload failed, do this manually:\n');
  console.log('1. Open: https://kleverscan.org/address/' + contractAddress);
  console.log('2. Click "Contract" tab');
  console.log('3. Look for "Update ABI" or "Edit"');
  console.log('4. Paste the ABI content\n');
  console.log('ABI File location:');
  console.log('  ' + path.resolve(abiPath));
  console.log('');
}

main().catch(console.error);
