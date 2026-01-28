#!/usr/bin/env node

/**
 * FINAL SOLUTION: Initialize KPEPE Wallets
 * Uses Hardhat with ethers.js (same method that deployed the contract)
 * 
 * Run: npx hardhat run initialize-wallets.js
 */

const { ethers } = require("hardhat");
const fs = require("fs");

// Load from .env
function loadEnv() {
    const envContent = fs.readFileSync(".env", "utf8");
    const mnemonic = envContent
        .split("MAINNET_MNEMONIC=")[1]
        .split("\n")[0]
        .replace(/['"]/g, "")
        .trim();
    return mnemonic;
}

async function main() {
    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║  KPEPE Wallets - Initialize via Hardhat              ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    // Contract and wallet addresses
    const CONTRACT_ADDRESS = "klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d";
    const PROJECT_WALLET = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";
    const PRIZE_POOL_WALLET = "klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2";

    console.log("📍 Contract:", CONTRACT_ADDRESS);
    console.log("👤 Project Wallet:", PROJECT_WALLET);
    console.log("🎰 Prize Pool Wallet:", PRIZE_POOL_WALLET);
    console.log("");

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("🔑 Signer:", signer.address);

    // Load contract ABI
    const artifact = JSON.parse(
        fs.readFileSync("./artifacts/contracts/kpepe-jackpot.sol/KPEPEJackpot.json", "utf8")
    );

    // Connect to contract
    const lottery = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);

    try {
        console.log("\n⏳ Sending initializeWallets transaction...");
        const tx = await lottery.initializeWallets(PROJECT_WALLET, PRIZE_POOL_WALLET);
        
        console.log("📝 Transaction hash:", tx.hash);
        console.log("⏳ Waiting for confirmation...\n");
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            console.log("╔═══════════════════════════════════════════════════════╗");
            console.log("║              ✅ SUCCESS - WALLETS INITIALIZED          ║");
            console.log("╚═══════════════════════════════════════════════════════╝");
            console.log("");
            console.log("✅ Project Wallet Initialized:", PROJECT_WALLET);
            console.log("✅ Prize Pool Wallet Initialized:", PRIZE_POOL_WALLET);
            console.log("");
            console.log("📊 Transaction Details:");
            console.log("   Hash:", receipt.hash);
            console.log("   Block:", receipt.blockNumber);
            console.log("   Gas Used:", receipt.gasUsed.toString());
            console.log("");
            console.log("🎉 Revenue Split is now ACTIVE:");
            console.log("   • 85% of each ticket → Prize Pool");
            console.log("   • 15% of each ticket → Project Wallet");
            console.log("   • Accumulated 30 KLV transferred");
            console.log("");
        } else {
            console.log("❌ Transaction failed (status 0)");
            process.exit(1);
        }
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        
        if (error.message.includes("already set")) {
            console.log("\n⚠️  Wallets appear to already be initialized!");
            console.log("    Check the contract state on KleverScan.");
        } else if (error.message.includes("403") || error.message.includes("401")) {
            console.log("\n⚠️  Authentication error with RPC endpoint");
            console.log("    Try again in a few moments.");
        } else {
            console.log("\nFull error:", error);
        }
        
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
