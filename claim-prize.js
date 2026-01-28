/**
 * Prize Claim Handler for KPEPE Lottery
 * Integrates with KleverChain smart contract
 */

const CONTRACT_ADDRESS = "klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d";
const RPC = "https://node.mainnet.klever.org";

/**
 * Claim prize for a winning ticket
 * @param {number} ticketId - The ticket ID to claim prize for
 * @param {object} kleverWeb - The kleverWeb API object from extension
 */
async function claimPrize(ticketId, kleverWeb) {
  try {
    if (!kleverWeb) {
      throw new Error("Klever Extension not available");
    }

    // Create claim_prize transaction
    const tx = {
      type: 0, // Transfer type for contract interaction
      payload: {
        receiver: CONTRACT_ADDRESS,
        amount: 0, // No KLV payment required for claiming
        kda: "",
        data: ["claim_prize", ticketId.toString()],
      },
    };

    console.log("Submitting claim prize transaction:", tx);

    // Send transaction via Klever Extension
    const result = await kleverWeb.request({
      method: "sendTransaction",
      params: [tx],
    });

    if (result && result.txHash) {
      console.log("Prize claim submitted! Tx Hash:", result.txHash);
      return {
        success: true,
        txHash: result.txHash,
        message: "Prize claim submitted. Check KleverScan for confirmation.",
      };
    } else {
      throw new Error("Transaction submission failed - no hash returned");
    }
  } catch (error) {
    console.error("Error claiming prize:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get ticket details from contract
 * @param {number} ticketId - The ticket ID
 */
async function getTicketDetails(ticketId) {
  try {
    const response = await fetch(`${RPC}/query/contracts/${CONTRACT_ADDRESS}/smart-contract/${ticketId}`);
    const data = await response.json();
    console.log("Ticket details:", data);
    return data;
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    return null;
  }
}

/**
 * Check prize pool balance
 */
async function getPrizePool() {
  try {
    const response = await fetch(`${RPC}/query/contracts/${CONTRACT_ADDRESS}/smart-contract/pool`);
    const data = await response.json();
    console.log("Prize pool:", data);
    return data;
  } catch (error) {
    console.error("Error fetching prize pool:", error);
    return null;
  }
}

/**
 * Get current winning numbers
 */
async function getWinningNumbers() {
  try {
    const response = await fetch(`${RPC}/query/contracts/${CONTRACT_ADDRESS}/smart-contract/winning`);
    const data = await response.json();
    console.log("Winning numbers:", data);
    return data;
  } catch (error) {
    console.error("Error fetching winning numbers:", error);
    return null;
  }
}

/**
 * Calculate prize amount based on matches
 * @param {number} mainMatches - Number of matching main numbers (0-5)
 * @param {boolean} ebMatch - Whether Eight Ball matched
 * @param {number} poolAmount - Current prize pool in smallest unit
 */
function calculatePrize(mainMatches, ebMatch, poolAmount) {
  const prize = {
    "5-true": () => poolAmount * BigInt(40) / BigInt(100), // 40% jackpot
    "5-false": () => poolAmount * BigInt(15) / BigInt(100), // 15%
    "4-true": () => poolAmount * BigInt(8) / BigInt(100), // 8%
    "4-false": () => poolAmount * BigInt(5) / BigInt(100), // 5%
    "3-true": () => poolAmount * BigInt(6) / BigInt(100), // 6%
    "3-false": () => poolAmount * BigInt(45) / BigInt(1000), // 4.5%
    "2-true": () => poolAmount * BigInt(3) / BigInt(100), // 3%
    "1-true": () => poolAmount * BigInt(15) / BigInt(1000), // 1.5%
    "0-true": () => poolAmount * BigInt(125) / BigInt(10000), // 1.25%
  };

  const key = `${mainMatches}-${ebMatch}`;
  const calculator = prize[key];

  if (calculator) {
    return calculator();
  }

  return BigInt(0); // No prize for non-matching
}

/**
 * Count matching numbers between ticket and winning numbers
 * @param {array} ticketNums - Player's 5 numbers
 * @param {array} winningNums - Winning 5 numbers
 */
function countMatches(ticketNums, winningNums) {
  let matches = 0;
  for (let i = 0; i < ticketNums.length; i++) {
    if (winningNums.includes(ticketNums[i])) {
      matches++;
    }
  }
  return matches;
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    claimPrize,
    getTicketDetails,
    getPrizePool,
    getWinningNumbers,
    calculatePrize,
    countMatches,
    CONTRACT_ADDRESS,
    RPC,
  };
}
