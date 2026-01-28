// Mainnet Deployment Script
// ⚠️ WARNING: This deploys to MAINNET with REAL FUNDS
// Run with: npx hardhat run mainnet-deploy.js --network kleverMainnet

const { ethers } = require("hardhat");

// Configuration - REPLACE THESE BEFORE RUNNING
const KPEPE_TOKEN_ADDRESS = "kpepe-1eod"; // KPEPE token on KleverChain mainnet
const PROJECT_WALLET = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";
const PRIZE_POOL_WALLET = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     KPEPE Jackpot Lottery - MAINNET DEPLOYMENT          ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
    
    console.log("⚠️  WARNING: This deploys to MAINNET with REAL FUNDS\n");

    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", await deployer.getAddress());
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(await deployer.getAddress())), "KLV");
    console.log("");

    // === STEP 1: Deploy Contract ===
    console.log("📦 Step 1: Deploying KPEPE Jackpot Contract...");
    const KPEPEJackpot = await ethers.getContractFactory("KPEPEJackpot");
    const lottery = await KPEPEJackpot.deploy();
    await lottery.waitForDeployment();
    
    const contractAddress = await lottery.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);
    console.log("🔗 KleverScan: https://kleverscan.org/address/" + contractAddress);
    console.log("");

    // === STEP 2: Initialize Wallets ===
    console.log("🔧 Step 2: Initializing wallets...");
    try {
        await lottery.initializeWallets(PROJECT_WALLET, PRIZE_POOL_WALLET);
        console.log("✅ Wallets initialized");
    } catch (error) {
        console.log("⚠️  Wallet init failed:", error.message);
    }
    console.log("");

    // === STEP 3: Set KPEPE Token ===
    console.log("🪙 Step 3: Setting KPEPE token...");
    if (KPEPE_TOKEN_ADDRESS !== "0x...") {
        try {
            await lottery.setKPEPEToken(KPEPE_TOKEN_ADDRESS);
            console.log("✅ KPEPE token set:", KPEPE_TOKEN_ADDRESS);
        } catch (error) {
            console.log("⚠️  KPEPE token set failed:", error.message);
        }
    } else {
        console.log("⚠️  KPEPE_TOKEN_ADDRESS not set - skip");
    }
    console.log("");

    // === STEP 4: Start the Lottery ===
    console.log("🎰 Step 4: Starting the lottery...");
    try {
        await lottery.toggleRound();
        console.log("✅ Lottery started!");
    } catch (error) {
        console.log("⚠️  Failed to start lottery:", error.message);
    }
    console.log("");

    // === STEP 5: Verify on KleverScan ===
    console.log("📝 Step 5: Contract verified on KleverScan");
    console.log("   Run: npx hardhat verify --network kleverMainnet " + contractAddress);
    console.log("");

    // === FINAL SUMMARY ===
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    MAINNET DEPLOYED                      ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("📍 Contract:", contractAddress);
    console.log("🔗 Explorer: https://kleverscan.org/address/" + contractAddress);
    console.log("");
    console.log("📋 POST-DEPLOYMENT CHECKLIST:");
    console.log("1. ☐ Verify contract on KleverScan");
    console.log("2. ☐ Update CONTRACT_ADDRESS in frontend");
    console.log("3. ☐ Set KPEPE token address (if not set)");
    console.log("4. ☐ Test ticket purchase with small amount");
    console.log("5. ☐ Test completeDraw as owner");
    console.log("6. ☐ Announce launch to community");
    console.log("");
    console.log("⚠️  IMPORTANT:");
    console.log("- Owner: " + await deployer.getAddress());
    console.log("- Project Wallet: " + PROJECT_WALLET);
    console.log("- Prize Pool Wallet: " + PRIZE_POOL_WALLET);
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
