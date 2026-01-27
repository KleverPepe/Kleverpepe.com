// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IKPEPE { 
    function transfer(address r, uint256 a) external returns (bool); 
    function balanceOf(address a) external view returns (uint256);
}

interface IKPEPEStaking {
    function getStakeAmount(address user) external view returns (uint256 stakedAmount);
    function getTier(address user) external view returns (uint8 tier);
}

contract KPEPEJackpot is Ownable, ReentrancyGuard {
    address public projectWallet;
    address public prizePoolWallet;
    address public kpepeToken;
    address public kpepeStaking;
    
    uint256 public constant TICKET_PRICE = 100 * 1e8;
    uint8 public constant MAIN_COUNT = 5;
    uint8 public constant EIGHT_RANGE = 20;
    uint8 public constant MAIN_RANGE = 50;
    
    uint16 public constant PRIZE_JACKPOT = 4000;
    uint16 public constant PRIZE_MATCH5 = 1500;
    uint16 public constant PRIZE_4_8B = 800;
    uint16 public constant PRIZE_4 = 500;
    uint16 public constant PRIZE_3_8B = 600;
    uint16 public constant PRIZE_3 = 450;
    uint16 public constant PRIZE_2_8B = 300;
    uint16 public constant PRIZE_1_8B = 150;
    uint16 public constant PRIZE_8B_ONLY = 125;
    uint16 public constant POOL_RETENTION = 1975;
    uint256 public constant MAX_POOL = 1000000 * 1e8;
    
    uint256 public prizePool;
    uint256 public totalTicketsSold;
    uint256 public lastDrawTime;
    uint8 public constant DRAW_HOUR_UTC = 0; // Draw at 00:00 UTC daily
    bool public drawInProgress;
    bool public roundActive;
    
    mapping(address => uint256) public kpepePrizesPending;
    mapping(address => uint256) public freeTicketCredits;
    mapping(address => uint256) public lastFreeTicketClaim;
    mapping(address => uint8) public playerTiers;
    address[] public freeTicketPlayers;
    mapping(address => bool) public isFreeTicketPlayer;
    
    struct Ticket {
        address player;
        uint8[5] mainNumbers;
        uint8 eightBall;
        uint256 purchaseTime;
        bool hasWon;
        bool prizeClaimed;
        bool isFree;
    }
    Ticket[] public tickets;
    mapping(address => uint256[]) public playerTicketIds;
    
    uint8[5] public winningNumbers;
    uint8 public winningEightBall;
    bool private _inDraw;
    
    uint256 public kpepeJackpotPrize;
    uint256 public kpepeMatch5Prize;
    uint256 public kpepeMatch48BPrize;
    uint256 public kpepeMatch4Prize;
    uint256 public kpepeMatch38BPrize;
    uint256 public kpepeMatch3Prize;
    uint256 public kpepeMatch28BPrize;
    uint256 public kpepeMatch18BPrize;
    uint256 public kpepeMatch8BOnlyPrize;
    
    // Single Tier Configuration
    uint256 public constant MIN_STAKE_FOR_FREE = 50000 * 1e8;
    uint8 public constant FREE_TICKETS_PER_DAY = 1;
    
    // Staking Tier Configuration (legacy - single tier)
    struct TierConfig {
        uint256 minStake;
        uint8 ticketsPerDay;
        uint8 tierId;
        string name;
    }
    TierConfig[1] public tiers;
    
    event TicketPurchased(uint256 indexed id, address indexed player, uint8[5] nums, uint8 eb, bool isFree);
    event FreeTicketsClaimed(address indexed player, uint256 amount);
    event DrawStarted(uint256 ts);
    event DrawCompleted(uint8[5] nums, uint8 eb, uint256 pool, uint256 winners);
    event PrizeDistributed(address p, uint256 id, uint8 tier, uint256 amt);
    event PrizeClaimed(address p, uint256 amt);
    event WalletUpdated(string walletType, address addr);
    event PoolCapped(uint256 amt);
    event StakingTierUpdated(uint8 tierId, string name, uint256 minStake, uint8 freeTickets);
    
    modifier whenActive() { require(roundActive, "!active"); _; }
    modifier whenNoDraw() { require(!drawInProgress, "draw"); _; }
    
    constructor() {
        roundActive = true;
        lastDrawTime = block.timestamp;
        
        // Single Tier: 50K+ KPEPE = 1 Free Ticket/Day
        tiers[0] = TierConfig({minStake: MIN_STAKE_FOR_FREE, ticketsPerDay: FREE_TICKETS_PER_DAY, tierId: 1, name: "Staked"});
    }
    
    // ===== FREE TICKET FUNCTIONS =====
    
    /**
     * @notice Claim daily free ticket based on staking
     * @dev Tickets expire at next draw (00:00 UTC daily)
     */
    function claimFreeTickets() public whenActive {
        require(kpepeStaking != address(0), "!staking");
        
        // Check if user has minimum stake
        uint256 stakeAmount = IKPEPEStaking(kpepeStaking).getStakeAmount(msg.sender);
        require(stakeAmount >= MIN_STAKE_FOR_FREE, "!50K stake");
        
        // Check 24-hour cooldown
        require(lastFreeTicketClaim[msg.sender] + 1 days < block.timestamp, "cooldown");
        
        // Check if a new draw has occurred - expire old tickets if so
        uint256 currentDrawDay = block.timestamp / 1 days;
        uint256 lastDrawDay = lastDrawTime / 1 days;
        if (currentDrawDay > lastDrawDay) {
            // New draw happened, expire all unused tickets
            _expireAllFreeTickets();
        }
        
        // Track player for expiry
        if (!isFreeTicketPlayer[msg.sender]) {
            isFreeTicketPlayer[msg.sender] = true;
            freeTicketPlayers.push(msg.sender);
        }
        
        // Add 1 free ticket
        freeTicketCredits[msg.sender]++;
        lastFreeTicketClaim[msg.sender] = block.timestamp;
        playerTiers[msg.sender] = 1;
        
        emit FreeTicketsClaimed(msg.sender, 1);
    }
    
    /**
     * @notice Get free tickets available for a user
     * @dev Tickets expire at next daily draw (00:00 UTC)
     */
    function getFreeTicketsAvailable() public view returns (uint256) {
        // Check if a new draw has occurred
        uint256 currentDrawDay = block.timestamp / 1 days;
        uint256 lastDrawDay = lastDrawTime / 1 days;
        if (currentDrawDay > lastDrawDay) {
            return 0; // Expired at last draw
        }
        return freeTicketCredits[msg.sender];
    }
    
    /**
     * @notice Buy ticket using free credits or KLV
     */
    function buyTicket(uint8[5] memory nums, uint8 eb) public payable whenActive {
        require(eb >= 1 && eb <= EIGHT_RANGE, "8B 1-20");
        
        for (uint8 i = 0; i < MAIN_COUNT; i++) {
            require(nums[i] >= 1 && nums[i] <= MAIN_RANGE, "nums 1-50");
            for (uint8 j = i + 1; j < MAIN_COUNT; j++) require(nums[i] != nums[j], "dup");
        }
        
        bool useFree = false;
        
        // Check if user has free credits
        if (freeTicketCredits[msg.sender] > 0 && msg.value == 0) {
            useFree = true;
            freeTicketCredits[msg.sender]--;
        } else {
            require(msg.value == TICKET_PRICE, "!100 KLV");
        }
        
        uint256 poolAmt = useFree ? 0 : (TICKET_PRICE * 85) / 100;
        uint256 projAmt = useFree ? 0 : TICKET_PRICE - poolAmt;
        
        if (!useFree) {
            if (prizePool + poolAmt > MAX_POOL) {
                poolAmt = MAX_POOL - prizePool;
                projAmt = TICKET_PRICE - poolAmt;
                emit PoolCapped(MAX_POOL);
            }
            prizePool += poolAmt;
            if (projAmt > 0 && projectWallet != address(0)) payable(projectWallet).transfer(projAmt);
        }
        
        Ticket memory t = Ticket({
            player: msg.sender,
            mainNumbers: nums,
            eightBall: eb,
            purchaseTime: block.timestamp,
            hasWon: false,
            prizeClaimed: false,
            isFree: useFree
        });
        
        uint256 id = tickets.length;
        tickets.push(t);
        playerTicketIds[msg.sender].push(id);
        totalTicketsSold++;
        emit TicketPurchased(id, msg.sender, nums, eb, useFree);
    }
    
    /**
     * @notice Quick pick with free credits or KLV
     */
    function quickPick() external payable whenActive {
        if (freeTicketCredits[msg.sender] > 0 && msg.value == 0) {
            // Use free ticket
            freeTicketCredits[msg.sender]--;
            bytes32 bh = blockhash(block.number - 1);
            uint8[5] memory nums;
            bool[51] memory used;
            for (uint8 i = 0; i < MAIN_COUNT; i++) {
                uint8 num;
                do { num = uint8(uint256(keccak256(abi.encodePacked(bh, msg.sender, i))) % MAIN_RANGE) + 1; } while (used[num]);
                used[num] = true; nums[i] = num;
            }
            _sort(nums);
            uint8 eb = uint8(uint256(keccak256(abi.encodePacked(bh, msg.sender, uint8(100)))) % EIGHT_RANGE) + 1;
            _createFreeTicket(nums, eb);
        } else {
            require(msg.value == TICKET_PRICE, "!100 KLV");
            bytes32 bh = blockhash(block.number - 1);
            uint8[5] memory nums;
            bool[51] memory used;
            for (uint8 i = 0; i < MAIN_COUNT; i++) {
                uint8 num;
                do { num = uint8(uint256(keccak256(abi.encodePacked(bh, msg.sender, i))) % MAIN_RANGE) + 1; } while (used[num]);
                used[num] = true; nums[i] = num;
            }
            _sort(nums);
            uint8 eb = uint8(uint256(keccak256(abi.encodePacked(bh, msg.sender, uint8(100)))) % EIGHT_RANGE) + 1;
            buyTicket(nums, eb);
        }
    }
    
    function _createFreeTicket(uint8[5] memory nums, uint8 eb) internal {
        Ticket memory t = Ticket({
            player: msg.sender,
            mainNumbers: nums,
            eightBall: eb,
            purchaseTime: block.timestamp,
            hasWon: false,
            prizeClaimed: false,
            isFree: true
        });
        uint256 id = tickets.length;
        tickets.push(t);
        playerTicketIds[msg.sender].push(id);
        totalTicketsSold++;
        emit TicketPurchased(id, msg.sender, nums, eb, true);
    }
    
    // ===== EXISTING FUNCTIONS =====
    
    function startDraw() external whenNoDraw whenActive { require(tickets.length > 0, "!tickets"); drawInProgress = true; emit DrawStarted(block.timestamp); }
    
    function completeDraw() external onlyOwner nonReentrant {
        require(drawInProgress, "!draw"); require(tickets.length > 0, "!tickets");
        bytes32 seed = keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, tickets.length, prizePool, msg.sender));
        bool[51] memory used;
        for (uint8 i = 0; i < MAIN_COUNT; i++) {
            uint8 num;
            do { num = uint8(uint256(keccak256(abi.encodePacked(seed, i))) % MAIN_RANGE) + 1; } while (used[num]);
            used[num] = true; winningNumbers[i] = num;
        }
        _sort(winningNumbers);
        winningEightBall = uint8(uint256(keccak256(abi.encodePacked(seed, uint8(100)))) % EIGHT_RANGE) + 1;
        
        uint256 winners = _distributePrizes();
        prizePool = (prizePool * POOL_RETENTION) / 10000;
        
        // EXPIRE all free tickets at draw time
        _expireAllFreeTickets();
        
        drawInProgress = false; lastDrawTime = block.timestamp;
        emit DrawCompleted(winningNumbers, winningEightBall, prizePool, winners);
    }
    
    /**
     * @notice Expire all free tickets (called at each draw)
     */
    function _expireAllFreeTickets() internal {
        for (uint256 i = 0; i < freeTicketPlayers.length; i++) {
            address player = freeTicketPlayers[i];
            freeTicketCredits[player] = 0;
        }
        // Clear the tracking array
        delete freeTicketPlayers;
    }
    
    function _distributePrizes() internal returns (uint256) {
        uint256 cnt = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].prizeClaimed) continue;
            uint8 tier = _calcTier(tickets[i]);
            if (tier > 0) {
                uint256 prize = _calcPrize(tier);
                if (prize > 0 && prize <= prizePool) {
                    tickets[i].hasWon = true;
                    tickets[i].prizeClaimed = true;
                    prizePool -= prize; cnt++;
                    payable(tickets[i].player).transfer(prize);
                    uint256 kp = _calcKPEPE(tier);
                    if (kp > 0 && kpepeToken != address(0)) kpepePrizesPending[tickets[i].player] += kp;
                    emit PrizeDistributed(tickets[i].player, i, tier, prize);
                }
            }
        }
        return cnt;
    }
    
    function _calcKPEPE(uint8 t) internal view returns (uint256) {
        if (t == 1) return kpepeJackpotPrize;
        if (t == 2) return kpepeMatch5Prize;
        if (t == 3) return kpepeMatch48BPrize;
        if (t == 4) return kpepeMatch4Prize;
        if (t == 5) return kpepeMatch38BPrize;
        if (t == 6) return kpepeMatch3Prize;
        if (t == 7) return kpepeMatch28BPrize;
        if (t == 8) return kpepeMatch18BPrize;
        if (t == 9) return kpepeMatch8BOnlyPrize;
        return 0;
    }
    
    function _calcTier(Ticket memory t) internal view returns (uint8) {
        uint8 matches = 0;
        for (uint8 i = 0; i < MAIN_COUNT; i++) {
            for (uint8 j = 0; j < MAIN_COUNT; j++) if (t.mainNumbers[i] == winningNumbers[j]) { matches++; break; }
        }
        bool ebMatch = t.eightBall == winningEightBall;
        if (matches == 5 && ebMatch) return 1;
        if (matches == 5) return 2;
        if (matches == 4 && ebMatch) return 3;
        if (matches == 4) return 4;
        if (matches == 3 && ebMatch) return 5;
        if (matches == 3) return 6;
        if (matches == 2 && ebMatch) return 7;
        if (matches == 1 && ebMatch) return 8;
        if (ebMatch) return 9;
        return 0;
    }
    
    function _calcPrize(uint8 t) internal view returns (uint256) {
        uint16 pct;
        if (t == 1) pct = PRIZE_JACKPOT;
        else if (t == 2) pct = PRIZE_MATCH5;
        else if (t == 3) pct = PRIZE_4_8B;
        else if (t == 4) pct = PRIZE_4;
        else if (t == 5) pct = PRIZE_3_8B;
        else if (t == 6) pct = PRIZE_3;
        else if (t == 7) pct = PRIZE_2_8B;
        else if (t == 8) pct = PRIZE_1_8B;
        else if (t == 9) pct = PRIZE_8B_ONLY;
        else return 0;
        return (prizePool * pct) / 10000;
    }
    
    function claimKPEPEPrize() external nonReentrant {
        uint256 p = kpepePrizesPending[msg.sender];
        require(p > 0, "!pending"); require(kpepeToken != address(0), "!token");
        kpepePrizesPending[msg.sender] = 0;
        require(IKPEPE(kpepeToken).transfer(msg.sender, p), "fail");
        emit PrizeClaimed(msg.sender, p);
    }
    
    function claimPrize(uint256 id) external nonReentrant {
        require(id < tickets.length, "!id");
        Ticket storage t = tickets[id];
        require(t.player == msg.sender, "!yours");
        require(t.hasWon, "!won"); require(!t.prizeClaimed, "claimed");
        uint8 tier = _calcTier(t);
        uint256 prize = _calcPrize(tier);
        require(prize > 0 && prize <= prizePool, "!prize");
        t.prizeClaimed = true; prizePool -= prize;
        payable(msg.sender).transfer(prize);
        emit PrizeClaimed(msg.sender, prize);
    }
    
    function setKPEPEPrizes(uint256 j, uint256 m5, uint256 m48, uint256 m4, uint256 m38, uint256 m3, uint256 m28, uint256 m18, uint256 m8) external onlyOwner {
        kpepeJackpotPrize = j; kpepeMatch5Prize = m5; kpepeMatch48BPrize = m48; kpepeMatch4Prize = m4;
        kpepeMatch38BPrize = m38; kpepeMatch3Prize = m3; kpepeMatch28BPrize = m28;
        kpepeMatch18BPrize = m18; kpepeMatch8BOnlyPrize = m8;
    }
    
    function withdrawPrizePool(uint256 amt) external onlyOwner nonReentrant {
        require(amt <= prizePool, "!balance"); require(prizePoolWallet != address(0), "!wallet");
        require(amt <= prizePool / 10, "max 10%");
        prizePool -= amt; payable(prizePoolWallet).transfer(amt);
    }
    
    function toggleRound() external onlyOwner { roundActive = !roundActive; }
    
    function emergencyWithdrawKLV() external onlyOwner nonReentrant {
        require(prizePool > MAX_POOL, "!cap");
        uint256 excess = prizePool - MAX_POOL;
        prizePool = MAX_POOL;
        if (excess > 0 && prizePoolWallet != address(0)) payable(prizePoolWallet).transfer(excess);
    }
    
    // ===== ADMIN FUNCTIONS =====
    
    function setProjectWallet(address w) external onlyOwner { require(w != address(0)); projectWallet = w; emit WalletUpdated("Project", w); }
    function setPrizePoolWallet(address w) external onlyOwner { require(w != address(0)); prizePoolWallet = w; emit WalletUpdated("Pool", w); }
    function initializeWallets(address pw, address ppw) external onlyOwner {
        require(projectWallet == address(0), "set");
        require(pw != address(0) && ppw != address(0));
        projectWallet = pw; prizePoolWallet = ppw;
        emit WalletUpdated("Project", pw); emit WalletUpdated("Pool", ppw);
    }
    function setKPEPEToken(address t) external onlyOwner { require(t != address(0)); kpepeToken = t; }
    function setKPEPEStaking(address s) external onlyOwner { kpepeStaking = s; }
    
    function setTierConfig(uint8 tierId, uint256 minStake, uint8 ticketsPerDay, string calldata name) external onlyOwner {
        require(tierId == 1, "single tier");
        tiers[0] = TierConfig({minStake: minStake, ticketsPerDay: ticketsPerDay, tierId: tierId, name: name});
        emit StakingTierUpdated(tierId, name, minStake, ticketsPerDay);
    }
    
    // ===== VIEW FUNCTIONS =====
    
    function getPendingKPEPE(address a) external view returns (uint256) { return kpepePrizesPending[a]; }
    function getPoolBalance() external view returns (uint256) { return prizePool; }
    function getTierInfo(uint8 tierId) external view returns (uint256 minStake, uint8 ticketsPerDay, string memory name) {
        require(tierId == 1, "!id");
        return (tiers[0].minStake, tiers[0].ticketsPerDay, tiers[0].name);
    }
    function getFreeTicketPlayersCount() external view returns (uint256) { return freeTicketPlayers.length; }
    function getNextDrawTime() external view returns (uint256) {
        uint256 nextDraw = (lastDrawTime / 1 days + 1) * 1 days;
        return nextDraw;
    }
    
    function getTicket(uint256 id) external view returns (address, uint8[5] memory, uint8, uint256, bool, bool, bool) {
        require(id < tickets.length, "!id"); Ticket storage t = tickets[id];
        return (t.player, t.mainNumbers, t.eightBall, t.purchaseTime, t.hasWon, t.prizeClaimed, t.isFree);
    }
    
    function checkTicketResult(uint256 id) external view returns (uint8 tier, uint256 prize) {
        require(id < tickets.length, "!id"); require(tickets[id].player == msg.sender, "!yours");
        tier = _calcTier(tickets[id]); if (tier > 0) prize = _calcPrize(tier);
    }
    
    function getPlayerTickets(address a) external view returns (uint256[] memory) { return playerTicketIds[a]; }
    
    function _sort(uint8[5] memory arr) internal pure {
        for (uint8 i = 0; i < 5; i++) for (uint8 j = i + 1; j < 5; j++) if (arr[i] > arr[j]) { uint8 tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
    }
    
    receive() external payable {}
}
