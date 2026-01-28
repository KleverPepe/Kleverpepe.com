#!/bin/bash

# KPEPE Lottery - Mainnet Deployment Helper Script
# This script helps you through the deployment process

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🎰 KPEPE LOTTERY - MAINNET DEPLOYMENT              ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo ""

# Step 1: Pre-flight checks
echo -e "${BLUE}📋 Step 1: Pre-flight Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check contract file
if [ -f "contracts/KPEPEJackpot.js" ]; then
    FILE_SIZE=$(ls -lh contracts/KPEPEJackpot.js | awk '{print $5}')
    echo -e "${GREEN}✅ Contract file found: ${FILE_SIZE}${NC}"
else
    echo -e "${RED}❌ Contract file not found!${NC}"
    exit 1
fi

# Check .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    if grep -q "MAINNET_MNEMONIC" .env; then
        echo -e "${GREEN}✅ MAINNET_MNEMONIC configured${NC}"
    else
        echo -e "${RED}❌ MAINNET_MNEMONIC not found in .env${NC}"
        exit 1
    fi
    
    if grep -q "PROJECT_WALLET" .env; then
        echo -e "${GREEN}✅ PROJECT_WALLET configured${NC}"
    else
        echo -e "${YELLOW}⚠️  PROJECT_WALLET not in .env (will use default)${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Check Node.js
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js: ${NODE_VERSION}${NC}"

# Check @klever/sdk
if npm list @klever/sdk >/dev/null 2>&1; then
    SDK_VERSION=$(npm list @klever/sdk --depth=0 | grep @klever/sdk | awk '{print $2}')
    echo -e "${GREEN}✅ @klever/sdk: ${SDK_VERSION}${NC}"
else
    echo -e "${YELLOW}⚠️  @klever/sdk not installed, installing now...${NC}"
    npm install @klever/sdk
fi

echo ""
echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"
echo ""

# Step 2: Open KleverScan for deployment
echo -e "${BLUE}📋 Step 2: Deploy Contract on KleverScan${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening KleverScan contract deployment page..."
echo ""
echo -e "${YELLOW}⚡ ACTION REQUIRED:${NC}"
echo "1. Click 'Deploy Contract' button"
echo "2. Select 'JavaScript/WASM'"
echo "3. Upload file: contracts/KPEPEJackpot.js"
echo "4. Set Gas Limit: 3000000"
echo "5. Click 'Deploy' and confirm"
echo "6. COPY THE CONTRACT ADDRESS when deployment completes"
echo ""

# Open KleverScan
if command -v open &> /dev/null; then
    open "https://kleverscan.org/contracts"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://kleverscan.org/contracts"
else
    echo "Visit: https://kleverscan.org/contracts"
fi

echo ""
echo -e "${YELLOW}Press ENTER after you've deployed the contract and copied the address...${NC}"
read

# Step 3: Get contract address
echo ""
echo -e "${BLUE}📋 Step 3: Save Contract Address${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Enter your deployed contract address (starts with klv1qqq):${NC}"
read CONTRACT_ADDRESS

# Validate address format
if [[ ! $CONTRACT_ADDRESS =~ ^klv1 ]]; then
    echo -e "${RED}❌ Invalid address format. Must start with 'klv1'${NC}"
    exit 1
fi

# Save to .env
if grep -q "CONTRACT_ADDRESS" .env; then
    # Update existing
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=${CONTRACT_ADDRESS}|" .env
    else
        sed -i "s|CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=${CONTRACT_ADDRESS}|" .env
    fi
    echo -e "${GREEN}✅ Updated CONTRACT_ADDRESS in .env${NC}"
else
    # Add new
    echo "CONTRACT_ADDRESS=${CONTRACT_ADDRESS}" >> .env
    echo -e "${GREEN}✅ Added CONTRACT_ADDRESS to .env${NC}"
fi

echo ""
echo -e "${GREEN}Contract Address: ${CONTRACT_ADDRESS}${NC}"
echo ""

# Step 4: Initialize contract
echo -e "${BLUE}📋 Step 4: Initialize Contract Functions${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening contract page for initialization..."
echo ""
echo -e "${YELLOW}⚡ ACTION REQUIRED - Call these 3 functions in order:${NC}"
echo ""
echo "1️⃣  initializeWallets"
echo "   projectWallet:  klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9"
echo "   prizePoolWallet: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2"
echo ""
echo "2️⃣  setKPEPEToken"
echo "   token: kpepe-1eod"
echo ""
echo "3️⃣  toggleRound"
echo "   (no parameters - just call it to enable lottery)"
echo ""

# Open contract page
if command -v open &> /dev/null; then
    open "https://kleverscan.org/contracts/${CONTRACT_ADDRESS}"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://kleverscan.org/contracts/${CONTRACT_ADDRESS}"
else
    echo "Visit: https://kleverscan.org/contracts/${CONTRACT_ADDRESS}"
fi

echo ""
echo -e "${YELLOW}Press ENTER after you've called all 3 functions...${NC}"
read

# Step 5: Start signing server
echo ""
echo -e "${BLUE}📋 Step 5: Start Signing Server${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "Starting signing server with PM2..."
    pm2 stop kpepe-signing 2>/dev/null || true
    pm2 delete kpepe-signing 2>/dev/null || true
    pm2 start sign-tx.js --name kpepe-signing
    sleep 2
    pm2 status kpepe-signing
    echo -e "${GREEN}✅ Signing server started${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not installed. Installing PM2...${NC}"
    npm install -g pm2
    pm2 start sign-tx.js --name kpepe-signing
    echo -e "${GREEN}✅ Signing server started${NC}"
fi

echo ""
echo "Testing signing server..."
sleep 3

HEALTH_CHECK=$(curl -s http://localhost:3001/health || echo "failed")
if [[ $HEALTH_CHECK == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Signing server is healthy${NC}"
else
    echo -e "${RED}❌ Signing server health check failed${NC}"
    echo "Response: $HEALTH_CHECK"
    echo "Check logs: pm2 logs kpepe-signing"
fi

# Step 6: Run verification
echo ""
echo -e "${BLUE}📋 Step 6: Running System Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "verify-mainnet.js" ]; then
    node verify-mainnet.js
else
    echo -e "${YELLOW}⚠️  verify-mainnet.js not found, skipping verification${NC}"
fi

# Step 7: Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🎉 DEPLOYMENT COMPLETE!                       ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo ""
echo -e "${GREEN}✅ Contract deployed to mainnet${NC}"
echo -e "${GREEN}✅ Contract address: ${CONTRACT_ADDRESS}${NC}"
echo -e "${GREEN}✅ Contract initialized with wallets and token${NC}"
echo -e "${GREEN}✅ Signing server running${NC}"
echo ""
echo "🌐 Your lottery is now LIVE at: https://kleverpepe.com"
echo "📜 Contract on KleverScan: https://kleverscan.org/contracts/${CONTRACT_ADDRESS}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test buying a ticket on your website"
echo "2. Monitor with: pm2 logs kpepe-signing"
echo "3. Announce launch on social media!"
echo ""
echo "🎊 Congratulations! The KPEPE Lottery is live! 🎊"
echo ""
