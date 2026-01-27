// Testnet Deployment and Testing Script
// Run with: npx hardhat run testnet-deploy.js --network kleverTestnet

const { ethers } = require("hardhat");

// Configuration
const KPEPE_TOKEN_ID = "KPEPE-1EOD"; // Token identifier on KleverChain
const KPEPE_TOKEN_DECIMALS = 8;

// KLV Format addresses (will be converted to hex)
const PROJECT_WALLET_KLV = "klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9";
const PRIZE_POOL_WALLET_KLV = "klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2";

// Helper: Convert KLV address to hex (simplified - in production use proper conversion)
function klvToHex(klvAddress) {
    // This is a placeholder - actual conversion requires Klever SDK
    // For testnet, you can use the hex address directly if you have it
    return ethers.getAddress("0x0000000000000000000000000000000000000000"); // Replace with actual hex
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     KPEPE Jackpot Lottery - Testnet Deployment & Testing  ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    const [deployer, player1, player2, player3] = await ethers.getSigners();
    
    console.log("👤 Deployer:", deployer.address);
    console.log("👤 Player 1:", player1.address);
    console.log("👤 Player 2:", player2.address);
    console.log("👤 Player 3:", player3.address);
    console.log("");

    // === STEP 1: Deploy Contract ===
    console.log("📦 Step 1: Deploying KPEPE Jackpot Contract...");
    const KPEPEJackpot = await ethers.getContractFactory("KPEPEJackpot");
    const lottery = await KPEPEJackpot.deploy();
    await lottery.waitForDeployment();
    
    const contractAddress = await lottery.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);
    console.log("📝 KLEVERSCAN: https://testnet.kleverscan.org/address/" + contractAddress);
    console.log("");

    // === STEP 2: Setup Wallets ===
    console.log("🔧 Step 2: Setting up wallets...");
    
    // Note: In production, convert KLV addresses to hex
    // For testing, we'll use the deployer as project wallet
    const projectWallet = deployer.address;
    const prizePoolWallet = deployer.address;
    
    try {
        await lottery.initializeWallets(projectWallet, prizePoolWallet);
        console.log("✅ Wallets initialized");
    } catch (error) {
        console.log("⚠️  Wallet initialization failed:", error.message);
    }
    console.log("");

    // === STEP 3: Set KPEPE Token ===
    console.log("🪙 Step 3: Setting KPEPE token...");
    // Note: Replace with actual KPEPE token address on testnet
    const kpepeTokenAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual address
    try {
        await lottery.setKPEPEToken(kpepeTokenAddress);
        console.log("✅ KPEPE token set");
    } catch (error) {
        console.log("⚠️  KPEPE token set failed:", error.message);
    }
    console.log("");

    // === STEP 4: Test Ticket Purchase ===
    console.log("🎫 Step 4: Testing ticket purchase...");
    
    const ticketPrice = await lottery.TICKET_PRICE();
    console.log("💰 Ticket price:", ethers.formatUnits(ticketPrice, 8), "KLV");

    // Player 1 buys a ticket
    const nums1 = [5, 12, 23, 34, 45];
    const eb1 = 8;
    try {
        const tx1 = await lottery.connect(player1).buyTicket(nums1, eb1, {
            value: ticketPrice
        });
        await tx1.wait();
        console.log("✅ Player 1 bought ticket:", nums1.join(", "), "+ 8B:", eb1);
    } catch (error) {
        console.log("❌ Player 1 ticket failed:", error.message);
    }

    // Player 2 quick pick
    try {
        const tx2 = await lottery.connect(player2).quickPick({
            value: ticketPrice
        });
        await tx2.wait();
        console.log("✅ Player 2 bought quick pick ticket");
    } catch (error) {
        console.log("❌ Player 2 quick pick failed:", error.message);
    }

    // Player 3 buys ticket
    const nums3 = [1, 2, 3, 4, 5];
    const eb3 = 1;
    try {
        const tx3 = await lottery.connect(player3).buyTicket(nums3, eb3, {
            value: ticketPrice
        });
        await tx3.wait();
        console.log("✅ Player 3 bought ticket:", nums3.join(", "), "+ 8B:", eb3);
    } catch (error) {
        console.log("❌ Player 3 ticket failed:", error.message);
    }

    const totalTickets = await lottery.totalTicketsSold();
    const poolBalance = await lottery.getPoolBalance();
    console.log("\n📊 Total tickets:", totalTickets.toString());
    console.log("💰 Pool balance:", ethers.formatUnits(poolBalance, 8), "KLV");
    console.log("");

    // === STEP 5: Test Invalid Purchases ===
    console.log("🚫 Step 5: Testing invalid purchases (should revert)...");
    
    // Wrong price
    try {
        await lottery.connect(player1).buyTicket([10, 20, 30, 40, 50], 5, { value: ticketPrice / 2n });
        console.log("❌ Wrong price accepted - BUG!");
    } catch (e) {
        console.log("✅ Wrong price rejected:", e.message.split("\n")[0]);
    }

    // Duplicate numbers
    try {
        await lottery.connect(player1).buyTicket([5, 5, 5, 5, 5], 10, { value: ticketPrice });
        console.log("❌ Duplicate numbers accepted - BUG!");
    } catch (e) {
        console.log("✅ Duplicate numbers rejected:", e.message.split("\n")[0]);
    }

    // Invalid 8-ball
    try {
        await lottery.connect(player1).buyTicket([10, 20, 30, 40, 50], 25, { value: ticketPrice });
        console.log("❌ Invalid 8-ball accepted - BUG!");
    } catch (e) {
        console.log("✅ Invalid 8-ball rejected:", e.message.split("\n")[0]);
    }
    console.log("");

    // === STEP 6: Test Draw ===
    console.log("🎲 Step 6: Testing draw process...");
    
    // Start draw
    try {
        const startTx = await lottery.startDraw();
        await startTx.wait();
        console.log("✅ Draw started");
    } catch (error) {
        console.log("❌ Start draw failed:", error.message);
    }

    // Complete draw (only owner)
    try {
        const completeTx = await lottery.completeDraw();
        await completeTx.wait();
        console.log("✅ Draw completed");
        
        const winningNumbers = await lottery.winningNumbers();
        const winning8B = await lottery.winningEightBall();
        console.log("🎰 Winning numbers:", winningNumbers.join(", "));
        console.log("🎱 Winning 8-Ball:", winning8B.toString());
    } catch (error) {
        console.log("❌ Complete draw failed:", error.message);
    }
    console.log("");

    // === STEP 7: Check Winners ===
    console.log("🏆 Step 7: Checking winners...");
    
    const ticketCount = await lottery.tickets.length;
    for (let i = 0; i < ticketCount; i++) {
        const ticket = await lottery.getTicket(i);
        try {
            const [tier, prize] = await lottery.connect(ticket[0]).checkTicketResult(i);
            if (tier > 0) {
                console.log(`Ticket #${i} (${ticket[0].slice(0,6)}...${ticket[0].slice(-4)}): Tier ${tier}, Prize ${ethers.formatUnits(prize, 8)} KLV`);
            }
        } catch (e) {
            // Different player checking - skip
        }
    }
    console.log("");

    // === STEP 8: Test Prize Claim ===
    console.log("💎 Step 8: Testing prize claim...");
    
    for (let i = 0; i < ticketCount; i++) {
        const ticket = await lottery.getTicket(i);
        if (ticket[4]) { // hasWon
            try {
                const claimTx = await lottery.connect(ticket[0]).claimPrize(i);
                await claimTx.wait();
                console.log(`✅ Player ${ticket[0].slice(0,6)}... claimed prize for ticket #${i}`);
            } catch (error) {
                console.log(`❌ Claim failed for ticket #${i}:`, error.message.split("\n")[0]);
            }
        }
    }
    console.log("");

    // === STEP 9: Test Owner Functions ===
    console.log("👑 Step 9: Testing owner functions...");
    
    // Toggle round
    try {
        await lottery.toggleRound();
        const roundActive = await lottery.roundActive();
        console.log("✅ Toggle round - Round active:", roundActive);
        await lottery.toggleRound(); // Toggle back
    } catch (error) {
        console.log("❌ Toggle round failed:", error.message);
    }

    // Withdraw pool (max 10%)
    try {
        const pool = await lottery.getPoolBalance();
        const maxWithdraw = pool * 10n / 100n;
        const withdrawTx = await lottery.withdrawPrizePool(maxWithdraw);
        await withdrawTx.wait();
        console.log("✅ Withdrew", ethers.formatUnits(maxWithdraw, 8), "KLV from pool (10% max)");
    } catch (error) {
        console.log("❌ Withdraw failed:", error.message.split("\n")[0]);
    }
    console.log("");

    // === STEP 10: Security Tests ===
    console.log("🔒 Step 10: Security tests...");
    
    // Non-owner cannot complete draw
    try {
        await lottery.connect(player1).completeDraw();
        console.log("❌ Non-owner completed draw - SECURITY ISSUE!");
    } catch (e) {
        console.log("✅ Non-owner cannot complete draw (reverted)");
    }

    // Non-owner cannot set wallet
    try {
        await lottery.connect(player1).setProjectWallet(player2.address);
        console.log("❌ Non-owner set project wallet - SECURITY ISSUE!");
    } catch (e) {
        console.log("✅ Non-owner cannot set project wallet (reverted)");
    }
    console.log("");

    // === FINAL SUMMARY ===
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    DEPLOYMENT SUMMARY                      ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("📍 Contract:", contractAddress);
    console.log("🔗 Explorer: https://testnet.kleverscan.org/address/" + contractAddress);
    console.log("👤 Deployer:", deployer.address);
    console.log("💰 Final pool:", ethers.formatUnits(await lottery.getPoolBalance(), 8), "KLV");
    console.log("🎫 Total tickets:", (await lottery.totalTicketsSold()).toString());
    console.log("");
    console.log("Next steps:");
    console.log("1. Verify contract on KleverScan");
    console.log("2. Update CONTRACT_ADDRESS in frontend");
    console.log("3. Test on testnet with real KPEPE token");
    console.log("4. Deploy to mainnet");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
