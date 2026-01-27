// Direct Mainnet Deployment - Bypasses Hardhat mnemonic issues
// ⚠️ WARNING: This deploys to MAINNET with REAL FUNDS

const { ethers } = require("ethers");
const fs = require("fs");

// Load config
const envContent = fs.readFileSync(".env", "utf8");
const mnemonic = envContent.split("MAINNET_MNEMONIC=")[1].split("\n")[0].replace(/'/g, "").trim();
const KPEPE_TOKEN_ADDRESS = envContent.split("KPEPE_TOKEN_ADDRESS=")[1].split("\n")[0].replace(/'/g, "").trim();
const PROJECT_WALLET = envContent.split("PROJECT_WALLET_HEX=")[1].split("\n")[0].replace(/'/g, "").trim();
const PRIZE_POOL_WALLET = envContent.split("PRIZE_POOL_WALLET_HEX=")[1].split("\n")[0].replace(/'/g, "").trim();

const RPC_URL = "https://klever-mainnet.rpc.thirdweb.com";

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     KPEPE Jackpot Lottery - MAINNET DEPLOYMENT          ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
    
    console.log("⚠️  WARNING: This deploys to MAINNET with REAL FUNDS\n");

    // Create wallet from mnemonic
    const wallet = ethers.HDNodeWallet.fromMnemonic(
        ethers.Mnemonic.fromPhrase(mnemonic),
        "m/44'/7278'/0'/0"
    );
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const deployer = new ethers.Wallet(wallet.privateKey, provider);
    
    console.log("👤 Deployer:", deployer.address);
    
    try {
        const balance = await provider.getBalance(deployer.address);
        console.log("💰 Balance:", ethers.formatEther(balance), "KLV\n");
    } catch(e) {
        console.log("⚠️  Could not fetch balance:", e.message);
    }

    if (parseFloat(ethers.formatEther(await provider.getBalance(deployer.address))) < 1) {
        console.log("❌ WARNING: Low balance! You need at least 1 KLV for deployment.");
    }

    // === STEP 1: Deploy Contract ===
    console.log("📦 Step 1: Deploying KPEPE Jackpot Contract...");
    
    const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/kpepe-jackpot.sol/KPEPEJackpot.json", "utf8"));
    const KPEPEJackpot = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
    
    const lottery = await KPEPEJackpot.deploy();
    await lottery.waitForDeployment();
    
    const contractAddress = await lottery.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);
    console.log("🔗 KleverScan: https://kleverscan.org/address/" + contractAddress);
    console.log("");

    // === STEP 2: Initialize Wallets ===
    console.log("🔧 Step 2: Initializing wallets...");
    try {
        const tx = await lottery.initializeWallets(PROJECT_WALLET, PRIZE_POOL_WALLET);
        await tx.wait();
        console.log("✅ Wallets initialized");
        console.log("   Project Wallet:", PROJECT_WALLET);
        console.log("   Prize Pool Wallet:", PRIZE_POOL_WALLET);
    } catch (error) {
        console.log("⚠️  Wallet init failed:", error.message.slice(0, 100));
    }
    console.log("");

    // === STEP 3: Set KPEPE Token ===
    console.log("🪙 Step 3: Setting KPEPE token...");
    if (KPEPE_TOKEN_ADDRESS && KPEPE_TOKEN_ADDRESS !== "0x..." && KPEPE_TOKEN_ADDRESS.length === 42) {
        try {
            const tx = await lottery.setKPEPEToken(KPEPE_TOKEN_ADDRESS);
            await tx.wait();
            console.log("✅ KPEPE token set:", KPEPE_TOKEN_ADDRESS);
        } catch (error) {
            console.log("⚠️  KPEPE token set failed:", error.message.slice(0, 100));
        }
    } else {
        console.log("⚠️  KPEPE_TOKEN_ADDRESS not configured - skip");
    }
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
    console.log("3. ☐ Set KPEPE token address (if not set above)");
    console.log("4. ☐ Test ticket purchase with small amount");
    console.log("5. ☐ Test completeDraw as owner");
    console.log("6. ☐ Announce launch to community");
    console.log("");
    console.log("⚠️  IMPORTANT:");
    console.log("- Owner (deployer):", deployer.address);
    console.log("- Project Wallet:", PROJECT_WALLET);
    console.log("- Prize Pool Wallet:", PRIZE_POOL_WALLET);
    console.log("");
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer.address,
        projectWallet: PROJECT_WALLET,
        prizePoolWallet: PRIZE_POOL_WALLET,
        kpepeToken: KPEPE_TOKEN_ADDRESS,
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync("DEPLOYMENT.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to DEPLOYMENT.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Fatal error:", error.message);
        process.exit(1);
    });
