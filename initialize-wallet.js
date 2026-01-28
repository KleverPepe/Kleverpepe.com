// Initialize Project Wallet using Hardhat
// Run: npx hardhat run initialize-wallet.js --network kleverMainnet

const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d";
const PROJECT_WALLET = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";

async function main() {
    console.log("\n💼 Initializing Project Wallet\n");
    console.log("Contract: " + CONTRACT_ADDRESS);
    console.log("Wallet:   " + PROJECT_WALLET);
    console.log("");

    try {
        const [owner] = await ethers.getSigners();
        console.log("✅ Connected as:", await owner.getAddress());
        console.log("");

        // Get the contract ABI
        const contractJson = require('./artifacts/contracts/kpepe-jackpot.sol/KPEPEJackpot.json');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, owner);

        console.log("📝 Calling initialize_wallets()...");
        const tx = await contract.initialize_wallets(PROJECT_WALLET);
        console.log("✅ Transaction sent!");
        console.log("   Hash: " + tx.hash);
        console.log("");

        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        
        console.log("✅ Confirmed!");
        console.log("   Block: " + receipt.blockNumber);
        console.log("   Gas used: " + receipt.gasUsed.toString());
        console.log("");

        console.log("✅ Wallet Initialized Successfully!");
        console.log("");
        console.log("✓ Future ticket sales will auto-split:");
        console.log("  - 85 KLV → Prize Pool");
        console.log("  - 15 KLV → Project Wallet");
        console.log("");
        console.log("📍 Verify: https://kleverscan.org/transaction/" + tx.hash);
        console.log("");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("");
        console.log("Troubleshooting:");
        console.log("1. Ensure you're running: npx hardhat run initialize-wallet.js --network kleverMainnet");
        console.log("2. Check hardhat.config.js has kleverMainnet network configured");
        console.log("3. Verify MNEMONIC in .env file");
        console.log("4. Ensure you have enough KLV for gas fees (~0.1 KLV)");
        console.log("");
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
