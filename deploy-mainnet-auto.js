#!/usr/bin/env node

/**
 * KPEPE Contract - Pure Node.js Automated Deployment
 * No browser extension required
 * Deploys directly to KleverChain Mainnet
 */

const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config();

// Configuration
const CONFIG = {
    nodeAPI: 'node.mainnet.klever.org',
    apiEndpoint: 'api.mainnet.klever.org',
    contractFile: './deployment-package/KPEPEJackpot.js',
    mnemonic: process.env.WALLET_MNEMONIC,
    projectWallet: 'klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9',
    prizePoolWallet: 'klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2'
};

// HTTP Request utility
function httpsRequest(hostname, path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname,
            port: 443,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data) {
            const body = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (res.statusCode >= 400) {
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    if (res.statusCode >= 400) {
                        reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                    } else {
                        resolve(responseData);
                    }
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Use signing server for transaction signing
async function signWithServer(txData) {
    const http = require('http');
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ txData });
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/sign',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse signing server response'));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Main deployment function
async function deployContract() {
    console.log('🚀 KPEPE CONTRACT DEPLOYMENT - AUTOMATED');
    console.log('━'.repeat(60));
    
    try {
        // Step 1: Load contract
        console.log('\n📄 Loading contract...');
        if (!fs.existsSync(CONFIG.contractFile)) {
            throw new Error(`Contract file not found: ${CONFIG.contractFile}`);
        }
        
        const contractCode = fs.readFileSync(CONFIG.contractFile, 'utf8');
        const contractSize = (contractCode.length / 1024).toFixed(2);
        console.log(`✅ Contract loaded: ${contractSize} KB`);
        
        // Step 2: Get account info
        console.log('\n🔍 Fetching account info...');
        const accountData = await httpsRequest(
            CONFIG.apiEndpoint,
            `/v1.0/address/${CONFIG.projectWallet}`
        );
        
        const nonce = accountData?.data?.account?.nonce || 0;
        console.log(`✅ Account nonce: ${nonce}`);
        
        // Step 3: Build transaction using Klever API
        console.log('\n🔨 Building transaction...');
        
        const txPayload = {
            type: 1,
            sender: CONFIG.projectWallet,
            nonce: nonce + 1,
            data: [],
            kdataFee: 0,
            kAppFee: 10000000, // 10 KLV base fee
            contracts: [{
                type: 27, // SmartContract type
                parameter: {
                    scType: 0,
                    code: Buffer.from(contractCode).toString('hex'),
                    codeMetadata: '',
                    vmType: 'WasmVM',
                    ownerAddress: CONFIG.projectWallet
                }
            }]
        };
        
        console.log('✅ Transaction payload created');
        
        // Step 4: Build unsigned transaction via API
        console.log('\n📝 Building unsigned transaction via Klever API...');
        const buildResponse = await httpsRequest(
            CONFIG.nodeAPI,
            '/transaction/send',
            'POST',
            txPayload
        );
        
        if (buildResponse.error) {
            throw new Error(`Build failed: ${JSON.stringify(buildResponse.error)}`);
        }
        
        console.log('✅ Unsigned transaction built');
        
        // Step 5: Sign transaction using local signing server
        console.log('\n✍️  Signing transaction...');
        const signResult = await signWithServer(buildResponse.data.unsignedTx || buildResponse.data);
        
        if (!signResult.success) {
            throw new Error(`Signing failed: ${signResult.error}`);
        }
        
        console.log('✅ Transaction signed');
        
        // Step 6: Broadcast
        console.log('\n📡 Broadcasting to KleverChain Mainnet...');
        const broadcastResult = await httpsRequest(
            CONFIG.nodeAPI,
            '/transaction/broadcast',
            'POST',
            { tx: signResult.signedTx }
        );
        
        if (broadcastResult.error) {
            throw new Error(`Broadcast failed: ${JSON.stringify(broadcastResult.error)}`);
        }
        
        const txHash = broadcastResult.data?.hash || broadcastResult.hash;
        
        console.log('\n🎉 SUCCESS! CONTRACT DEPLOYED!');
        console.log('━'.repeat(60));
        console.log(`\n📊 Transaction Hash: ${txHash}`);
        console.log(`🔗 KleverScan: https://kleverscan.org/transaction/${txHash}`);
        console.log('\n⏳ Waiting for confirmation (1-2 minutes)...');
        console.log('\n✅ DEPLOYMENT COMPLETE!');
        console.log('\nNext Steps:');
        console.log('1. Wait for transaction confirmation on KleverScan');
        console.log('2. Copy contract address from transaction details');
        console.log('3. Update .env: CONTRACT_ADDRESS=<address>');
        console.log('4. Restart signing server: pm2 restart kpepe-signing');
        console.log('5. Launch website');
        console.log('\n━'.repeat(60));
        
        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            transactionHash: txHash,
            sender: CONFIG.projectWallet,
            network: 'mainnet',
            contractSize: contractSize + ' KB',
            kleverscanUrl: `https://kleverscan.org/transaction/${txHash}`,
            status: 'deployed_pending_confirmation'
        };
        
        fs.writeFileSync(
            'deployment-transaction.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log('💾 Deployment info saved to deployment-transaction.json\n');
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED');
        console.error('━'.repeat(60));
        console.error('Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('1. Ensure signing server is running: pm2 status');
        console.error('2. Check wallet balance (min 50 KLV recommended)');
        console.error('3. Verify .env configuration');
        console.error('4. Check network connectivity\n');
        process.exit(1);
    }
}

// Check prerequisites
console.log('🔍 Checking prerequisites...\n');

// Check signing server
const http = require('http');
http.get('http://localhost:3001/health', (res) => {
    if (res.statusCode === 200) {
        console.log('✅ Signing server online');
        deployContract();
    } else {
        console.error('❌ Signing server not responding');
        console.error('   Start it with: pm2 start sign-tx-fixed.js --name kpepe-signing\n');
        process.exit(1);
    }
}).on('error', () => {
    console.error('❌ Signing server not running on port 3001');
    console.error('   Start it with: pm2 start sign-tx-fixed.js --name kpepe-signing\n');
    process.exit(1);
});
