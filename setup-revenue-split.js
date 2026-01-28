/**
 * KPEPE Jackpot - Revenue Split Setup Script
 * 
 * This script helps the contract owner:
 * 1. Initialize the project wallet (one-time setup)
 * 2. Withdraw accumulated 15% revenue from previous ticket sales
 * 
 * Run: node setup-revenue-split.js
 */

const web3 = require('@klever/sdk-web');

// Configuration
const CONFIG = {
  CONTRACT: 'klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d',
  PROJECT_WALLET: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
  RPC: 'https://node.mainnet.klever.org',
  CHAIN_ID: '100'
};

// Previous ticket sales: 2 tickets × 100 KLV = 200 KLV total
// 15% revenue share = 30 KLV (30000000 precision units)
const ACCUMULATED_REVENUE = 30000000; // 30 KLV in precision units

async function main() {
    console.log('💼 KPEPE Jackpot Revenue Split Setup');
    console.log('====================================');
    console.log('Contract:', CONFIG.CONTRACT);
    console.log('Project Wallet:', CONFIG.PROJECT_WALLET);
    console.log('');
    console.log('📊 Accumulated Revenue: 30 KLV (15% from 2 confirmed ticket sales)');
    console.log('');
    
    // Check if running in browser with Klever Extension
    if (typeof window !== 'undefined' && window.kleverWeb) {
        await setupWithExtension();
    } else {
        console.log('⚠️  Browser environment required for Klever Extension');
        console.log('');
        showManualInstructions();
    }
}

async function setupWithExtension() {
    try {
        console.log('🔌 Connecting to Klever Extension...');
        
        // Initialize Web SDK
        await web3.initialize({
            provider: CONFIG.RPC,
            node: {
                api: CONFIG.RPC,
                chainId: CONFIG.CHAIN_ID
            }
        });
        
        // Request wallet connection
        const accounts = await window.kleverWeb.request({
            method: 'klv_requestAccounts'
        });
        
        const ownerAddress = accounts[0];
        console.log('✅ Connected:', ownerAddress);
        console.log('');
        
        // Step 1: Initialize project wallet
        console.log('📝 Step 1: Initialize Project Wallet');
        console.log('Preparing transaction...');
        
        const initTx = {
            type: 18, // SmartContract type
            payload: {
                scType: 2, // InvokeContract
                contractAddress: CONFIG.CONTRACT,
                callValue: 0,
                callData: buildCallData('initialize_wallets', [CONFIG.PROJECT_WALLET])
            }
        };
        
        console.log('🚀 Sending initialize_wallets transaction...');
        const initResult = await window.kleverWeb.request({
            method: 'klv_sendTransaction',
            params: [initTx]
        });
        
        console.log('✅ Transaction sent:', initResult.hash);
        console.log('⏳ Waiting for confirmation...');
        await sleep(5000);
        
        // Step 2: Withdraw accumulated revenue
        console.log('');
        console.log('📝 Step 2: Withdraw Accumulated Revenue (75 KLV)');
        console.log('Preparing transaction...');
        
        const withdrawTx = {
            type: 18,
            payload: {
                scType: 2,
                contractAddress: CONFIG.CONTRACT,
                callValue: 0,
                callData: buildCallData('withdraw', [ACCUMULATED_REVENUE.toString()])
            }
        };
        
        console.log('🚀 Sending withdraw transaction...');
        const withdrawResult = await window.kleverWeb.request({
            method: 'klv_sendTransaction',
            params: [withdrawTx]
        });
        
        console.log('✅ Transaction sent:', withdrawResult.hash);
        console.log('');
        console.log('✅ Setup Complete!');
        console.log('');
        console.log('📊 Summary:');
        console.log('- Project wallet initialized');
        console.log('- 30 KLV withdrawn to project wallet');
        console.log('- Future tickets will auto-split: 85% pool / 15% project');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        showManualInstructions();
    }
}

function buildCallData(functionName, args) {
    // Build ABI-encoded call data for Klever smart contract
    // Format: functionName@arg1@arg2@...
    let callData = functionName;
    
    if (args && args.length > 0) {
        for (const arg of args) {
            // Convert argument to hex
            const hexArg = typeof arg === 'string' && arg.startsWith('klv') 
                ? Buffer.from(arg, 'utf8').toString('hex')
                : Number(arg).toString(16).padStart(16, '0');
            callData += '@' + hexArg;
        }
    }
    
    return callData;
}

function showManualInstructions() {
    console.log('📋 Manual Setup Instructions:');
    console.log('=============================');
    console.log('');
    console.log('Use Klever Extension or kleverscan.org to call these functions:');
    console.log('');
    console.log('1️⃣ Initialize Project Wallet');
    console.log('   Contract:', CONFIG.CONTRACT);
    console.log('   Function: initialize_wallets');
    console.log('   Parameter: project_wallet');
    console.log('   Value:', CONFIG.PROJECT_WALLET);
    console.log('');
    console.log('2️⃣ Withdraw Accumulated Revenue');
    console.log('   Contract:', CONFIG.CONTRACT);
    console.log('   Function: withdraw');
    console.log('   Parameter: amount');
    console.log('   Value: 30000000 (30 KLV)');
    console.log('');
    console.log('💡 After these transactions:');
    console.log('   - All future ticket purchases will auto-split');
    console.log('   - 85 KLV → Prize Pool');
    console.log('   - 15 KLV → Project Wallet');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { CONFIG, buildCallData, showManualInstructions };
