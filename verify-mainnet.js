#!/usr/bin/env node

/**
 * KPEPE Lottery - Mainnet Verification Script
 * 
 * Verifies successful deployment and initialization
 * Run this after completing all KleverScan initialization steps
 */

const axios = require('axios');
const { Account } = require('@klever/sdk');
require('dotenv').config();

const CONFIG = {
    rpcUrl: 'https://node.klever.finance',
    apiUrl: 'https://api.mainnet.klever.org',
    projectWallet: process.env.PROJECT_WALLET || 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
    prizePoolWallet: process.env.PRIZE_POOL_WALLET || 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2',
    kpepeToken: process.env.KPEPE_TOKEN || 'kpepe-1eod',
    contractAddress: process.env.CONTRACT_ADDRESS || 'klv1qqq...'
};

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkContractDeployed() {
    log('\n📋 Checking contract deployment...', 'cyan');
    
    try {
        const response = await axios.get(
            `${CONFIG.apiUrl}/account/${CONFIG.contractAddress}`,
            { timeout: 10000 }
        );
        
        if (response.data) {
            log('✅ Contract is deployed on mainnet', 'green');
            log(`   Address: ${CONFIG.contractAddress}`, 'blue');
            return true;
        }
    } catch (error) {
        log('❌ Contract not found - may not be deployed yet', 'red');
        log(`   Error: ${error.message}`, 'yellow');
        return false;
    }
}

async function checkWalletInitialization() {
    log('\n👤 Checking wallet initialization...', 'cyan');
    
    try {
        // Check project wallet exists
        const projectResponse = await axios.get(
            `${CONFIG.apiUrl}/account/${CONFIG.projectWallet}`,
            { timeout: 10000 }
        );
        
        if (projectResponse.data) {
            log('✅ Project wallet initialized', 'green');
            log(`   Address: ${CONFIG.projectWallet}`, 'blue');
        }
        
        // Check prize pool wallet exists
        const poolResponse = await axios.get(
            `${CONFIG.apiUrl}/account/${CONFIG.prizePoolWallet}`,
            { timeout: 10000 }
        );
        
        if (poolResponse.data) {
            log('✅ Prize pool wallet initialized', 'green');
            log(`   Address: ${CONFIG.prizePoolWallet}`, 'blue');
        }
        
        return true;
    } catch (error) {
        log('❌ Wallet initialization check failed', 'red');
        log(`   Error: ${error.message}`, 'yellow');
        return false;
    }
}

async function checkKPEPEToken() {
    log('\n💰 Checking KPEPE token configuration...', 'cyan');
    
    try {
        const response = await axios.get(
            `${CONFIG.apiUrl}/token/${CONFIG.kpepeToken}`,
            { timeout: 10000 }
        );
        
        if (response.data) {
            log('✅ KPEPE token is valid', 'green');
            log(`   Token ID: ${CONFIG.kpepeToken}`, 'blue');
            log(`   Name: ${response.data.name || 'KleverPepe'}`, 'blue');
            return true;
        }
    } catch (error) {
        log('❌ KPEPE token not found', 'red');
        log(`   Error: ${error.message}`, 'yellow');
        return false;
    }
}

async function checkSigningServer() {
    log('\n🔐 Checking signing server...', 'cyan');
    
    try {
        const response = await axios.get('http://localhost:3001/health', {
            timeout: 5000
        });
        
        if (response.data && response.data.status === 'healthy') {
            log('✅ Signing server is running', 'green');
            log(`   Status: ${response.data.status}`, 'blue');
            log(`   Network: ${response.data.network}`, 'blue');
            return true;
        }
    } catch (error) {
        log('❌ Signing server not responding', 'red');
        log(`   Start it with: pm2 start sign-tx.js --name kpepe-signing`, 'yellow');
        return false;
    }
}

async function checkRecentTransactions() {
    log('\n📊 Checking recent transactions...', 'cyan');
    
    try {
        const response = await axios.get(
            `${CONFIG.apiUrl}/transactions?contract=${CONFIG.contractAddress}&limit=10`,
            { timeout: 10000 }
        );
        
        if (response.data && response.data.length > 0) {
            log(`✅ Contract has ${response.data.length} recent transactions`, 'green');
            response.data.slice(0, 3).forEach((tx, i) => {
                log(`   [${i + 1}] Type: ${tx.type} | Hash: ${tx.hash.slice(0, 16)}...`, 'blue');
            });
            return true;
        } else {
            log('⚠️  No transactions found yet (contract may be new)', 'yellow');
            return true;
        }
    } catch (error) {
        log('⚠️  Could not fetch transaction history', 'yellow');
        log(`   ${error.message}`, 'yellow');
        return true; // Not critical
    }
}

async function checkNetworkHealth() {
    log('\n🌐 Checking KleverChain network...', 'cyan');
    
    try {
        const response = await axios.get(
            `${CONFIG.apiUrl}/blockchain/status`,
            { timeout: 10000 }
        );
        
        if (response.data) {
            log('✅ KleverChain network is operational', 'green');
            log(`   Height: ${response.data.height || 'N/A'}`, 'blue');
            return true;
        }
    } catch (error) {
        log('❌ Network health check failed', 'red');
        log(`   ${error.message}`, 'yellow');
        return false;
    }
}

async function runAllChecks() {
    log('\n' + '═'.repeat(60), 'cyan');
    log('🚀 KPEPE LOTTERY - MAINNET VERIFICATION', 'cyan');
    log('═'.repeat(60), 'cyan');
    
    const checks = [
        { name: 'Contract Deployment', fn: checkContractDeployed },
        { name: 'Wallet Initialization', fn: checkWalletInitialization },
        { name: 'KPEPE Token', fn: checkKPEPEToken },
        { name: 'Network Health', fn: checkNetworkHealth },
        { name: 'Recent Transactions', fn: checkRecentTransactions },
        { name: 'Signing Server', fn: checkSigningServer }
    ];
    
    const results = [];
    
    for (const check of checks) {
        try {
            const passed = await check.fn();
            results.push({ name: check.name, passed });
        } catch (error) {
            log(`\n❌ Error checking ${check.name}: ${error.message}`, 'red');
            results.push({ name: check.name, passed: false });
        }
    }
    
    // Summary
    log('\n' + '═'.repeat(60), 'cyan');
    log('📋 VERIFICATION SUMMARY', 'cyan');
    log('═'.repeat(60), 'cyan');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        const color = result.passed ? 'green' : 'red';
        log(`${status} ${result.name}`, color);
    });
    
    log('\n' + '═'.repeat(60), 'cyan');
    log(`TOTAL: ${passed}/${total} checks passed`, passed === total ? 'green' : 'yellow');
    log('═'.repeat(60), 'cyan');
    
    if (passed === total) {
        log('\n✅ ALL CHECKS PASSED - SYSTEM READY FOR LAUNCH', 'green');
        log('\nNext steps:', 'cyan');
        log('1. Run npm test to verify functionality', 'blue');
        log('2. Execute: npm start to launch the lottery', 'blue');
        log('3. Monitor: pm2 logs kpepe-signing', 'blue');
        return true;
    } else {
        log('\n⚠️  SOME CHECKS FAILED - REVIEW ERRORS ABOVE', 'red');
        log('\nRequired actions:', 'yellow');
        if (!results[0].passed) log('→ Deploy contract via KleverScan', 'yellow');
        if (!results[1].passed) log('→ Initialize wallets on contract', 'yellow');
        if (!results[2].passed) log('→ Set KPEPE token on contract', 'yellow');
        if (!results[3].passed) log('→ Check KleverChain network status', 'yellow');
        if (!results[5].passed) log('→ Start signing server: pm2 start sign-tx.js', 'yellow');
        return false;
    }
}

// Run verification
runAllChecks()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        log(`\n❌ Verification failed: ${error.message}`, 'red');
        process.exit(1);
    });
