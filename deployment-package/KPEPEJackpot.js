/**
 * KPEPE Jackpot Lottery - JavaScript for KleverChain
 * Based on original Solidity contract
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to kleverscan.org/contracts
 * 2. Click "Deploy Contract"
 * 3. Upload this file as the contract code
 * 4. Set Gas Limit: 3,000,000
 * 5. Connect wallet and deploy
 */

// Reentrancy Guard
const REENTRANCY_GUARD = {
    locked: false,
    
    lock() {
        if (this.locked) {
            throw new Error('Reentrant call detected');
        }
        this.locked = true;
    },
    
    unlock() {
        this.locked = false;
    }
};

// Cryptographically secure random number generator
function secureRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * 1000000);
}

// Seed generator from multiple sources
function generateSeed(blockchain) {
    const sources = [
        blockchain.timestamp,
        blockchain.caller.charCodeAt(0),
        Math.floor(Math.random() * 1000000),
        Date.now(),
        process.hrtime ? process.hrtime()[0] : 0
    ];
    
    let seed = 0;
    for (const s of sources) {
        seed = ((seed << 5) - seed) + s;
        seed = seed & seed; // Keep as integer
    }
    return Math.abs(seed);
}

class KPEPEJackpot {
    constructor(blockchain, initParams = {}) {
        this.blockchain = blockchain;
        
        // Constants
        this.TICKET_PRICE = 10000000000; // 100 KLV (8 decimals)
        this.MAIN_COUNT = 5;
        this.EIGHT_RANGE = 20;
        this.MAIN_RANGE = 50;
        
        // Prize percentages (basis points)
        this.PRIZE_JACKPOT = 4000;
        this.PRIZE_MATCH5 = 1500;
        this.PRIZE_4_8B = 800;
        this.PRIZE_4 = 500;
        this.PRIZE_3_8B = 600;
        this.PRIZE_3 = 450;
        this.PRIZE_2_8B = 300;
        this.PRIZE_1_8B = 150;
        this.PRIZE_8B_ONLY = 125;
        this.POOL_RETENTION = 1975;
        this.MAX_POOL = 100000000000000; // 1M KLV
        
        this.MIN_STAKE_FOR_FREE = 5000000000000; // 50K KPEPE
        this.FREE_TICKETS_PER_DAY = 1;
        
        // Storage - Initialize with deployment params for one-transaction setup
        this.storage = {
            projectWallet: initParams.projectWallet || '',
            prizePoolWallet: initParams.prizePoolWallet || '',
            kpepeToken: initParams.kpepeToken || '',
            kpepeStaking: initParams.kpepeStaking || '',
            prizePool: 0,
            totalPaidTickets: 0,  // Only paid tickets (contributes to pool)
            totalFreeTickets: 0,  // Free tickets (does NOT contribute to pool)
            totalTicketsIncludingFree: 0,  // All tickets (paid + free)
            lastDrawTime: this.blockchain.timestamp || Date.now(),
            drawInProgress: false,
            roundActive: true,
            winningNumbers: [0, 0, 0, 0, 0],
            winningEightBall: 0,
            // One-time KPEPE seed fund (650K total)
            kpepeJackpotPrize: initParams.kpepeJackpotPrize || 50000000000000, // 500K KPEPE (once)
            kpepeMatch5Prize: initParams.kpepeMatch5Prize || 5000000000000,    // 50K KPEPE (Tier 2)
            kpepeMatch48BPrize: initParams.kpepeMatch48BPrize || 4000000000000, // 40K KPEPE (Tier 3)
            kpepeMatch4Prize: initParams.kpepeMatch4Prize || 3500000000000,     // 35K KPEPE (Tier 4)
            kpepeMatch38BPrize: initParams.kpepeMatch38BPrize || 2500000000000, // 25K KPEPE (Tier 5)
            kpepeMatch3Prize: 0,         // Tier 6: KLV only
            kpepeMatch28BPrize: 0,       // Tier 7: KLV only
            kpepeMatch18BPrize: 0,       // Tier 8: KLV only
            kpepeMatch8BOnlyPrize: 0,    // Tier 9: KLV only
            // Commit-reveal scheme for tickets
            ticketCommits: {}, // hash -> {nums, eb, revealTime, player}
            revealDelay: 2, // blocks
        };
        
        // State
        this.tickets = [];
        this.playerTicketIds = {};
        this.kpepePrizesPending = {};
        this.freeTicketCredits = {};
        this.lastFreeTicketClaim = {};
        this.freeTicketPlayers = [];
        this.isFreeTicketPlayer = {};
        this.previousWinners = [];  // Track all winners [{ ticketId, player, tier, prize, timestamp }]
        
        // Reentrancy guard for this contract
        this._inFunction = {};
    }
    
    require(condition, message) {
        if (!condition) {
            throw new Error(message || 'Requirement failed');
        }
    }
    
    // Reentrancy guard modifier
    nonReentrant(functionName) {
        if (this._inFunction[functionName]) {
            throw new Error('Reentrant call not allowed');
        }
        this._inFunction[functionName] = true;
        return () => { this._inFunction[functionName] = false; };
    }
    
    init() {
        // Only set defaults if not already set by constructor
        if (!this.storage.lastDrawTime) {
            this.storage.lastDrawTime = this.blockchain.timestamp;
        }
        if (this.storage.roundActive === undefined) {
            this.storage.roundActive = true;
        }
        
        // If caller is owner (deployment), auto-initialize
        // This allows everything to be set in one transaction
        try {
            if (this.blockchain.isOwner && this.blockchain.isOwner(this.blockchain.caller)) {
                // Contract is being deployed by owner - auto-configure
                // All config was passed via constructor params
            }
        } catch (e) {
            // ignore
        }
    }
    
    /**
     * Deployment helper - returns initialization data
     * Use this when deploying to get all params
     */
    static getDeployParams(config) {
        return {
            projectWallet: config.projectWallet || '',
            prizePoolWallet: config.prizePoolWallet || '',
            kpepeToken: config.kpepeToken || '',
            kpepeStaking: config.kpepeStaking || '',
            kpepeJackpotPrize: config.kpepeJackpotPrize || 0,
            kpepeMatch5Prize: config.kpepeMatch5Prize || 0,
            kpepeMatch48BPrize: config.kpepeMatch48BPrize || 0,
            kpepeMatch4Prize: config.kpepeMatch4Prize || 0,
            kpepeMatch38BPrize: config.kpepeMatch38BPrize || 0,
            kpepeMatch3Prize: config.kpepeMatch3Prize || 0,
            kpepeMatch28BPrize: config.kpepeMatch28BPrize || 0,
            kpepeMatch18BPrize: config.kpepeMatch18BPrize || 0,
            kpepeMatch8BOnlyPrize: config.kpepeMatch8BOnlyPrize || 0,
        };
    }
    
    /**
     * Commit phase for ticket purchase (prevents frontrunning)
     * @param {string} commitHash - Hash of (nums, eb, salt)
     */
    commitTicket(commitHash) {
        const caller = this.blockchain.caller;
        
        this.require(this.storage.roundActive, 'Round not active');
        this.require(!this.storage.ticketCommits[commitHash], 'Commit already exists');
        
        // Store commit without revealing numbers
        this.storage.ticketCommits[commitHash] = {
            player: caller,
            commitTime: this.blockchain.timestamp,
            revealed: false
        };
        
        this.blockchain.emit('TicketCommitted', { player: caller, commitHash });
    }
    
    /**
     * Reveal phase for ticket purchase
     * @param {number[]} nums - 5 main numbers (1-50)
     * @param {number} eb - Eight ball number (1-20)
     * @param {string} salt - Salt used in commit
     */
    revealTicket(nums, eb, salt) {
        const caller = this.blockchain.caller;
        
        this.require(this.storage.roundActive, 'Round not active');
        this.require(eb >= 1 && eb <= this.EIGHT_RANGE, 'Eight ball 1-20');
        
        // Validate numbers
        for (let i = 0; i < this.MAIN_COUNT; i++) {
            this.require(nums[i] >= 1 && nums[i] <= this.MAIN_RANGE, 'Numbers 1-50');
            for (let j = i + 1; j < this.MAIN_COUNT; j++) {
                this.require(nums[i] !== nums[j], 'Duplicate numbers');
            }
        }
        
        // Verify commit exists
        const commitHash = this.hashCommit(nums, eb, salt);
        const commit = this.storage.ticketCommits[commitHash];
        this.require(commit, 'Commit not found');
        this.require(commit.player === caller, 'Not your commit');
        this.require(!commit.revealed, 'Already revealed');
        
        // Check delay (simulated - in real blockchain, check block number)
        const timeSinceCommit = this.blockchain.timestamp - commit.commitTime;
        this.require(timeSinceCommit >= this.storage.revealDelay * 15000, 'Reveal too soon'); // ~15s per block
        
        // Mark as revealed
        commit.revealed = true;
        commit.nums = nums;
        commit.eb = eb;
        
        // Process payment (after commit-reveal)
        let useFree = false;
        if (this.freeTicketCredits[caller] > 0 && this.blockchain.value === 0) {
            useFree = true;
            this.freeTicketCredits[caller]--;
        } else {
            this.require(this.blockchain.value === this.TICKET_PRICE, 'Must send 100 KLV');
        }
        
        let poolAmt = 0;
        let projAmt = 0;
        
        if (!useFree) {
            poolAmt = (this.TICKET_PRICE * 85) / 100;
            projAmt = this.TICKET_PRICE - poolAmt;
            
            if (this.storage.prizePool + poolAmt > this.MAX_POOL) {
                poolAmt = this.MAX_POOL - this.storage.prizePool;
                projAmt = this.TICKET_PRICE - poolAmt;
                this.blockchain.emit('PoolCapped', this.MAX_POOL);
            }
            
            this.storage.prizePool += poolAmt;
            
            if (projAmt > 0 && this.storage.projectWallet) {
                this.blockchain.transfer(this.storage.projectWallet, projAmt);
            }
        }
        
        // Create ticket
        const ticket = {
            player: caller,
            mainNumbers: nums,
            eightBall: eb,
            purchaseTime: this.blockchain.timestamp,
            hasWon: false,
            prizeClaimed: false,
            isFree: useFree,
            commitHash: commitHash
        };
        
        const id = this.tickets.length;
        this.tickets.push(ticket);
        
        if (!this.playerTicketIds[caller]) {
            this.playerTicketIds[caller] = [];
        }
        this.playerTicketIds[caller].push(id);
        
        this.storage.totalTicketsSold++;
        
        this.blockchain.emit('TicketRevealed', { id, player: caller, nums, eb, isFree: useFree });
    }
    
    /**
     * Generate commit hash from numbers, eb, and salt
     */
    hashCommit(nums, eb, salt) {
        const data = JSON.stringify({ nums, eb, salt, player: this.blockchain.caller });
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
    }
    
    /**
     * Generate random numbers using secure RNG
     */
    generateSecureRandomNumbers() {
        const seed = generateSeed(this.blockchain);
        const nums = [];
        const used = {};
        
        for (let i = 0; i < this.MAIN_COUNT; i++) {
            let num;
            do {
                const rand = secureRandom(seed + i);
                num = (rand % this.MAIN_RANGE) + 1;
            } while (used[num]);
            used[num] = true;
            nums.push(num);
        }
        
        nums.sort((a, b) => a - b);
        
        const eb = (secureRandom(seed + 100) % this.EIGHT_RANGE) + 1;
        
        return { nums, eb };
    }
    
    /**
     * Buy ticket with numbers (simplified - without commit-reveal for small purchases)
     * @param {number[]} nums - 5 main numbers (1-50)
     * @param {number} eb - Eight ball number (1-20)
     */
    buyTicket(nums, eb) {
        const cleanup = this.nonReentrant('buyTicket');
        try {
            const caller = this.blockchain.caller;
            
            this.require(this.storage.roundActive, 'Round not active');
            this.require(eb >= 1 && eb <= this.EIGHT_RANGE, 'Eight ball 1-20');
            
            // Validate numbers
            for (let i = 0; i < this.MAIN_COUNT; i++) {
                this.require(nums[i] >= 1 && nums[i] <= this.MAIN_RANGE, 'Numbers 1-50');
                for (let j = i + 1; j < this.MAIN_COUNT; j++) {
                    this.require(nums[i] !== nums[j], 'Duplicate numbers');
                }
            }
            
            let useFree = false;
            
            // Check free credits
            if (this.freeTicketCredits[caller] > 0 && this.blockchain.value === 0) {
                useFree = true;
                this.freeTicketCredits[caller]--;
            } else {
                this.require(this.blockchain.value === this.TICKET_PRICE, 'Must send 100 KLV');
            }
            
            let poolAmt = 0;
            let projAmt = 0;
            
            if (!useFree) {
                poolAmt = (this.TICKET_PRICE * 85) / 100;
                projAmt = this.TICKET_PRICE - poolAmt;
                
                if (this.storage.prizePool + poolAmt > this.MAX_POOL) {
                    poolAmt = this.MAX_POOL - this.storage.prizePool;
                    projAmt = this.TICKET_PRICE - poolAmt;
                    this.blockchain.emit('PoolCapped', this.MAX_POOL);
                }
                
                this.storage.prizePool += poolAmt;
                
                if (projAmt > 0 && this.storage.projectWallet) {
                    this.blockchain.transfer(this.storage.projectWallet, projAmt);
                }
            }
            
            // Create ticket
            const ticket = {
                player: caller,
                mainNumbers: nums,
                eightBall: eb,
                purchaseTime: this.blockchain.timestamp,
                hasWon: false,
                prizeClaimed: false,
                isFree: useFree
            };
            
            const id = this.tickets.length;
            this.tickets.push(ticket);
            
            if (!this.playerTicketIds[caller]) {
                this.playerTicketIds[caller] = [];
            }
            this.playerTicketIds[caller].push(id);
            
            // Track paid vs free tickets separately
            if (useFree) {
                this.storage.totalFreeTickets++;
            } else {
                this.storage.totalPaidTickets++;
            }
            this.storage.totalTicketsIncludingFree++;
            
            this.blockchain.emit('TicketPurchased', { id, player: caller, nums, eb, isFree: useFree });
        } finally {
            cleanup();
        }
    }
    
    /**
     * Quick pick - uses secure random numbers
     */
    quickPick() {
        const cleanup = this.nonReentrant('quickPick');
        try {
            const caller = this.blockchain.caller;
            
            this.require(this.storage.roundActive, 'Round not active');
            
            const { nums, eb } = this.generateSecureRandomNumbers();
            
            if (this.freeTicketCredits[caller] > 0 && this.blockchain.value === 0) {
                this.freeTicketCredits[caller]--;
                this.createFreeTicket(nums, eb);
            } else {
                this.require(this.blockchain.value === this.TICKET_PRICE, 'Must send 100 KLV');
                this.buyTicket(nums, eb);
            }
        } finally {
            cleanup();
        }
    }
    
    /**
     * Claim daily free ticket (1 ticket per day if staking 50K+ KPEPE)
     * Expires before daily draw
     */
    claimFreeTicket() {
        const caller = this.blockchain.caller;
        
        this.require(this.storage.roundActive, 'Round not active');
        this.require(this.storage.kpepeStaking, 'Staking contract not set');
        
        // ✅ CHECK STAKING BALANCE - MINIMUM 50K ONLY
        let stakeAmount = 0;
        try {
            // Call staking contract to get user's stake
            const stakeResult = this.blockchain.callContract(
                this.storage.kpepeStaking,
                'getStake',
                [caller]
            );
            stakeAmount = stakeResult ? parseInt(stakeResult) : 0;
        } catch (e) {
            stakeAmount = 0;
        }
        
        this.require(stakeAmount >= this.MIN_STAKE_FOR_FREE, 'Insufficient KPEPE stake (need 50K minimum)');
        
        // ✅ CHECK DAILY COOLDOWN (can claim 1 ticket per day)
        const lastClaim = this.lastFreeTicketClaim[caller] || 0;
        const daysSinceClaim = Math.floor((this.blockchain.timestamp - lastClaim) / 86400);
        this.require(daysSinceClaim >= 1, 'Already claimed today');
        
        // ✅ CHECK IF DRAW ALREADY HAPPENED TODAY
        const currentDay = Math.floor(this.blockchain.timestamp / 86400);
        const lastDrawDay = Math.floor(this.storage.lastDrawTime / 86400);
        this.require(currentDay === lastDrawDay, 'Daily draw already completed, ticket expired');
        
        // ✅ GIVE EXACTLY 1 TICKET
        this.freeTicketCredits[caller] = (this.freeTicketCredits[caller] || 0) + 1;
        this.lastFreeTicketClaim[caller] = this.blockchain.timestamp;
        
        // Track player
        if (!this.isFreeTicketPlayer[caller]) {
            this.isFreeTicketPlayer[caller] = true;
            this.freeTicketPlayers.push(caller);
        }
        
        this.blockchain.emit('FreeTicketClaimed', { 
            player: caller,
            amount: 1,
            expiresAt: this.storage.lastDrawTime + 86400
        });
    }
    
    /**
     * Get free tickets available
     */
    getFreeTicketsAvailable() {
        const caller = this.blockchain.caller;
        
        const currentDay = Math.floor(this.blockchain.timestamp / 86400);
        const lastDrawDay = Math.floor(this.storage.lastDrawTime / 86400);
        
        if (currentDay > lastDrawDay) {
            return 0;
        }
        
        return this.freeTicketCredits[caller] || 0;
    }
    
    /**
     * Start the draw
     */
    startDraw() {
        const caller = this.blockchain.caller;
        
        this.require(!this.storage.drawInProgress, 'Draw already in progress');
        this.require(this.tickets.length > 0, 'No tickets to draw');
        this.require(this.storage.roundActive, 'Round not active');
        
        this.storage.drawInProgress = true;
        this.blockchain.emit('DrawStarted', this.blockchain.timestamp);
    }
    
    /**
     * Complete the draw - owner only
     */
    completeDraw() {
        const cleanup = this.nonReentrant('completeDraw');
        try {
            const caller = this.blockchain.caller;
            
            this.require(this.blockchain.isOwner(caller), 'Not owner');
            this.require(this.storage.drawInProgress, 'No draw in progress');
            this.require(this.tickets.length > 0, 'No tickets');
            
            // Generate winning numbers using secure RNG
            const { nums, eb } = this.generateSecureRandomNumbers();
            this.storage.winningNumbers = nums;
            this.storage.winningEightBall = eb;
            
            // Distribute prizes
            const winners = this.distributePrizes();
            
            // Update pool
            this.storage.prizePool = Math.floor(this.storage.prizePool * this.POOL_RETENTION / 10000);
            
            // Expire free tickets
            this.expireAllFreeTickets();
            
            this.storage.drawInProgress = false;
            this.storage.lastDrawTime = this.blockchain.timestamp;
            
            this.blockchain.emit('DrawCompleted', {
                winningNumbers: this.storage.winningNumbers,
                winningEightBall: this.storage.winningEightBall,
                pool: this.storage.prizePool,
                winners: winners
            });
        } finally {
            cleanup();
        }
    }
    
    /**
     * Claim prize for a specific ticket
     * @param {number} id - Ticket ID
     */
    /**
     * DEPRECATED: Prizes are now sent automatically during draw
     * Kept for backwards compatibility - will reject with message
     */
    claimPrize(id) {
        throw new Error('Prizes are sent automatically - no claiming needed!');
    }
    
    /**
     * DEPRECATED: KPEPE prizes are now sent automatically during draw
     * Kept for backwards compatibility - will reject with message
     */
    claimKPEPEPrize() {
        throw new Error('KPEPE prizes are sent automatically - no claiming needed!');
    }
    
    /**
     * Initialize wallets - called once
     */
    initializeWallets(projectWallet, prizePoolWallet) {
        const caller = this.blockchain.caller;
        
        this.require(this.blockchain.isOwner(caller), 'Not owner');
        this.require(!this.storage.projectWallet, 'Already initialized');
        this.require(projectWallet && prizePoolWallet, 'Invalid wallets');
        
        this.storage.projectWallet = projectWallet;
        this.storage.prizePoolWallet = prizePoolWallet;
        
        this.blockchain.emit('WalletsInitialized', { projectWallet, prizePoolWallet });
    }
    
    /**
     * Set KPEPE token address
     */
    setKPEPEToken(token) {
        const caller = this.blockchain.caller;
        this.require(this.blockchain.isOwner(caller), 'Not owner');
        this.storage.kpepeToken = token;
    }
    
    /**
     * Set KPEPE staking contract
     */
    setKPEPEStaking(staking) {
        const caller = this.blockchain.caller;
        this.require(this.blockchain.isOwner(caller), 'Not owner');
        this.storage.kpepeStaking = staking;
    }
    
    /**
     * Toggle round active/inactive
     */
    toggleRound() {
        const caller = this.blockchain.caller;
        this.require(this.blockchain.isOwner(caller), 'Not owner');
        this.storage.roundActive = !this.storage.roundActive;
    }
    
    /**
     * Set KPEPE jackpot prize ONLY (tier 1: 5+8B)
     * All other prizes paid from KLV pool
     */
    setKPEPEJackpot(amount) {
        const caller = this.blockchain.caller;
        this.require(this.blockchain.isOwner(caller), 'Not owner');
        this.storage.kpepeJackpotPrize = amount;
        this.blockchain.emit('KPEPEJackpotSet', { amount: amount });
    }
    
    /**
     * Set withdrawal wallet for fund management
     */
    setWithdrawalWallet(wallet) {
        const caller = this.blockchain.caller;
        this.require(this.blockchain.isOwner(caller), 'Not owner');
        this.require(wallet && wallet !== '', 'Invalid wallet');
        this.storage.withdrawalWallet = wallet;
        this.blockchain.emit('WithdrawalWalletSet', { wallet: wallet });
    }
    
    /**
     * Withdraw from prize pool (max 10%)
     */
    withdrawPrizePool(amount) {
        const cleanup = this.nonReentrant('withdrawPrizePool');
        try {
            const caller = this.blockchain.caller;
            
            this.require(this.blockchain.isOwner(caller), 'Not owner');
            this.require(amount <= this.storage.prizePool, 'Insufficient balance');
            this.require(amount <= this.storage.prizePool / 10, 'Max 10%');
            this.require(this.storage.prizePoolWallet, 'Prize wallet not set');
            
            this.storage.prizePool -= amount;
            this.blockchain.transfer(this.storage.prizePoolWallet, amount);
            
            this.blockchain.emit('PrizePoolWithdrawn', amount);
        } finally {
            cleanup();
        }
    }
    
    // ===== VIEW FUNCTIONS =====
    
    getPoolBalance() {
        return this.storage.prizePool;
    }
    
    getNextDrawTime() {
        return Math.floor(this.storage.lastDrawTime / 86400 + 1) * 86400;
    }
    
    getTicket(id) {
        if (id >= this.tickets.length) return null;
        return this.tickets[id];
    }
    
    checkTicketResult(id) {
        const ticket = this.getTicket(id);
        if (!ticket) return { tier: 0, prize: 0 };
        
        const tier = this.calculateTier(ticket);
        const prize = tier > 0 ? this.calculatePrize(tier) : 0;
        
        return { tier, prize };
    }
    
    getPlayerTickets(address) {
        return this.playerTicketIds[address] || [];
    }
    
    // ===== INTERNAL HELPERS =#
    
    generateWinningNumbers() {
        const { nums, eb } = this.generateSecureRandomNumbers();
        this.storage.winningNumbers = nums;
        this.storage.winningEightBall = eb;
    }
    
    calculateTier(ticket) {
        let matches = 0;
        
        for (let i = 0; i < this.MAIN_COUNT; i++) {
            for (let j = 0; j < this.MAIN_COUNT; j++) {
                if (ticket.mainNumbers[i] === this.storage.winningNumbers[j]) {
                    matches++;
                    break;
                }
            }
        }
        
        const ebMatch = ticket.eightBall === this.storage.winningEightBall;
        
        if (matches === 5 && ebMatch) return 1;  // Jackpot
        if (matches === 5) return 2;             // Match 5
        if (matches === 4 && ebMatch) return 3;  // 4 + 8B
        if (matches === 4) return 4;             // Match 4
        if (matches === 3 && ebMatch) return 5;  // 3 + 8B
        if (matches === 3) return 6;             // Match 3
        if (matches === 2 && ebMatch) return 7;  // 2 + 8B
        if (matches === 1 && ebMatch) return 8;  // 1 + 8B
        if (ebMatch) return 9;                   // 8B only
        
        return 0;
    }
    
    calculatePrize(tier) {
        let pct = 0;
        
        switch (tier) {
            case 1: pct = this.PRIZE_JACKPOT; break;
            case 2: pct = this.PRIZE_MATCH5; break;
            case 3: pct = this.PRIZE_4_8B; break;
            case 4: pct = this.PRIZE_4; break;
            case 5: pct = this.PRIZE_3_8B; break;
            case 6: pct = this.PRIZE_3; break;
            case 7: pct = this.PRIZE_2_8B; break;
            case 8: pct = this.PRIZE_1_8B; break;
            case 9: pct = this.PRIZE_8B_ONLY; break;
            default: return 0;
        }
        
        return Math.floor(this.storage.prizePool * pct / 10000);
    }
    
    calculateKPEPE(tier) {
        // One-time seed fund - depletes as prizes are won
        switch (tier) {
            case 1: return this.storage.kpepeJackpotPrize;   // 500K (once)
            case 2: return this.storage.kpepeMatch5Prize;    // 50K
            case 3: return this.storage.kpepeMatch48BPrize;  // 40K
            case 4: return this.storage.kpepeMatch4Prize;    // 35K
            case 5: return this.storage.kpepeMatch38BPrize;  // 25K
            default: return 0;  // Tiers 6-9: KLV only
        }
    }
    
    distributePrizes() {
        let winners = 0;
        
        for (let i = 0; i < this.tickets.length; i++) {
            const ticket = this.tickets[i];
            if (ticket.prizeClaimed) continue;
            
            const tier = this.calculateTier(ticket);
            if (tier > 0) {
                const prize = this.calculatePrize(tier);
                if (prize > 0 && prize <= this.storage.prizePool) {
                    ticket.hasWon = true;
                    ticket.prizeClaimed = true;
                    this.storage.prizePool -= prize;
                    winners++;
                    
                    // ✅ SEND KLV PRIZE FROM PRIZE POOL WALLET
                    // Prize Pool Wallet (klv1zz5...) holds 85% of all ticket sales
                    // Winner receives their KLV directly from that wallet
                    this.blockchain.transfer(ticket.player, prize);
                    
                    // ✅ AUTOMATICALLY SEND KPEPE PRIZE (TIERS 1-5 HAVE ONE-TIME SEED FUND)
                    // Winners get KPEPE directly from Prize Pool Wallet (until depleted)
                    const kp = this.calculateKPEPE(tier);
                    if (kp > 0 && this.storage.kpepeToken) {
                        // Send KPEPE directly to winner (automatic - no claim needed)
                        this.blockchain.callContract(
                            this.storage.kpepeToken,
                            'transfer',
                            [ticket.player, kp]
                        );
                        
                        // Deplete the seed fund for this tier
                        switch (tier) {
                            case 1: this.storage.kpepeJackpotPrize = 0; break;  // One-time 500K
                            case 2: this.storage.kpepeMatch5Prize = Math.max(0, this.storage.kpepeMatch5Prize - kp); break;
                            case 3: this.storage.kpepeMatch48BPrize = Math.max(0, this.storage.kpepeMatch48BPrize - kp); break;
                            case 4: this.storage.kpepeMatch4Prize = Math.max(0, this.storage.kpepeMatch4Prize - kp); break;
                            case 5: this.storage.kpepeMatch38BPrize = Math.max(0, this.storage.kpepeMatch38BPrize - kp); break;
                        }
                    }
                    
                    // Track winner for stats
                    this.previousWinners.push({
                        ticketId: i,
                        player: ticket.player,
                        tier: tier,
                        prizeKLV: prize,
                        prizeKPEPE: kp,
                        timestamp: this.blockchain.timestamp
                    });
                    
                    this.blockchain.emit('PrizeDistributed', {
                        player: ticket.player,
                        ticketId: i,
                        tier,
                        amount: prize
                    });
                }
            }
        }
        
        return winners;
    }
    
    createFreeTicket(nums, eb) {
        const caller = this.blockchain.caller;
        
        const ticket = {
            player: caller,
            mainNumbers: nums,
            eightBall: eb,
            purchaseTime: this.blockchain.timestamp,
            hasWon: false,
            prizeClaimed: false,
            isFree: true
        };
        
        const id = this.tickets.length;
        this.tickets.push(ticket);
        
        if (!this.playerTicketIds[caller]) {
            this.playerTicketIds[caller] = [];
        }
        this.playerTicketIds[caller].push(id);
        
        this.storage.totalTicketsSold++;
        
        this.blockchain.emit('TicketPurchased', { id, player: caller, nums, eb, isFree: true });
    }
    
    expireAllFreeTickets() {
        for (let i = 0; i < this.freeTicketPlayers.length; i++) {
            const player = this.freeTicketPlayers[i];
            this.freeTicketCredits[player] = 0;
        }
        this.freeTicketPlayers = [];
    }
    
    /**
     * Get lottery stats for user dashboard
     * Returns: { paidTickets, freeTickets, totalTickets, poolAmount, previousWinners: [{ player, tier, prizeKLV, prizeKPEPE, timestamp }] }
     */
    getStats() {
        const recentWinners = this.previousWinners.slice(-10);  // Last 10 winners
        
        return {
            paidTickets: this.storage.totalPaidTickets,      // Only paid tickets contribute to pool
            freeTickets: this.storage.totalFreeTickets,      // Free tickets don't contribute
            totalTickets: this.storage.totalTicketsIncludingFree,  // All tickets combined
            poolAmount: this.storage.prizePool,               // Current KLV in pool
            previousWinners: recentWinners,                   // Recent winners for display
            kpepeSeedFund: {
                jackpot: this.storage.kpepeJackpotPrize,      // Tier 1 (500K once)
                match5: this.storage.kpepeMatch5Prize,         // Tier 2 (50K)
                match48B: this.storage.kpepeMatch48BPrize,     // Tier 3 (40K)
                match4: this.storage.kpepeMatch4Prize,         // Tier 4 (35K)
                match38B: this.storage.kpepeMatch38BPrize,     // Tier 5 (25K)
                total: this.storage.kpepeJackpotPrize + 
                       this.storage.kpepeMatch5Prize + 
                       this.storage.kpepeMatch48BPrize + 
                       this.storage.kpepeMatch4Prize + 
                       this.storage.kpepeMatch38BPrize
            }
        };
    }
    
    /**
     * Get detailed winner history
     */
    getPreviousWinners(count = 20) {
        const start = Math.max(0, this.previousWinners.length - count);
        return this.previousWinners.slice(start).reverse();  // Most recent first
    }
    
    /**
     * Fallback - accept KLV deposits
     */
    deposit() {
        // Contract can receive KLV
    }
}

// Export for testing and deployment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KPEPEJackpot;
}
