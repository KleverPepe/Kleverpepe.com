// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * KPEPE Jackpot Lottery Smart Contract
 * KleverChain Lottery with Pool-Based Prize Distribution
 * 
 * Ticket: 1000 KLV
 * - 85% to Prize Pool (850 KLV)
 * - 15% to Project Wallet (150 KLV)
 * 
 * Prize Distribution (from KLV Pool):
 * - JACKPOT (5+8B): 40% of pool
 * - Match 5: 15% of pool
 * - Match 4 + 8B: 10% of pool
 * - Match 4: 6% of pool
 * - Match 3 + 8B: 4% of pool
 * - Match 3: 2% of pool
 * - Match 2 + 8B: 1% of pool
 * - Match 1 + 8B: 0.5% of pool
 * - Match 8B only: 0.25% of pool
 * 
 * KPEPE Grand Prize (separate - from seed pool):
 * - JACKPOT (5+8B): 500,000 KPEPE
 * - Match 5: 50,000 KPEPE
 * - Match 4 + 8B: 25,000 KPEPE
 * - etc.
 * 
 * WALLETS:
 * - Project Wallet: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
 * - Prize Pool Wallet: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
 */

// KPEPE Token Interface
interface IKPEPE {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract KPEPEJackpot {
    // Contract Owner
    address public owner;
    address public projectWallet = 0x19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9;
    address public prizePoolWallet = 0x1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2;
    
    // KPEPE Token
    address public kpepeToken = 0xYourKPEPETokenAddressHere; // Replace with actual KPEPE token address
    
    // KPEPE Prize Amounts (from seed pool - set by owner)
    uint256 public kpepeJackpotPrize = 500000 * 1e8;    // 500,000 KPEPE
    uint256 public kpepeMatch5Prize = 50000 * 1e8;      // 50,000 KPEPE
    uint256 public kpepeMatch48BPrize = 25000 * 1e8;    // 25,000 KPEPE
    uint256 public kpepeMatch4Prize = 15000 * 1e8;      // 15,000 KPEPE
    uint256 public kpepeMatch38BPrize = 8000 * 1e8;     // 8,000 KPEPE
    uint256 public kpepeMatch3Prize = 5000 * 1e8;       // 5,000 KPEPE
    uint256 public kpepeMatch28BPrize = 4000 * 1e8;     // 4,000 KPEPE
    uint256 public kpepeMatch18BPrize = 3000 * 1e8;     // 3,000 KPEPE
    uint256 public kpepeMatch8BOnlyPrize = 2000 * 1e8;  // 2,000 KPEPE
    
    // Lottery Parameters
    uint256 public constant TICKET_PRICE = 1000 * 1e8; // 1000 KLV (8 decimals)
    uint8 public constant MAIN_NUMBERS_COUNT = 5;
    uint8 public constant EIGHT_BALL_COUNT = 1;
    uint8 public constant MAIN_NUMBER_RANGE = 50; // 1-50
    uint8 public constant EIGHT_BALL_RANGE = 20;  // 1-20
    
    // Prize Percentages (in basis points: 10000 = 100%)
    uint16 public constant PRIZE_JACKPOT = 4000;      // 40%
    uint16 public constant PRIZE_MATCH_5 = 1500;      // 15%
    uint16 public constant PRIZE_MATCH_4_8B = 1000;   // 10%
    uint16 public constant PRIZE_MATCH_4 = 600;       // 6%
    uint16 public constant PRIZE_MATCH_3_8B = 400;    // 4%
    uint16 public constant PRIZE_MATCH_3 = 200;       // 2%
    uint16 public constant PRIZE_MATCH_2_8B = 100;    // 1%
    uint16 public constant PRIZE_MATCH_1_8B = 50;     // 0.5%
    uint16 public constant PRIZE_MATCH_8B_ONLY = 25;  // 0.25%
    
    // Pool retention (percentage that stays in pool)
    uint16 public constant POOL_RETENTION = 2100; // 21%
    
    // State Variables
    uint256 public prizePool;
    uint256 public totalTicketsSold;
    uint256 public totalPlayers;
    uint256 public lastDrawTime;
    uint256 public drawInterval = 24 hours;
    
    // KPEPE prize tracking
    mapping(address => uint256) public kpepePrizesPending;
    
    // Ticket storage
    struct Ticket {
        address player;
        uint8[5] mainNumbers;
        uint8 eightBall;
        uint256 purchaseTime;
        bool hasWon;
        bool prizeClaimed;
    }
    
    Ticket[] public tickets;
    mapping(address => uint256[]) public playerTicketIds;
    
    // Current round
    uint8[5] public winningNumbers;
    uint8 public winningEightBall;
    bool public drawInProgress;
    bool public roundActive;
    
    // Events
    event TicketPurchased(uint256 indexed ticketId, address indexed player, uint8[5] mainNumbers, uint8 eightBall);
    event DrawStarted(uint256 timestamp);
    event DrawCompleted(uint8[5] winningNumbers, uint8 winningEightBall, uint256 poolAmount);
    event PrizeDistributed(address indexed player, uint256 indexed ticketId, uint8 tier, uint256 amount);
    event PrizeClaimed(address indexed player, uint256 amount);
    event ProjectFundsWithdrawn(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier whenRoundActive() {
        require(roundActive, "No active round");
        _;
    }
    
    modifier whenDrawNotInProgress() {
        require(!drawInProgress, "Draw already in progress");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        roundActive = true;
        lastDrawTime = block.timestamp;
    }
    
    /**
     * @dev Withdraw accumulated KLV from prize pool for manual distribution
     * Only owner can call this
     */
    function withdrawPrizePool(uint256 amount) 
        public 
        onlyOwner 
    {
        require(amount <= prizePool, "Insufficient pool balance");
        prizePool -= amount;
        payable(prizePoolWallet).transfer(amount);
        emit ProjectFundsWithdrawn(owner, amount);
    }
    
    /**
     * @dev Get current pool balance
     */
    function getPoolBalance() 
        public 
        view 
        returns (uint256) 
    {
        return prizePool;
    }
    
    /**
     * @dev Buy a lottery ticket
     */
    function buyTicket(uint8[5] memory _mainNumbers, uint8 _eightBall) 
        public 
        payable 
        whenRoundActive 
    {
        require(msg.value == TICKET_PRICE, "Must send exactly 1000 KLV");
        require(_eightBall >= 1 && _eightBall <= EIGHT_BALL_RANGE, "8Ball must be 1-20");
        
        // Validate main numbers
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            require(_mainNumbers[i] >= 1 && _mainNumbers[i] <= MAIN_NUMBER_RANGE, "Main numbers must be 1-50");
            for (uint8 j = i + 1; j < MAIN_NUMBERS_COUNT; j++) {
                require(_mainNumbers[i] != _mainNumbers[j], "Duplicate main numbers");
            }
        }
        
        // Split funds
        uint256 poolAmount = (TICKET_PRICE * 85) / 100; // 85% to pool
        uint256 projectAmount = TICKET_PRICE - poolAmount; // 15% to project
        
        prizePool += poolAmount;
        
        // Transfer to project wallet
        payable(projectWallet).transfer(projectAmount);
        
        // Create ticket
        Ticket memory newTicket = Ticket({
            player: msg.sender,
            mainNumbers: _mainNumbers,
            eightBall: _eightBall,
            purchaseTime: block.timestamp,
            hasWon: false,
            prizeClaimed: false
        });
        
        uint256 ticketId = tickets.length;
        tickets.push(newTicket);
        playerTicketIds[msg.sender].push(ticketId);
        
        totalTicketsSold++;
        
        emit TicketPurchased(ticketId, msg.sender, _mainNumbers, _eightBall);
    }
    
    /**
     * @dev Quick pick - generates random numbers and buys ticket
     */
    function quickPick() 
        public 
        payable 
        whenRoundActive 
    {
        require(msg.value == TICKET_PRICE, "Must send exactly 1000 KLV");
        
        uint8[5 memory] memory _mainNumbers;
        uint8 _eightBall;
        
        // Generate unique random main numbers
        bool[51 memory] memory used;
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            uint8 num;
            do {
                num = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % MAIN_NUMBER_RANGE) + 1;
            } while (used[num]);
            used[num] = true;
            _mainNumbers[i] = num;
        }
        
        // Sort main numbers
        _sortNumbers(_mainNumbers);
        
        // Generate random 8-ball
        _eightBall = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, 100))) % EIGHT_BALL_RANGE) + 1;
        
        // Buy ticket with generated numbers
        buyTicket(_mainNumbers, _eightBall);
    }
    
    /**
     * @dev Start the draw process (anyone can trigger)
     */
    function startDraw() 
        public 
        whenDrawNotInProgress 
        whenRoundActive 
    {
        require(tickets.length > 0, "No tickets to draw");
        drawInProgress = true;
        emit DrawStarted(block.timestamp);
    }
    
    /**
     * @dev Complete the draw and distribute prizes (only owner)
     */
    function completeDraw() 
        public 
        onlyOwner 
    {
        require(drawInProgress, "No draw in progress");
        require(tickets.length > 0, "No tickets to draw");
        
        // Generate winning numbers using block data
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            tickets.length,
            prizePool
        )));
        
        // Generate unique winning main numbers
        bool[51 memory] memory used;
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            uint8 num;
            do {
                num = uint8(uint256(keccak256(abi.encodePacked(seed, i))) % MAIN_NUMBER_RANGE) + 1;
            } while (used[num]);
            used[num] = true;
            winningNumbers[i] = num;
        }
        
        // Sort winning numbers
        _sortNumbers(winningNumbers);
        
        // Generate winning 8-ball
        winningEightBall = uint8(uint256(keccak256(abi.encodePacked(seed, 100))) % EIGHT_BALL_RANGE) + 1;
        
        // Distribute KLV prizes
        _distributeKLVPrizes();
        
        // Update pool with retention
        uint256 poolAfterDistribution = prizePool;
        prizePool = (prizePool * POOL_RETENTION) / 10000;
        
        drawInProgress = false;
        lastDrawTime = block.timestamp;
        
        emit DrawCompleted(winningNumbers, winningEightBall, poolAfterDistribution);
    }
    
    /**
     * @dev Distribute KLV prizes to all winners
     */
    function _distributeKLVPrizes() 
        internal 
    {
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].prizeClaimed) continue;
            
            uint8 tier = _calculateTier(tickets[i]);
            
            if (tier > 0) {
                uint256 prize = _calculatePrize(tier);
                
                if (prize > 0 && prize <= prizePool) {
                    tickets[i].hasWon = true;
                    tickets[i].prizeClaimed = true;
                    prizePool -= prize;
                    
                    payable(tickets[i].player).transfer(prize);
                    
                    // Calculate KPEPE prize
                    uint256 kpepePrize = _calculateKPEPEPrize(tier);
                    if (kpepePrize > 0) {
                        kpepePrizesPending[tickets[i].player] += kpepePrize;
                    }
                    
                    emit PrizeDistributed(tickets[i].player, i, tier, prize);
                }
            }
        }
    }
    
    /**
     * @dev Calculate KPEPE prize amount based on tier
     */
    function _calculateKPEPEPrize(uint8 tier) 
        internal 
        view 
        returns (uint256) 
    {
        if (tier == 1) return kpepeJackpotPrize;
        else if (tier == 2) return kpepeMatch5Prize;
        else if (tier == 3) return kpepeMatch48BPrize;
        else if (tier == 4) return kpepeMatch4Prize;
        else if (tier == 5) return kpepeMatch38BPrize;
        else if (tier == 6) return kpepeMatch3Prize;
        else if (tier == 7) return kpepeMatch28BPrize;
        else if (tier == 8) return kpepeMatch18BPrize;
        else if (tier == 9) return kpepeMatch8BOnlyPrize;
        return 0;
    }
    
    /**
     * @dev Claim pending KPEPE prizes
     */
    function claimKPEPEPrize() 
        public 
    {
        uint256 pending = kpepePrizesPending[msg.sender];
        require(pending > 0, "No KPEPE prizes pending");
        
        kpepePrizesPending[msg.sender] = 0;
        
        IKPEPE(kpepeToken).transfer(msg.sender, pending);
        emit PrizeClaimed(msg.sender, pending);
    }
    
    /**
     * @dev Set KPEPE prize amounts (owner only)
     */
    function setKPEPEPrizes(
        uint256 jackpot,
        uint256 match5,
        uint256 match48B,
        uint256 match4,
        uint256 match38B,
        uint256 match3,
        uint256 match28B,
        uint256 match18B,
        uint256 match8BOnly
    ) 
        public 
        onlyOwner 
    {
        kpepeJackpotPrize = jackpot;
        kpepeMatch5Prize = match5;
        kpepeMatch48BPrize = match48B;
        kpepeMatch4Prize = match4;
        kpepeMatch38BPrize = match38B;
        kpepeMatch3Prize = match3;
        kpepeMatch28BPrize = match28B;
        kpepeMatch18BPrize = match18B;
        kpepeMatch8BOnlyPrize = match8BOnly;
    }
    
    /**
     * @dev Get pending KPEPE prize for player
     */
    function getPendingKPEPE(address player) 
        public 
        view 
        returns (uint256) 
    {
        return kpepePrizesPending[player];
    }
    
    /**
     * @dev Calculate the prize tier for a ticket
     */
    function _calculateTier(Ticket memory ticket) 
        internal 
        pure 
        returns (uint8) 
    {
        uint8 mainMatches = 0;
        
        // Count main number matches
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            for (uint8 j = 0; j < MAIN_NUMBERS_COUNT; j++) {
                if (ticket.mainNumbers[i] == winningNumbers[j]) {
                    mainMatches++;
                    break;
                }
            }
        }
        
        // Check 8-ball match
        bool eightBallMatch = (ticket.eightBall == winningEightBall);
        
        // Determine tier
        if (mainMatches == 5 && eightBallMatch) {
            return 1; // JACKPOT
        } else if (mainMatches == 5) {
            return 2; // Match 5
        } else if (mainMatches == 4 && eightBallMatch) {
            return 3; // Match 4 + 8B
        } else if (mainMatches == 4) {
            return 4; // Match 4
        } else if (mainMatches == 3 && eightBallMatch) {
            return 5; // Match 3 + 8B
        } else if (mainMatches == 3) {
            return 6; // Match 3
        } else if (mainMatches == 2 && eightBallMatch) {
            return 7; // Match 2 + 8B
        } else if (mainMatches == 1 && eightBallMatch) {
            return 8; // Match 1 + 8B
        } else if (eightBallMatch) {
            return 9; // 8B only
        }
        
        return 0; // No win
    }
    
    /**
     * @dev Calculate prize amount based on tier
     */
    function _calculatePrize(uint8 tier) 
        internal 
        view 
        returns (uint256) 
    {
        uint16 percentage;
        
        if (tier == 1) percentage = PRIZE_JACKPOT;
        else if (tier == 2) percentage = PRIZE_MATCH_5;
        else if (tier == 3) percentage = PRIZE_MATCH_4_8B;
        else if (tier == 4) percentage = PRIZE_MATCH_4;
        else if (tier == 5) percentage = PRIZE_MATCH_3_8B;
        else if (tier == 6) percentage = PRIZE_MATCH_3;
        else if (tier == 7) percentage = PRIZE_MATCH_2_8B;
        else if (tier == 8) percentage = PRIZE_MATCH_1_8B;
        else if (tier == 9) percentage = PRIZE_MATCH_8B_ONLY;
        else return 0;
        
        return (prizePool * percentage) / 10000;
    }
    
    /**
     * @dev Claim unclaimed prizes (for tickets bought before draw)
     */
    function claimPrize(uint256 ticketId) 
        public 
    {
        require(ticketId < tickets.length, "Invalid ticket ID");
        
        Ticket storage ticket = tickets[ticketId];
        require(ticket.player == msg.sender, "Not your ticket");
        require(ticket.hasWon, "Ticket didn't win");
        require(!ticket.prizeClaimed, "Prize already claimed");
        
        uint8 tier = _calculateTier(ticket);
        uint256 prize = _calculatePrize(tier);
        
        require(prize > 0 && prize <= prizePool, "No prize available");
        
        ticket.prizeClaimed = true;
        prizePool -= prize;
        
        payable(msg.sender).transfer(prize);
        emit PrizeClaimed(msg.sender, prize);
    }
    
    /**
     * @dev Get player's tickets for current round
     */
    function getPlayerTickets(address player) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return playerTicketIds[player];
    }
    
    /**
     * @dev Get ticket details
     */
    function getTicket(uint256 ticketId) 
        public 
        view 
        returns (
            address player,
            uint8[5] memory mainNumbers,
            uint8 eightBall,
            uint256 purchaseTime,
            bool hasWon,
            bool prizeClaimed
        ) 
    {
        require(ticketId < tickets.length, "Invalid ticket ID");
        Ticket storage ticket = tickets[ticketId];
        return (
            ticket.player,
            ticket.mainNumbers,
            ticket.eightBall,
            ticket.purchaseTime,
            ticket.hasWon,
            ticket.prizeClaimed
        );
    }
    
    /**
     * @dev Check if a ticket is a winner
     */
    function checkTicketResult(uint256 ticketId) 
        public 
        view 
        returns (uint8 tier, uint256 potentialPrize) 
    {
        require(ticketId < tickets.length, "Invalid ticket ID");
        require(tickets[ticketId].player == msg.sender, "Not your ticket");
        
        tier = _calculateTier(tickets[ticketId]);
        if (tier > 0) {
            potentialPrize = _calculatePrize(tier);
        }
    }
    
    /**
     * @dev Update project wallet
     */
    function setProjectWallet(address newWallet) 
        public 
        onlyOwner 
    {
        require(newWallet != address(0), "Invalid address");
        projectWallet = newWallet;
    }
    
    /**
     * @dev Withdraw project funds (accidentally sent to contract)
     */
    function withdrawProjectFunds() 
        public 
        onlyOwner 
    {
        uint256 balance = address(this).balance - prizePool;
        require(balance > 0, "No funds available");
        payable(owner).transfer(balance);
        emit ProjectFundsWithdrawn(owner, balance);
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyWithdrawAll() 
        public 
        onlyOwner 
    {
        payable(owner).transfer(address(this).balance);
    }
    
    function toggleRound() 
        public 
        onlyOwner 
    {
        roundActive = !roundActive;
    }
    
    // Helper: Sort numbers in ascending order
    function _sortNumbers(uint8[5] memory arr) 
        internal 
        pure 
    {
        for (uint8 i = 0; i < 5; i++) {
            for (uint8 j = i + 1; j < 5; j++) {
                if (arr[i] > arr[j]) {
                    uint8 temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
        }
    }
    
    // Fallback: Accept KLV deposits
    receive() 
        external 
        payable 
    {}
}
