/**
 * KPEPE Jackpot - Test Ticket Purchase
 * Tests buying a lottery ticket on the deployed contract
 */

const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║          KPEPE JACKPOT - TEST TICKET PURCHASE              ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    // Get signer
    const [deployer, buyer] = await ethers.getSigners();
    
    console.log("👤 Buyer:", await buyer.getAddress());
    console.log("💰 Buyer Balance:", ethers.formatEther(await ethers.provider.getBalance(await buyer.getAddress())), "KLV");
    console.log("");

    // Contract address from previous deployment
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    // Load full ABI
    const artifactPath = "./artifacts/contracts/kpepe-jackpot.sol/KPEPEJackpot.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    const lottery = new ethers.Contract(CONTRACT_ADDRESS, abi, buyer);

    // Step 1: Buy a ticket
    console.log("🎫 Step 1: Buying a lottery ticket...");
    try {
        // Sample numbers: [5, 15, 25, 35, 45], Eight Ball: 10
        const numbers = [5, 15, 25, 35, 45];
        const eightBall = 10;
        
        // Use a fixed amount for testing (1 KLV)
        const ticketPrice = ethers.parseEther("1");
        
        console.log("   Numbers:", numbers.join(", "));
        console.log("   Eight Ball:", eightBall);
        console.log("   Price:", ethers.formatEther(ticketPrice), "KLV");
        
        const tx = await lottery.buyTicket(numbers, eightBall, { 
            value: ticketPrice 
        });
        
        console.log("✅ Transaction sent:", tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
        console.log("");
    } catch (error) {
        console.log("❌ Failed to buy ticket:", error.message);
        console.log("");
    }

    // Step 2: Check ticket details
    console.log("🎟️  Step 2: Checking purchased ticket details...");
    try {
        // Try to get ticket information
        const userTickets = await lottery.getUserTickets(await buyer.getAddress());
        console.log("✅ Total tickets for buyer:", userTickets.length);
        
        if (userTickets.length > 0) {
            const lastTicket = userTickets[userTickets.length - 1];
            console.log("   Last ticket ID:", lastTicket.toString());
        }
        console.log("");
    } catch (error) {
        console.log("⚠️  Could not retrieve ticket details:", error.message);
        console.log("");
    }

    // Summary
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                  TEST COMPLETED                            ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log("✅ Ticket purchase test completed!");
    console.log("");
    console.log("📝 Next Steps:");
    console.log("1. Check KleverScan to verify the transaction");
    console.log("2. Test multiple ticket purchases");
    console.log("3. Test the drawing mechanism");
    console.log("4. Verify prize payouts");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
