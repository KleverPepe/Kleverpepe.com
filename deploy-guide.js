// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * KPEPE Jackpot Lottery - KleverChain Smart Contract
 * 
 * PROJECT WALLET (HARDCODED):
 * klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
 * 
 * CONTRACT DEPLOYMENT GUIDE
 * 
 * 1. Deploy to KleverChain mainnet/testnet
 * 2. Start accepting tickets
 * 3. 15% of all tickets go to this wallet
 */
 * TICKET FLOW:
 * ===========================================
 * Player sends 1000 KLV
 *   ├── 850 KLV (85%) → Prize Pool
 *   └── 150 KLV (15%) → Project Wallet
 * 
 * When draw happens:
 *   - Prize pool distributed to winners
 *   - ~21% stays in pool for future draws
 *   - Pool grows over time!
 * 
 * ===========================================
 * PRIZE TIERS (from Pool):
 * ===========================================
 * Tier 1: 5+8B (JACKPOT)    → 40% of pool
 * Tier 2: 5 numbers         → 15% of pool
 * Tier 3: 4 + 8B            → 10% of pool
 * Tier 4: 4 numbers         → 6% of pool
 * Tier 5: 3 + 8B            → 4% of pool
 * Tier 6: 3 numbers         → 2% of pool
 * Tier 7: 2 + 8B            → 1% of pool
 * Tier 8: 1 + 8B            → 0.5% of pool
 * Tier 9: 8B only           → 0.25% of pool
 * 
 * ===========================================
 * OWNER FUNCTIONS:
 * ===========================================
 * - startDraw()     : Begin draw process
 * - completeDraw()  : Generate winners & distribute prizes
 * - setProjectWallet(): Change project wallet address
 * - toggleRound()   : Pause/resume ticket sales
 * - emergencyWithdrawAll() : Emergency fund withdrawal
 * 
 * ===========================================
 * PLAYER FUNCTIONS:
 * ===========================================
 * - buyTicket(nums[5], 8ball) : Buy with specific numbers
 * - quickPick()               : Buy with random numbers
 * - claimPrize(ticketId)      : Claim prize after draw
 */

import "./KPEPEJackpot.sol";

/**
 * Deployment Script
 * Run with: npx hardhat run deploy.js --network klever
 */

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying KPEPE Jackpot with account:", deployer.address);
    
    // Project wallet address - HARDCODED IN CONTRACT
    const projectWallet = "0x19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9"; // klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
    
    // Deploy contract (no parameters needed - wallet is hardcoded)
    const KPEPEJackpot = await ethers.getContractFactory("KPEPEJackpot");
    const lottery = await KPEPEJackpot.deploy();
    
    console.log("KPEPE Jackpot deployed to:", lottery.address);
    console.log("Project wallet: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9");
    
    // Verify on KleverScan
    console.log("\nTo verify on KleverScan:");
    console.log(`npx hardhat verify --network klever ${lottery.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/**
 * Frontend Integration Example (JavaScript)
 */

// Contract address after deployment
const CONTRACT_ADDRESS = "0x..."; // Replace with deployed address

// ABI for frontend
const CONTRACT_ABI = [
    "function buyTicket(uint8[5] memory _mainNumbers, uint8 _eightBall) payable",
    "function quickPick() payable",
    "function claimPrize(uint256 ticketId)",
    "function getTicket(uint256 ticketId) view returns (address, uint8[5], uint8, uint256, bool, bool)",
    "function checkTicketResult(uint256 ticketId) view returns (uint8 tier, uint256 prize)",
    "function prizePool() view returns (uint256)",
    "function tickets(uint256) view returns (address, uint8[5], uint8, uint256, bool, bool)",
    "event TicketPurchased(uint256 indexed ticketId, address indexed player, uint8[5] mainNumbers, uint8 eightBall)",
    "event PrizeDistributed(address indexed player, uint256 indexed ticketId, uint8 tier, uint256 amount)"
];

/**
 * How to Buy a Ticket (Frontend)
 */
async function buyTicket(web3, mainNumbers, eightBall) {
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    // Convert to proper format
    const numbers = mainNumbers.map(n => parseInt(n));
    
    await contract.methods.buyTicket(numbers, parseInt(eightBall))
        .send({
            from: web3.eth.defaultAccount,
            value: 1000 * 1e8 // 1000 KLV in smallest units
        });
}

/**
 * How to Quick Pick (Frontend)
 */
async function quickPick(web3) {
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    await contract.methods.quickPick()
        .send({
            from: web3.eth.defaultAccount,
            value: 1000 * 1e8
        });
}

/**
 * How to Check Results (Frontend)
 */
async function checkResults(web3, ticketId) {
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    const [tier, prize] = await contract.methods.checkTicketResult(ticketId).call();
    
    const tierNames = [
        "No Win",
        "🎰 JACKPOT (5+8B)",
        "🥇 Match 5",
        "🥈 Match 4 + 8B",
        "🥉 Match 4",
        "🎯 Match 3 + 8B",
        "🎯 Match 3",
        "🎯 Match 2 + 8B",
        "🎯 Match 1 + 8B",
        "🎱 8B Only"
    ];
    
    console.log(`Tier: ${tierNames[tier]}`);
    console.log(`Prize: ${prize / 1e8} KLV`);
}
