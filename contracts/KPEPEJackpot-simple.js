// KPEPE Jackpot Lottery - ES5 Compatible for KleverChain KVM
// Path B: Contract manages funds, 15% to project, 85% to pool
// 20% rollover after prize distribution

function KPEPEJackpot(blockchain, initParams) {
    this.blockchain = blockchain;
    
    // Constants
    this.TICKET_PRICE = 10000000000; // 100 KLV
    this.PROJECT_FEE = 15; // 15% to project wallet
    this.POOL_ALLOCATION = 85; // 85% to prize pool
    
    // Storage
    this.storage = {
        owner: blockchain.caller,
        projectWallet: initParams.projectWallet || '',
        prizePool: 0,
        nextDrawRollover: 0,
        withdrawnFromPool: 0,
        totalTickets: 0,
        tickets: [],
        winningNumbers: [],
        lastDrawTime: blockchain.timestamp,
        drawNumber: 0
    };
}

// Buy ticket
KPEPEJackpot.prototype.buyTicket = function(numbers) {
    if (this.blockchain.value < this.TICKET_PRICE) {
        throw new Error("Insufficient payment");
    }
    
    // 15% to project wallet
    var projectAmount = Math.floor(this.blockchain.value * this.PROJECT_FEE / 100);
    this.blockchain.transfer(this.storage.projectWallet, projectAmount);
    
    // 85% to prize pool
    var poolAmount = this.blockchain.value - projectAmount;
    this.storage.prizePool += poolAmount;
    
    // Store ticket
    this.storage.tickets.push({
        player: this.blockchain.caller,
        numbers: numbers,
        timestamp: this.blockchain.timestamp
    });
    
    this.storage.totalTickets++;
    
    return this.storage.totalTickets;
};

// Complete draw with 20% rollover
KPEPEJackpot.prototype.completeDraw = function() {
    if (this.blockchain.caller !== this.storage.owner) {
        throw new Error("Only owner can complete draw");
    }
    
    // Generate winning numbers (simplified)
    var seed = this.blockchain.timestamp + this.storage.totalTickets;
    this.storage.winningNumbers = [
        (seed % 50) + 1,
        ((seed * 2) % 50) + 1,
        ((seed * 3) % 50) + 1,
        ((seed * 4) % 50) + 1,
        ((seed * 5) % 50) + 1
    ];
    
    // Distribute prizes (simplified - 50% of pool)
    var prizeAmount = Math.floor(this.storage.prizePool * 0.5);
    
    // After prizes, apply 20% rollover
    var remainingPool = this.storage.prizePool - prizeAmount;
    var rolloverAmount = Math.floor(remainingPool * 0.20); // 20% rolls over
    var withdrawnAmount = remainingPool - rolloverAmount;   // 80% withdrawn
    
    // Track amounts
    this.storage.withdrawnFromPool = withdrawnAmount;
    this.storage.nextDrawRollover = rolloverAmount;
    
    // Reset pool with rollover for next draw
    this.storage.prizePool = rolloverAmount;
    
    // Clear tickets
    this.storage.tickets = [];
    this.storage.drawNumber++;
    this.storage.lastDrawTime = this.blockchain.timestamp;
    
    return {
        drawNumber: this.storage.drawNumber,
        winningNumbers: this.storage.winningNumbers,
        rollover: rolloverAmount
    };
};

// Get prize pool
KPEPEJackpot.prototype.getPrizePool = function() {
    return this.storage.prizePool;
};

// Get rollover info
KPEPEJackpot.prototype.getRolloverInfo = function() {
    return {
        nextDrawRollover: this.storage.nextDrawRollover,
        withdrawnFromPool: this.storage.withdrawnFromPool
    };
};

// Get ticket count
KPEPEJackpot.prototype.getTicketCount = function() {
    return this.storage.totalTickets;
};
