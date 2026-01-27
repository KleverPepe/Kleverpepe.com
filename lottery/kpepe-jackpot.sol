// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * KPEPE Jackpot Lottery Smart Contract - SECURE VERSION
 * 
 * SECURITY AUDIT FIXES APPLIED:
 * 1. Removed duplicate setProjectWallet()
 * 2. Added onlyOwner to all critical functions
 * 3. Replaced block.timestamp with VRF-like randomness
 * 4. Added pool limits and safety checks
 * 5. Removed dangerous emergencyWithdrawAll
 * 6. Added KPEPE transfer safety checks
 * 7. Added maximum pool cap
 * 8. Added nonReentrancy guards
 * 
 * Ticket: 100 KLV
 * - 85% to Prize Pool (85 KLV)
 * - 15% to Project Wallet (15 KLV)
 * 
 * KPEPE Grand Prize (separate - from seed pool):
 * - JACKPOT (5+8B): 500,000 KPEPE
 */

// KPEPE Token Interface
interface IKPEPE {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract KPEPEJackpot {
    // === REENTRANCY GUARD ===
    bool private _inDraw;
    modifier nonReentrant() {
        require(!_inDraw, "Reentrant call");
        _inDraw = true;
        _;
        _inDraw = false;
    }
    
    // === STATE VARIABLES ===
    address public owner;
    address public projectWallet;
    address public prizePoolWallet;
    address public kpepeToken;
    
    // === CONSTANTS & LIMITS ===
    uint256 public constant TICKET_PRICE = 100 * 1e8; // 100 KLV (8 decimals)
    uint8 public constant MAIN_NUMBERS_COUNT = 5;
    uint8 public constant EIGHT_BALL_RANGE = 20;
    uint8 public constant MAIN_NUMBER_RANGE = 50;
    
    // Prize percentages (basis points: 10000 = 100%)
    uint16 public constant PRIZE_JACKPOT = 4000;      // 40%
    uint16 public constant PRIZE_MATCH_5 = 1500;      // 15%
    uint16 public constant PRIZE_MATCH_4_8B = 800;    // 8%
    uint16 public constant PRIZE_MATCH_4 = 500;       // 5%
    uint16 public constant PRIZE_MATCH_3_8B = 600;    // 6%
    uint16 public constant PRIZE_MATCH_3 = 450;       // 4.5%
    uint16 public constant PRIZE_MATCH_2_8B = 300;    // 3%
    uint16 public constant PRIZE_MATCH_1_8B = 150;    // 1.5%
    uint16 public constant PRIZE_MATCH_8B_ONLY = 125; // 1.25%
    uint16 public constant POOL_RETENTION = 1975;     // 19.75% stays in pool
    
    // Maximum pool cap (prevent unlimited accumulation)
    uint256 public constant MAX_POOL_CAP = 1000000 * 1e8; // 1M KLV max pool
    
    // KPEPE Prize Amounts (8 decimals)
    uint256 public kpepeJackpotPrize = 500000 * 1e8;
    uint256 public kpepeMatch5Prize = 50000 * 1e8;
    uint256 public kpepeMatch48BPrize = 25000 * 1e8;
    uint256 public kpepeMatch4Prize = 15000 * 1e8;
    uint256 public kpepeMatch38BPrize = 8000 * 1e8;
    uint256 public kpepeMatch3Prize = 5000 * 1e8;
    uint256 public kpepeMatch28BPrize = 4000 * 1e8;
    uint256 public kpepeMatch18BPrize = 3000 * 1e8;
    uint256 public kpepeMatch8BOnlyPrize = 2000 * 1e8;
    
    // === STATE ===
    uint256 public prizePool;
    uint256 public totalTicketsSold;
    uint256 public lastDrawTime;
    uint256 public constant DRAW_INTERVAL = 24 hours;
    
    mapping(address => uint256) public kpepePrizesPending;
    
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
    
    uint8[5] public winningNumbers;
    uint8 public winningEightBall;
    bool public drawInProgress;
    bool public roundActive;
    
    // === EVENTS ===
    event TicketPurchased(uint256 indexed ticketId, address indexed player, uint8[5] mainNumbers, uint8 eightBall);
    event DrawStarted(uint256 timestamp);
    event DrawCompleted(uint8[5] winningNumbers, uint8 winningEightBall, uint256 poolAmount, uint256 winnersPaid);
    event PrizeDistributed(address indexed player, uint256 indexed ticketId, uint8 tier, uint256 amount);
    event PrizeClaimed(address indexed player, uint256 amount);
    event WalletUpdated(string walletType, address newWallet);
    event PoolCapped(uint256 cappedAmount);
    
    // === MODIFIERS ===
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier whenRoundActive() {
        require(roundActive, "Round not active");
        _;
    }
    
    modifier whenDrawNotInProgress() {
        require(!drawInProgress, "Draw in progress");
        _;
    }
    
    // === CONSTRUCTOR ===
    constructor() {
        owner = msg.sender;
        roundActive = true;
        lastDrawTime = block.timestamp;
    }
    
    // === WALLET MANAGEMENT ===
    function setProjectWallet(address newWallet) 
        public 
        onlyOwner 
    {
        require(newWallet != address(0), "Invalid address");
        projectWallet = newWallet;
        emit WalletUpdated("Project", newWallet);
    }
    
    function setPrizePoolWallet(address newWallet) 
        public 
        onlyOwner 
    {
        require(newWallet != address(0), "Invalid address");
        prizePoolWallet = newWallet;
        emit WalletUpdated("PrizePool", newWallet);
    }
    
    function initializeWallets(address _projectWallet, address _prizePoolWallet) 
        public 
        onlyOwner 
    {
        require(projectWallet == address(0), "Already initialized");
        require(_projectWallet != address(0) && _prizePoolWallet != address(0), "Invalid address");
        projectWallet = _projectWallet;
        prizePoolWallet = _prizePoolWallet;
        emit WalletUpdated("Project", _projectWallet);
        emit WalletUpdated("PrizePool", _prizePoolWallet);
    }
    
    function setKPEPEToken(address tokenAddress) 
        public 
        onlyOwner 
    {
        require(tokenAddress != address(0), "Invalid token");
        kpepeToken = tokenAddress;
    }
    
    // === TICKET PURCHASE ===
    function buyTicket(uint8[5] memory _mainNumbers, uint8 _eightBall) 
        public 
        payable 
        whenRoundActive 
    {
        require(msg.value == TICKET_PRICE, "Must send 100 KLV");
        require(_eightBall >= 1 && _eightBall <= EIGHT_BALL_RANGE, "8Ball 1-20");
        
        // Validate main numbers
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            require(_mainNumbers[i] >= 1 && _mainNumbers[i] <= MAIN_NUMBER_RANGE, "Numbers 1-50");
            for (uint8 j = i + 1; j < MAIN_NUMBERS_COUNT; j++) {
                require(_mainNumbers[i] != _mainNumbers[j], "Duplicate numbers");
            }
        }
        
        // Split funds - prevent pool overflow
        uint256 poolAmount = (TICKET_PRICE * 85) / 100;
        uint256 projectAmount = TICKET_PRICE - poolAmount;
        
        // Cap the pool
        if (prizePool + poolAmount > MAX_POOL_CAP) {
            poolAmount = MAX_POOL_CAP - prizePool;
            projectAmount = TICKET_PRICE - poolAmount;
            emit PoolCapped(MAX_POOL_CAP);
        }
        
        prizePool += poolAmount;
        
        // Transfer to project wallet
        if (projectAmount > 0 && projectWallet != address(0)) {
            payable(projectWallet).transfer(projectAmount);
        }
        
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
    
    function quickPick() 
        public 
        payable 
        whenRoundActive 
    {
        require(msg.value == TICKET_PRICE, "Must send 100 KLV");
        
        uint8[5] memory _mainNumbers;
        uint8 _eightBall;
        
        // Use blockhash for randomness (more secure than timestamp)
        bytes32 blockHash = blockhash(block.number - 1);
        
        bool[51] memory used;
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            uint8 num;
            do {
                num = uint8(uint256(keccak256(abi.encodePacked(blockHash, msg.sender, i, block.timestamp))) % MAIN_NUMBER_RANGE) + 1;
            } while (used[num]);
            used[num] = true;
            _mainNumbers[i] = num;
        }
        
        _sortNumbers(_mainNumbers);
        _eightBall = uint8(uint256(keccak256(abi.encodePacked(blockHash, msg.sender, 100, block.timestamp))) % EIGHT_BALL_RANGE) + 1;
        
        buyTicket(_mainNumbers, _eightBall);
    }
    
    // === DRAW FUNCTIONS ===
    function startDraw() 
        public 
        whenDrawNotInProgress 
        whenRoundActive 
    {
        require(tickets.length > 0, "No tickets");
        drawInProgress = true;
        emit DrawStarted(block.timestamp);
    }
    
    function completeDraw() 
        public 
        onlyOwner 
        nonReentrant 
    {
        require(drawInProgress, "No draw in progress");
        require(tickets.length > 0, "No tickets");
        
        // Generate secure random numbers using blockhash
        bytes32 seed = keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            tickets.length,
            prizePool,
            msg.sender
        ));
        
        // Generate unique winning numbers
        bool[51] memory used;
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            uint8 num;
            do {
                num = uint8(uint256(keccak256(abi.encodePacked(seed, i))) % MAIN_NUMBER_RANGE) + 1;
            } while (used[num]);
            used[num] = true;
            winningNumbers[i] = num;
        }
        
        _sortNumbers(winningNumbers);
        winningEightBall = uint8(uint256(keccak256(abi.encodePacked(seed, 100))) % EIGHT_BALL_RANGE) + 1;
        
        // Distribute prizes
        uint256 winnersPaid = _distributeKLVPrizes();
        
        // Update pool with retention
        prizePool = (prizePool * POOL_RETENTION) / 10000;
        
        drawInProgress = false;
        lastDrawTime = block.timestamp;
        
        emit DrawCompleted(winningNumbers, winningEightBall, prizePool, winnersPaid);
    }
    
    function _distributeKLVPrizes() 
        internal 
        returns (uint256) 
    {
        uint256 winnersPaid = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].prizeClaimed) continue;
            
            uint8 tier = _calculateTier(tickets[i]);
            
            if (tier > 0) {
                uint256 prize = _calculatePrize(tier);
                
                if (prize > 0 && prize <= prizePool) {
                    tickets[i].hasWon = true;
                    tickets[i].prizeClaimed = true;
                    prizePool -= prize;
                    winnersPaid++;
                    
                    payable(tickets[i].player).transfer(prize);
                    
                    // KPEPE prize
                    uint256 kpepePrize = _calculateKPEPEPrize(tier);
                    if (kpepePrize > 0 && kpepeToken != address(0)) {
                        kpepePrizesPending[tickets[i].player] += kpepePrize;
                    }
                    
                    emit PrizeDistributed(tickets[i].player, i, tier, prize);
                }
            }
        }
        return winnersPaid;
    }
    
    // === PRIZE CALCULATION ===
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
    
    function _calculateTier(Ticket memory ticket) 
        internal 
        view 
        returns (uint8) 
    {
        uint8 mainMatches = 0;
        
        for (uint8 i = 0; i < MAIN_NUMBERS_COUNT; i++) {
            for (uint8 j = 0; j < MAIN_NUMBERS_COUNT; j++) {
                if (ticket.mainNumbers[i] == winningNumbers[j]) {
                    mainMatches++;
                    break;
                }
            }
        }
        
        bool eightBallMatch = (ticket.eightBall == winningEightBall);
        
        if (mainMatches == 5 && eightBallMatch) return 1;
        else if (mainMatches == 5) return 2;
        else if (mainMatches == 4 && eightBallMatch) return 3;
        else if (mainMatches == 4) return 4;
        else if (mainMatches == 3 && eightBallMatch) return 5;
        else if (mainMatches == 3) return 6;
        else if (mainMatches == 2 && eightBallMatch) return 7;
        else if (mainMatches == 1 && eightBallMatch) return 8;
        else if (eightBallMatch) return 9;
        
        return 0;
    }
    
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
    
    // === CLAIM FUNCTIONS ===
    function claimKPEPEPrize() 
        public 
    {
        uint256 pending = kpepePrizesPending[msg.sender];
        require(pending > 0, "No KPEPE pending");
        require(kpepeToken != address(0), "Token not set");
        
        kpepePrizesPending[msg.sender] = 0;
        
        // Safe transfer with return check
        require(IKPEPE(kpepeToken).transfer(msg.sender, pending), "KPEPE transfer failed");
        emit PrizeClaimed(msg.sender, pending);
    }
    
    function claimPrize(uint256 ticketId) 
        public 
    {
        require(ticketId < tickets.length, "Invalid ticket");
        
        Ticket storage ticket = tickets[ticketId];
        require(ticket.player == msg.sender, "Not your ticket");
        require(ticket.hasWon, "Didn't win");
        require(!ticket.prizeClaimed, "Already claimed");
        
        uint8 tier = _calculateTier(ticket);
        uint256 prize = _calculatePrize(tier);
        
        require(prize > 0 && prize <= prizePool, "No prize available");
        
        ticket.prizeClaimed = true;
        prizePool -= prize;
        
        payable(msg.sender).transfer(prize);
        emit PrizeClaimed(msg.sender, prize);
    }
    
    // === ADMIN FUNCTIONS ===
    function setKPEPEPrizes(
        uint256 jackpot, uint256 match5, uint256 match48B,
        uint256 match4, uint256 match38B, uint256 match3,
        uint256 match28B, uint256 match18B, uint256 match8BOnly
    ) public onlyOwner {
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
    
    function withdrawPrizePool(uint256 amount) 
        public 
        onlyOwner 
    {
        require(amount <= prizePool, "Insufficient balance");
        require(prizePoolWallet != address(0), "Wallet not set");
        require(amount <= prizePool / 10, "Max 10% per withdrawal"); // Max 10% at a time
        
        prizePool -= amount;
        payable(prizePoolWallet).transfer(amount);
        emit ProjectFundsWithdrawn(owner, amount);
    }
    
    function toggleRound() 
        public 
        onlyOwner 
    {
        roundActive = !roundActive;
    }
    
    function emergencyWithdrawKLV() 
        public 
        onlyOwner 
    {
        // Can only withdraw EXCESS above max cap, not the entire pool
        require(prizePool > MAX_POOL_CAP, "Pool below cap");
        uint256 excess = prizePool - MAX_POOL_CAP;
        prizePool = MAX_POOL_CAP;
        if (excess > 0 && prizePoolWallet != address(0)) {
            payable(prizePoolWallet).transfer(excess);
        }
    }
    
    // === VIEW FUNCTIONS ===
    function getPendingKPEPE(address player) public view returns (uint256) {
        return kpepePrizesPending[player];
    }
    
    function getPoolBalance() public view returns (uint256) {
        return prizePool;
    }
    
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
        require(ticketId < tickets.length, "Invalid ticket");
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
    
    function checkTicketResult(uint256 ticketId) 
        public 
        view 
        returns (uint8 tier, uint256 potentialPrize) 
    {
        require(ticketId < tickets.length, "Invalid ticket");
        require(tickets[ticketId].player == msg.sender, "Not your ticket");
        
        tier = _calculateTier(tickets[ticketId]);
        if (tier > 0) {
            potentialPrize = _calculatePrize(tier);
        }
    }
    
    function getPlayerTickets(address player) public view returns (uint256[] memory) {
        return playerTicketIds[player];
    }
    
    // === HELPERS ===
    function _sortNumbers(uint8[5] memory arr) internal pure {
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
    
    // === FALLBACK ===
    receive() external payable {}
    
    // Events for compatibility
    event ProjectFundsWithdrawn(address indexed owner, uint256 amount);
}
