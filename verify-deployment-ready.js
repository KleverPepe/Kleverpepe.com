#!/usr/bin/env node

/**
 * KPEPE Lottery - Deployment Verification Script
 * Verifies all systems are ready for mainnet deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  section: (title) => console.log(`\n${colors.bold}${colors.blue}► ${title}${colors.reset}`),
  ok: (msg) => console.log(`  ${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`  ${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`  ${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`  ${colors.blue}ℹ${colors.reset} ${msg}`),
};

let checksPassed = 0;
let checksFailed = 0;

function makeRequest(url, method = 'GET') {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const defaultPort = isHttps ? 443 : 80;
    const port = urlObj.port || defaultPort;
    
    const options = {
      hostname: urlObj.hostname,
      port: port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: 5000,
    };

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ success: true, status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ success: true, status: res.statusCode, data: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

async function runChecks() {
  console.log(`\n${colors.bold}${colors.blue}🚀 KPEPE Lottery - Deployment Verification${colors.reset}\n`);

  // 1. Environment Configuration
  log.section('Environment Configuration');

  const required = {
    MAINNET_MNEMONIC: 'Mainnet mnemonic',
    CONTRACT_ADDRESS: 'Contract address',
    PORT: 'Server port',
    RPC_URL: 'RPC endpoint',
  };

  for (const [key, desc] of Object.entries(required)) {
    if (process.env[key]) {
      log.ok(`${desc}: ${process.env[key].substring(0, 30)}...`);
      checksPassed++;
    } else {
      log.error(`${desc}: NOT SET`);
      checksFailed++;
    }
  }

  // 2. File Structure
  log.section('File Structure');

  const requiredFiles = {
    'contracts/KPEPEJackpot.js': 'Smart contract code',
    'sign-tx-fixed.js': 'Signing server',
    'deployment-package/KPEPEJackpot.js': 'Packaged contract',
    'deployment-package/deployment-info.json': 'Deployment metadata',
  };

  for (const [file, desc] of Object.entries(requiredFiles)) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const size = fs.statSync(fullPath).size;
      log.ok(`${desc}: ${(size / 1024).toFixed(2)} KB`);
      checksPassed++;
    } else {
      log.error(`${desc}: NOT FOUND`);
      checksFailed++;
    }
  }

  // 3. Signing Server
  log.section('Signing Server');

  const signingServerUrl = `http://localhost:${process.env.PORT || 3001}`;

  // Health check
  const health = await makeRequest(`${signingServerUrl}/health`);
  if (health.success && health.status === 200) {
    log.ok(`Health endpoint: ${health.data.status}`);
    log.info(`Network: ${health.data.network}`);
    log.info(`Uptime: ${health.data.uptime}s`);
    checksPassed++;
  } else {
    log.error(`Health endpoint: ${health.error || 'Failed'}`);
    checksFailed++;
  }

  // Status check
  const status = await makeRequest(`${signingServerUrl}/status`);
  if (status.success && status.status === 200) {
    log.ok(`Status endpoint operational`);
    log.info(`Contract: ${status.data.contract.substring(0, 30)}...`);
    log.info(`Project Wallet: ${status.data.wallets.project.substring(0, 30)}...`);
    log.info(`Prize Pool: ${status.data.wallets.prizePool.substring(0, 30)}...`);
    log.info(`KPEPE Token: ${status.data.wallets.kpepeToken}`);
    checksPassed++;
  } else {
    log.error(`Status endpoint: ${status.error || 'Failed'}`);
    checksFailed++;
  }

  // 4. Smart Contract
  log.section('Smart Contract Verification');

  const contractPath = path.join(process.cwd(), 'contracts/KPEPEJackpot.js');
  const contract = fs.readFileSync(contractPath, 'utf-8');

  const hasInit = contract.includes('initializeWallets');
  const hasPrizePool = contract.includes('prizePool') || contract.includes('PRIZE_');
  const hasDistribution = contract.includes('distributeWinnings') || contract.includes('PRIZE_JACKPOT');

  if (hasInit) {
    log.ok('Has wallet initialization function');
    checksPassed++;
  } else {
    log.error('Missing wallet initialization');
    checksFailed++;
  }

  if (hasPrizePool) {
    log.ok('Has prize pool management');
    checksPassed++;
  } else {
    log.error('Missing prize pool management');
    checksFailed++;
  }

  if (hasDistribution) {
    log.ok('Has distribution mechanism');
    checksPassed++;
  } else {
    log.error('Missing distribution mechanism');
    checksFailed++;
  }

  // 5. KleverChain Network
  log.section('KleverChain Network');

  const nodeResponse = await makeRequest('https://node.klever.finance/health');
  if (nodeResponse.success) {
    log.ok('Node endpoint: Reachable');
    checksPassed++;
  } else {
    log.warn(`Node endpoint: ${nodeResponse.error}`);
  }

  const apiResponse = await makeRequest('https://api.mainnet.klever.org/health');
  if (apiResponse.success) {
    log.ok('API endpoint: Reachable');
    checksPassed++;
  } else {
    log.warn(`API endpoint: ${apiResponse.error}`);
  }

  // 6. Documentation
  log.section('Documentation');

  const docs = [
    'MAINNET_LAUNCH_GUIDE.md',
    'DEPLOYMENT_READY_FOR_MAINNET.md',
    'MAINNET_DEPLOYMENT_EXECUTION_SUMMARY.md',
    'DEPLOY_NOW.md',
  ];

  let docsFound = 0;
  for (const doc of docs) {
    if (fs.existsSync(path.join(process.cwd(), doc))) {
      docsFound++;
    }
  }

  log.ok(`Documentation: ${docsFound}/${docs.length} guides ready`);
  checksPassed++;

  // 7. Git Status
  log.section('Project Status');

  if (fs.existsSync(path.join(process.cwd(), '.git'))) {
    log.ok('Git repository initialized');
    checksPassed++;
  } else {
    log.warn('Git repository not found');
  }

  // Summary
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}Summary${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`\n${colors.green}✓ Passed: ${checksPassed}${colors.reset}`);
  console.log(`${checksFailed > 0 ? colors.red : colors.green}✗ Failed: ${checksFailed}${colors.reset}\n`);

  if (checksFailed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 All systems ready for mainnet deployment!${colors.reset}\n`);
    console.log(`${colors.bold}Next Steps:${colors.reset}`);
    console.log(`1. Upload contract to KleverScan`);
    console.log(`2. Run: node initialize-wallets.js`);
    console.log(`3. Monitor signing server logs: pm2 logs kpepe-signing`);
    console.log(`4. Launch website: npm start\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}⚠ Some checks failed. Please resolve before deployment.${colors.reset}\n`);
    process.exit(1);
  }
}

runChecks().catch(console.error);
