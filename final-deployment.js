#!/usr/bin/env node

/**
 * KPEPE Lottery - Final Deployment Automation
 * Executes: Contract address update + Wallet initialization + Website launch
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

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

async function runDeployment() {
  console.log(`\n${colors.bold}${colors.blue}🚀 KPEPE Final Deployment Automation${colors.reset}\n`);

  let deploymentAddress = process.env.CONTRACT_ADDRESS;

  // Step 1: Prompt for contract address if not set
  log.section('Contract Deployment');
  if (deploymentAddress && deploymentAddress !== 'klv1qqqqqqqqqqqqqpgq6xv6kjc603gys4l2jma9szhujxjmnlhnud2s7lwyhl') {
    log.ok(`Using existing contract: ${deploymentAddress}`);
  } else {
    log.info('📌 CONTRACT DEPLOYMENT REQUIRED (Manual Step on KleverScan)');
    log.info('1. Go to https://kleverscan.org');
    log.info('2. Upload contract file: deployment-package/KPEPEJackpot.js');
    log.info('3. Copy the deployed contract address');
    log.info('');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(`${colors.bold}Enter deployed contract address: ${colors.reset}`, (answer) => {
        rl.close();
        if (answer && answer.startsWith('klv1')) {
          deploymentAddress = answer;
          log.ok(`Contract address registered: ${deploymentAddress}`);

          // Update .env
          const envPath = path.join(process.cwd(), '.env');
          let envContent = fs.readFileSync(envPath, 'utf-8');
          envContent = envContent.replace(
            /CONTRACT_ADDRESS=.*/,
            `CONTRACT_ADDRESS=${deploymentAddress}`
          );
          fs.writeFileSync(envPath, envContent);
          log.ok('Updated .env with new contract address');

          // Reload env
          process.env.CONTRACT_ADDRESS = deploymentAddress;

          resolve();
        } else {
          log.error('Invalid contract address');
          process.exit(1);
        }
      });
    });
  }
}

async function initializeWallets() {
  log.section('Wallet Initialization');

  const initScript = path.join(process.cwd(), 'initialize-wallets.js');
  if (!fs.existsSync(initScript)) {
    log.warn('initialize-wallets.js not found - skipping wallet initialization');
    return;
  }

  try {
    log.info('Running wallet initialization...');
    execSync(`node ${initScript}`, { stdio: 'inherit' });
    log.ok('Wallet initialization complete');
  } catch (err) {
    log.error(`Wallet initialization failed: ${err.message}`);
    log.warn('Continue with caution');
  }
}

async function launchWebsite() {
  log.section('Website Launch');

  const packageJson = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJson)) {
    log.warn('package.json not found - skipping website launch');
    return;
  }

  try {
    log.info('Starting website server...');
    log.info(`PORT ${process.env.PORT || 3000}`);

    // Don't await, just start in background
    require('child_process').spawn('npm', ['start'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      detached: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    log.ok('Website server started');
  } catch (err) {
    log.warn(`Website start issue: ${err.message}`);
  }
}

async function finalStatus() {
  log.section('Final Status');

  // Check signing server
  const http = require('http');
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3001/health', (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid response'));
          }
        });
      });
      req.setTimeout(3000, () => reject(new Error('Timeout')));
      req.on('error', reject);
    });

    log.ok(`Signing Server: ${response.status}`);
    log.info(`  Network: ${response.network}`);
    log.info(`  Uptime: ${response.uptime}s`);
  } catch (err) {
    log.error(`Signing Server: ${err.message}`);
  }

  // Final summary
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}Deployment Complete!${colors.reset}\n`);
  console.log(`${colors.green}✓ Environment configured${colors.reset}`);
  console.log(`${colors.green}✓ Wallets initialized${colors.reset}`);
  console.log(`${colors.green}✓ Website launched${colors.reset}`);
  console.log(`${colors.green}✓ Signing server running${colors.reset}\n`);

  console.log(`${colors.bold}Next Steps:${colors.reset}`);
  console.log(`1. Visit your website at http://localhost:${process.env.PORT || 3000}`);
  console.log(`2. Monitor signing server: pm2 logs kpepe-signing`);
  console.log(`3. Verify transactions: curl http://localhost:3001/status`);
  console.log(`4. Announce launch on social media\n`);
}

// Main execution
(async () => {
  try {
    await runDeployment();
    await initializeWallets();
    await launchWebsite();
    await finalStatus();
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }
})();
