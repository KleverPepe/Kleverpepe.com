#!/usr/bin/env node

/**
 * Deploy KPEPE Contract to KleverChain Mainnet
 * Uses signing server at localhost:3001
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config();

const CONFIG = {
    signingServer: 'http://localhost:3001',
    nodeAPI: 'node.mainnet.klever.org',
    contractFile: './deployment-package/KPEPEJackpot.js'
};

// HTTP/S request helper
function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        if (options.body) {
            reqOptions.headers['Content-Type'] = 'application/json';
            reqOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
        }

        const req = client.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function deploy() {
    console.log('🚀 KPEPE CONTRACT DEPLOYMENT');
    console.log('━'.repeat(60));
    
    try {
        // 1. Check signing server
        console.log('\n🔍 Checking signing server...');
        const health = await request(`${CONFIG.signingServer}/health`);
        if (health.status !== 200) {
            throw new Error('Signing server not healthy');
        }
        console.log('✅ Signing server: ' + health.data.status);
        
        // 2. Get wallet address from signing server
        console.log('\n📝 Getting wallet address...');
        const statusRes = await request(`${CONFIG.signingServer}/status`);
        const walletAddress = statusRes.data.wallets.project;
        console.log('✅ Wallet:', walletAddress.substring(0, 25) + '...');
        
        // 3. Load contract
        console.log('\n📄 Loading contract...');
        const contractCode = fs.readFileSync(CONFIG.contractFile, 'utf8');
        const contractSize = (contractCode.length / 1024).toFixed(2);
        console.log('✅ Contract: ' + contractSize + ' KB');
        
        // 4. Build transaction
        console.log('\n🔨 Building deployment transaction...');
        const signRequest = {
            type: 'DEPLOY',
            contractCode: contractCode,
            gasLimit: 5000000
        };
        
        const signRes = await request(`${CONFIG.signingServer}/sign`, {
            method: 'POST',
            body: JSON.stringify(signRequest)
        });
        
        if (!signRes.data.success) {
            throw new Error('Signing failed: ' + (signRes.data.error || 'Unknown error'));
        }
        
        console.log('✅ Transaction signed');
        
        // 5. Broadcast
        console.log('\n📡 Broadcasting to mainnet...');
        const broadcastRes = await request(`https://${CONFIG.nodeAPI}/transaction/broadcast`, {
            method: 'POST',
            body: JSON.stringify({ tx: signRes.data.signedTx })
        });
        
        const txHash = broadcastRes.data?.data?.hash || broadcastRes.data?.hash;
        
        if (!txHash) {
            console.error('Broadcast response:', broadcastRes.data);
            throw new Error('No transaction hash received');
        }
        
        console.log('\n🎉 CONTRACT DEPLOYED!');
        console.log('━'.repeat(60));
        console.log(`\n📊 TX Hash: ${txHash}`);
        console.log(`🔗 https://kleverscan.org/transaction/${txHash}`);
        console.log('\n⏳ Confirmation pending (1-2 min)');
        console.log('\n✅ Next: Copy contract address from KleverScan');
        console.log('   Then update .env with CONTRACT_ADDRESS\n');
        
        // Save info
        fs.writeFileSync('deployment-tx.json', JSON.stringify({
            timestamp: new Date().toISOString(),
            txHash,
            kleverscan: `https://kleverscan.org/transaction/${txHash}`,
            status: 'pending'
        }, null, 2));
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED');
        console.error('━'.repeat(60));
        console.error(error.message);
        if (error.response) console.error('Response:', error.response);
        process.exit(1);
    }
}

deploy();
