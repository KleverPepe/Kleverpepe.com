#!/usr/bin/env node

/**
 * Initialize Wallets on Existing Contract
 * Uses ThirdWeb RPC (which actually works!)
 * 
 * This is the SAME approach that successfully deployed the contract
 */

const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

// Contract details
const CONTRACT_ADDRESS = "klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d";
const PROJECT_WALLET = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";

// IMPORTANT: This is the RPC that actually works (used for contract deployment)
const RPC_URL = "https://klever-mainnet.rpc.thirdweb.com";

// Minimal ABI for initialize_wallets function
const ABI = [
    {
        "type": "function",
        "name": "initialize_wallets",
        "inputs": [
            { "name": "project_wallet", "type": "address" },
            { "name": "prize_pool_wallet", "type": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "project_wallet",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view"
    }
];

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Initialize Wallets - ThirdWeb RPC                    ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    const mnemonic = process.env.MAINNET_MNEMONIC;
    if (!mnemonic) {
        console.error("❌ MAINNET_MNEMONIC not found in .env");
        process.exit(1);
    }

    try {
        // Step 1: Create wallet from mnemonic
        console.log("🔑 Setting up account from mnemonic...");
        const wallet = ethers.HDNodeWallet.fromMnemonic(
            ethers.Mnemonic.fromPhrase(mnemonic),
            "m/44'/7278'/0'/0"
        );
        console.log("   ✅ Account: " + wallet.address);
        console.log("");

        // Step 2: Connect to RPC
        console.log("🔗 Connecting to Klever mainnet...");
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);

        console.log("   ✅ Provider: " + RPC_URL);
        console.log("   ✅ Signer: " + signer.address);
        console.log("");

        // Step 3: Get balance
        console.log("💰 Checking balance...");
        const balance = await provider.getBalance(signer.address);
        const balanceKLV = ethers.formatEther(balance);
        console.log("   Balance: " + balanceKLV + " KLV");
        
        if (parseFloat(balanceKLV) < 0.1) {
            console.log("   ⚠️  Low balance! You need at least 0.1 KLV for gas");
        }
        console.log("");

        // Step 4: Connect to contract
        console.log("📝 Connecting to contract...");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        console.log("   ✅ Contract: " + CONTRACT_ADDRESS);
        console.log("");

        // Step 5: Check current state
        console.log("🔍 Checking current state...");
        try {
            const currentWallet = await contract.project_wallet();
            console.log("   Current project wallet: " + currentWallet);
            
            if (currentWallet === "0x0000000000000000000000000000000000000000") {
                console.log("   ⚠️  Not initialized yet - proceeding...");
            } else {
                console.log("   ✅ Already initialized!");
                console.log("");
                console.log("🎉 No action needed - wallets already initialized!");
                return;
            }
        } catch (error) {
            console.log("   ⚠️  Could not check state (will attempt initialization): " + error.message.slice(0, 50));
        }
        console.log("");

        // Step 6: Call initialize_wallets
        console.log("🔧 Calling initialize_wallets...");
        console.log("   Function: initialize_wallets");
        console.log("   Project Wallet: " + PROJECT_WALLET);
        console.log("   Prize Pool Wallet: " + PROJECT_WALLET);
        console.log("");

        console.log("⏳ Submitting transaction...");
        const tx = await contract.initialize_wallets(PROJECT_WALLET, PROJECT_WALLET);
        console.log("   Transaction hash: " + tx.hash);
        console.log("");

        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        
        if (receipt && receipt.status === 1) {
            console.log("✅ Transaction confirmed!");
            console.log("   Block: " + receipt.blockNumber);
            console.log("   Gas used: " + receipt.gasUsed.toString());
            console.log("");

            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║              ✅ INITIALIZATION COMPLETE                    ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("");
            console.log("📊 Summary:");
            console.log("   Contract: " + CONTRACT_ADDRESS);
            console.log("   Project Wallet: " + PROJECT_WALLET);
            console.log("   Status: ✅ INITIALIZED");
            console.log("");
            
            console.log("🎉 Revenue split is now ACTIVE!");
            console.log("   • 85% of each ticket → Prize Pool");
            console.log("   • 15% of each ticket → Project Wallet");
            console.log("");
            
            console.log("🔗 View transaction:");
            console.log("   https://kleverscan.org/transaction/" + tx.hash);
            console.log("");
            
        } else {
            console.log("❌ Transaction failed or reverted");
            if (receipt) {
                console.log("   Block: " + receipt.blockNumber);
                console.log("   Status: " + receipt.status);
            }
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error("");
        
        if (error.code === "ENOTFOUND") {
            console.error("Network error - cannot reach RPC endpoint");
        } else if (error.code === "ERR_UNKNOWN_PROTOCOL") {
            console.error("Connection error - check RPC URL");
        } else if (error.message.includes("invalid solidity address")) {
            console.error("Invalid wallet address format");
        }
        
        process.exit(1);
    }
}

main();
