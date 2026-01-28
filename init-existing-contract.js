#!/usr/bin/env node

/**
 * Initialize Wallets on Existing Deployed Contract
 * Uses ethers.js with Hardhat to call initialize_wallets on deployed contract
 */

const { ethers } = require("hardhat");
require("dotenv").config();

// Constants
const CONTRACT_ADDRESS = "klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d";
const PROJECT_WALLET = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";

// Minimal ABI with just the initialize_wallets function
const MINIMAL_ABI = [
    {
        "type": "function",
        "name": "initialize_wallets",
        "inputs": [
            {
                "name": "project_wallet",
                "type": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "project_wallet",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view"
    }
];

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Initialize Wallets - Existing Contract               ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    try {
        // Get the deployer (signer)
        const [deployer] = await ethers.getSigners();
        console.log("👤 Account:", await deployer.getAddress());
        console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(await deployer.getAddress())), "KLV");
        console.log("");

        // Connect to existing contract
        console.log("🔗 Connecting to contract...");
        console.log("   Address:", CONTRACT_ADDRESS);
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, deployer);
        console.log("✅ Connected");
        console.log("");

        // Check current state
        console.log("📊 Current State:");
        try {
            const currentWallet = await contract.project_wallet();
            console.log("   Project Wallet:", currentWallet);
            
            if (currentWallet === "0x0000000000000000000000000000000000000000") {
                console.log("   ⚠️  Wallet not initialized yet");
            } else {
                console.log("   ✅ Already initialized!");
                console.log("");
                console.log("🎉 No action needed - wallet already initialized!");
                return;
            }
        } catch (error) {
            console.log("   ⚠️  Could not check state:", error.message);
        }
        console.log("");

        // Call initialize_wallets
        console.log("🔧 Calling initialize_wallets...");
        console.log("   Project Wallet:", PROJECT_WALLET);
        console.log("");

        const tx = await contract.initialize_wallets(PROJECT_WALLET);
        console.log("📤 Transaction submitted:");
        console.log("   Hash:", tx.hash);
        console.log("");

        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        
        console.log("✅ Transaction confirmed!");
        console.log("   Block:", receipt.blockNumber);
        console.log("   Gas used:", receipt.gasUsed.toString());
        console.log("");

        // Verify
        console.log("🔍 Verifying initialization...");
        const newWallet = await contract.project_wallet();
        console.log("   Project Wallet is now:", newWallet);
        console.log("");

        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║              ✅ INITIALIZATION COMPLETE                    ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("");
        console.log("📍 Transaction: https://kleverscan.org/transaction/" + tx.hash);
        console.log("📍 Contract: https://kleverscan.org/address/" + CONTRACT_ADDRESS);
        console.log("");
        console.log("🎉 Revenue split now ACTIVE!");
        console.log("   - 85% → Prize Pool");
        console.log("   - 15% → Project Wallet: " + PROJECT_WALLET);
        console.log("");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error("");
        if (error.data) {
            console.error("Error data:", error.data);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
