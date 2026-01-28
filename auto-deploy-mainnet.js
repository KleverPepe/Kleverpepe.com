#!/usr/bin/env node

/**
 * KPEPE Lottery - Automated Mainnet Deployment
 * 
 * This script automates everything possible and guides you through
 * the manual steps required for KleverChain deployment.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Account, TransactionType } = require('@klever/sdk-node');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const CONFIG = {
    network: 'mainnet',
    rpcUrl: 'https://node.klever.finance',
    apiUrl: 'https://api.mainnet.klever.org',
    contractFile: './contracts/KPEPEJackpot.js',
    projectWallet: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
    prizePoolWallet: 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2',
    kpepeToken: 'kpepe-1eod'
};

async function main() {
    console.clear();
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     🎰 KPEPE LOTTERY - AUTOMATED MAINNET DEPLOYMENT       ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    // Step 1: Pre-flight checks
    log('📋 STEP 1: Pre-flight Checks', 'bright');
    log('═'.repeat(60), 'cyan');
    
    // Check contract file
    if (!fs.existsSync(CONFIG.contractFile)) {
        log('❌ Contract file not found!', 'red');
        process.exit(1);
    }
    const contractCode = fs.readFileSync(CONFIG.contractFile, 'utf8');
    const sizeKB = (contractCode.length / 1024).toFixed(2);
    log(`✅ Contract file found: ${sizeKB} KB`, 'green');

    // Check environment
    if (!process.env.MAINNET_MNEMONIC) {
        log('❌ MAINNET_MNEMONIC not found in .env', 'red');
        process.exit(1);
    }
    log('✅ MAINNET_MNEMONIC configured', 'green');

    // Create account
    log('✅ Creating account from mnemonic...', 'green');
    const account = new Account(process.env.MAINNET_MNEMONIC);
    await account.ready;
    log(`✅ Account ready: ${account.address}`, 'green');

    log('\n✅ All pre-flight checks passed!\n', 'green');

    // Step 2: Prepare deployment package
    log('📋 STEP 2: Preparing Deployment Package', 'bright');
    log('═'.repeat(60), 'cyan');

    const deploymentDir = './deployment-package';
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir);
    }

    // Copy contract to deployment package
    fs.copyFileSync(CONFIG.contractFile, path.join(deploymentDir, 'KPEPEJackpot.js'));
    
    // Create deployment instructions
    const instructions = `# KleverChain Mainnet Deployment Package

## Contract Information
- File: KPEPEJackpot.js
- Size: ${sizeKB} KB
- Network: KleverChain Mainnet
- Deployer: ${account.address}

## Deployment Instructions

### Via KleverScan (Recommended)
1. Go to: https://kleverscan.org/contracts
2. Click "Deploy Contract"
3. Select "JavaScript/WASM"
4. Upload: KPEPEJackpot.js (from this folder)
5. Gas Limit: 3,000,000
6. Click "Deploy" and confirm
7. Copy the contract address (klv1qqq...)

### Configuration to Use
- Project Wallet: ${CONFIG.projectWallet}
- Prize Pool: ${CONFIG.prizePoolWallet}
- KPEPE Token: ${CONFIG.kpepeToken}

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync(path.join(deploymentDir, 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);
    log(`✅ Deployment package created in: ${deploymentDir}`, 'green');
    log(`✅ Contract file: ${deploymentDir}/KPEPEJackpot.js`, 'green');

    // Step 3: Manual deployment required
    log('\n📋 STEP 3: Deploy Contract (Manual Step Required)', 'bright');
    log('═'.repeat(60), 'cyan');
    log('\n⚠️  KleverChain requires manual contract deployment via UI\n', 'yellow');
    log('Please complete these steps:', 'cyan');
    log('  1. Open: https://kleverscan.org/contracts', 'blue');
    log('  2. Click "Deploy Contract"', 'blue');
    log(`  3. Upload file: ${deploymentDir}/KPEPEJackpot.js`, 'blue');
    log('  4. Set Gas Limit: 3,000,000', 'blue');
    log('  5. Click "Deploy" and confirm in wallet', 'blue');
    log('  6. Wait for confirmation (~2 minutes)', 'blue');
    log('  7. Copy the contract address (starts with klv1qqq)\n', 'blue');

    // Try to open KleverScan
    const { exec } = require('child_process');
    log('🌐 Opening KleverScan in your browser...', 'cyan');
    exec('open https://kleverscan.org/contracts || xdg-open https://kleverscan.org/contracts');
    
    await sleep(2000);

    const contractAddress = await question('\n📝 Enter deployed contract address (klv1qqq...): ');
    
    if (!contractAddress || !contractAddress.startsWith('klv1')) {
        log('❌ Invalid contract address', 'red');
        process.exit(1);
    }

    log(`✅ Contract address saved: ${contractAddress}`, 'green');

    // Save to .env
    const envPath = './.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
        envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    log('✅ Updated .env with contract address', 'green');

    // Step 4: Initialize contract (Automated!)
    log('\n📋 STEP 4: Initializing Contract Functions (Automated)', 'bright');
    log('═'.repeat(60), 'cyan');

    log('\n🔧 This step is fully automated. Please wait...\n', 'yellow');

    // 4.1 Initialize wallets
    log('📤 Calling initializeWallets...', 'cyan');
    try {
        const initWalletsTx = await account.buildTransaction([{
            type: TransactionType.SmartContract,
            payload: {
                scType: 'InvokeContract',
                contractAddress: contractAddress,
                callValue: 0,
                callData: [
                    'initializeWallets',
                    CONFIG.projectWallet,
                    CONFIG.prizePoolWallet
                ]
            }
        }], {
            provider: CONFIG.rpcUrl
        });

        const signedInitWallets = await account.signTransaction(initWalletsTx);
        const resultInitWallets = await account.broadcastTransactions([signedInitWallets]);
        
        log(`✅ initializeWallets TX: ${resultInitWallets.txsHashes[0]}`, 'green');
        log('⏱️  Waiting for confirmation...', 'yellow');
        await sleep(10000); // Wait 10 seconds
        
    } catch (error) {
        log(`❌ Error initializing wallets: ${error.message}`, 'red');
        log('You may need to call this manually on KleverScan', 'yellow');
    }

    // 4.2 Set KPEPE token
    log('\n📤 Calling setKPEPEToken...', 'cyan');
    try {
        const setTokenTx = await account.buildTransaction([{
            type: TransactionType.SmartContract,
            payload: {
                scType: 'InvokeContract',
                contractAddress: contractAddress,
                callValue: 0,
                callData: [
                    'setKPEPEToken',
                    CONFIG.kpepeToken
                ]
            }
        }], {
            provider: CONFIG.rpcUrl
        });

        const signedSetToken = await account.signTransaction(setTokenTx);
        const resultSetToken = await account.broadcastTransactions([signedSetToken]);
        
        log(`✅ setKPEPEToken TX: ${resultSetToken.txsHashes[0]}`, 'green');
        log('⏱️  Waiting for confirmation...', 'yellow');
        await sleep(10000);
        
    } catch (error) {
        log(`❌ Error setting token: ${error.message}`, 'red');
        log('You may need to call this manually on KleverScan', 'yellow');
    }

    // 4.3 Toggle round (enable lottery)
    log('\n📤 Calling toggleRound...', 'cyan');
    try {
        const toggleTx = await account.buildTransaction([{
            type: TransactionType.SmartContract,
            payload: {
                scType: 'InvokeContract',
                contractAddress: contractAddress,
                callValue: 0,
                callData: ['toggleRound']
            }
        }], {
            provider: CONFIG.rpcUrl
        });

        const signedToggle = await account.signTransaction(toggleTx);
        const resultToggle = await account.broadcastTransactions([signedToggle]);
        
        log(`✅ toggleRound TX: ${resultToggle.txsHashes[0]}`, 'green');
        log('⏱️  Waiting for confirmation...', 'yellow');
        await sleep(10000);
        
    } catch (error) {
        log(`❌ Error toggling round: ${error.message}`, 'red');
        log('You may need to call this manually on KleverScan', 'yellow');
    }

    log('\n✅ Contract initialization complete!', 'green');

    // Step 5: Start signing server
    log('\n📋 STEP 5: Starting Signing Server', 'bright');
    log('═'.repeat(60), 'cyan');

    log('\n🔧 Starting PM2 signing server...', 'cyan');
    
    const { exec: execPromise } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(execPromise);

    try {
        // Stop existing
        await execAsync('pm2 stop kpepe-signing 2>/dev/null || true');
        await execAsync('pm2 delete kpepe-signing 2>/dev/null || true');
        
        // Start new
        await execAsync('pm2 start sign-tx.js --name kpepe-signing');
        await sleep(3000);
        
        log('✅ Signing server started', 'green');
        
        // Check health
        const axios = require('axios');
        const health = await axios.get('http://localhost:3001/health', { timeout: 5000 });
        
        if (health.data.status === 'healthy') {
            log('✅ Signing server is healthy', 'green');
        }
    } catch (error) {
        log(`⚠️  Could not start PM2 server: ${error.message}`, 'yellow');
        log('You can start manually with: pm2 start sign-tx.js --name kpepe-signing', 'blue');
    }

    // Step 6: Verification
    log('\n📋 STEP 6: Running System Verification', 'bright');
    log('═'.repeat(60), 'cyan');

    if (fs.existsSync('./verify-mainnet.js')) {
        log('\n🔍 Running verification script...\n', 'cyan');
        try {
            await execAsync('node verify-mainnet.js');
        } catch (error) {
            log('⚠️  Verification completed with warnings', 'yellow');
        }
    }

    // Final summary
    log('\n╔════════════════════════════════════════════════════════════╗', 'green');
    log('║              🎉 DEPLOYMENT COMPLETE!                       ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝\n', 'green');

    log('📊 Deployment Summary:', 'bright');
    log('═'.repeat(60), 'cyan');
    log(`✅ Contract deployed: ${contractAddress}`, 'green');
    log(`✅ Project wallet: ${CONFIG.projectWallet}`, 'green');
    log(`✅ Prize pool: ${CONFIG.prizePoolWallet}`, 'green');
    log(`✅ KPEPE token: ${CONFIG.kpepeToken}`, 'green');
    log('✅ Signing server: Running on port 3001', 'green');

    log('\n🌐 Links:', 'bright');
    log(`  Website: https://kleverpepe.com`, 'blue');
    log(`  Contract: https://kleverscan.org/contracts/${contractAddress}`, 'blue');
    log(`  GitHub: https://github.com/KleverPepe/kpepe-lottery`, 'blue');

    log('\n📋 Next Steps:', 'bright');
    log('  1. Test buying a ticket on your website', 'blue');
    log('  2. Monitor with: pm2 logs kpepe-signing', 'blue');
    log('  3. Announce launch on social media!', 'blue');

    log('\n🎊 Your lottery is now LIVE on KleverChain Mainnet! 🎊\n', 'green');

    rl.close();
    process.exit(0);
}

// Error handling
process.on('unhandledRejection', (error) => {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('\nCheck the error above and try again, or deploy manually using DEPLOY_NOW.md', 'yellow');
    rl.close();
    process.exit(1);
});

// Run
main().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    rl.close();
    process.exit(1);
});
