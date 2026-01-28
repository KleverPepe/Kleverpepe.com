// KPEPE Jackpot Lottery - C++ for KleverChain
// Based on Solidity original by KPEPE Team

#include <klever/kvk.hpp>

using namespace klever::kvk;

class KPEPEJackpot : public Contract {
public:
    static constexpr const char* CONTRACT_NAME = "kpepe-jackpot";
    static constexpr const uint64_t VERSION = 1;
    
    // Constants
    static const uint64_t TICKET_PRICE = 10000000000ULL; // 100 KLV with 8 decimals
    static const uint8_t MAIN_COUNT = 5;
    static const uint8_t EIGHT_RANGE = 20;
    static const uint8_t MAIN_RANGE = 50;
    
    // Prize percentages (basis points)
    static const uint64_t PRIZE_JACKPOT = 4000;
    static const uint64_t PRIZE_MATCH5 = 1500;
    static const uint64_t PRIZE_4_8B = 800;
    static const uint64_t PRIZE_4 = 500;
    static const uint64_t PRIZE_3_8B = 600;
    static const uint64_t PRIZE_3 = 450;
    static const uint64_t PRIZE_2_8B = 300;
    static const uint64_t PRIZE_1_8B = 150;
    static const uint64_t PRIZE_8B_ONLY = 125;
    static const uint64_t POOL_RETENTION = 1975;
    static const uint64_t MAX_POOL = 100000000000000ULL; // 1M KLV
    
    static const uint64_t MIN_STAKE_FOR_FREE = 5000000000000ULL; // 50K KPEPE
    static const uint8_t FREE_TICKETS_PER_DAY = 1;

    // Storage
    Map<Address, std::string> projectWallet;
    Map<Address, std::string> prizePoolWallet;
    Map<Address, std::string> kpepeToken;
    Map<Address, std::string> kpepeStaking;
    
    Map<Address, uint64_t> prizePool;
    Map<Address, uint64_t> totalTicketsSold;
    Map<Address, uint64_t> lastDrawTime;
    Map<Address, bool> drawInProgress;
    Map<Address, bool> roundActive;
    
    Map<Address, uint64_t> kpepePrizesPending;
    Map<Address, uint64_t> freeTicketCredits;
    Map<Address, uint64_t> lastFreeTicketClaim;
    
    Vector<Ticket> tickets;
    Map<Address, Vector<uint64_t>> playerTicketIds;
    
    Map<Address, Array<uint8_t, 5>> winningNumbers;
    Map<Address, uint8_t> winningEightBall;
    
    Map<Address, uint64_t> kpepeJackpotPrize;
    Map<Address, uint64_t> kpepeMatch5Prize;
    Map<Address, uint64_t> kpepeMatch48BPrize;
    Map<Address, uint64_t> kpepeMatch4Prize;
    Map<Address, uint64_t> kpepeMatch38BPrize;
    Map<Address, uint64_t> kpepeMatch3Prize;
    Map<Address, uint64_t> kpepeMatch28BPrize;
    Map<Address, uint64_t> kpepeMatch18BPrize;
    Map<Address, uint64_t> kpepeMatch8BOnlyPrize;
    
    Map<Address, Vector<Address>> freeTicketPlayers;
    Map<Address, bool> isFreeTicketPlayer;

    struct Ticket {
        Address player;
        Array<uint8_t, 5> mainNumbers;
        uint8_t eightBall;
        uint64_t purchaseTime;
        bool hasWon;
        bool prizeClaimed;
        bool isFree;
    };

    // Constructor
    KPEPEJackpot() {
        setDependable();
        auto& ctx = getContext();
        ctx.setPayable(true);
        
        // Initialize defaults
        auto& ra = roundActive[ctx.getCaller()];
        ra = true;
        
        auto& ldt = lastDrawTime[ctx.getCaller()];
        ldt = ctx.getBlockTimestamp();
    }

    // ===== TICKET PURCHASE =====
    
    void buyTicket(Array<uint8_t, 5> nums, uint8_t eb) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(roundActive[caller], "Round not active");
        require(eb >= 1 && eb <= EIGHT_RANGE, "Eight ball 1-20");
        
        for (uint8_t i = 0; i < MAIN_COUNT; i++) {
            require(nums[i] >= 1 && nums[i] <= MAIN_RANGE, "Numbers 1-50");
            for (uint8_t j = i + 1; j < MAIN_COUNT; j++) {
                require(nums[i] != nums[j], "Duplicate numbers");
            }
        }
        
        bool useFree = false;
        
        // Check free credits
        if (freeTicketCredits[caller] > 0 && ctx.getAssetValue() == 0) {
            useFree = true;
            freeTicketCredits[caller]--;
        } else {
            require(ctx.getAssetValue() == TICKET_PRICE, "Must send 100 KLV");
        }
        
        uint64_t poolAmt = 0;
        uint64_t projAmt = 0;
        
        if (!useFree) {
            poolAmt = (TICKET_PRICE * 85) / 100;
            projAmt = TICKET_PRICE - poolAmt;
            
            auto& pool = prizePool[caller];
            if (pool + poolAmt > MAX_POOL) {
                poolAmt = MAX_POOL - pool;
                projAmt = TICKET_PRICE - poolAmt;
            }
            pool += poolAmt;
            
            if (projAmt > 0 && projectWallet.count(caller) > 0) {
                ctx.transfer(Address::fromString(projectWallet[caller]), projAmt);
            }
        }
        
        // Create ticket
        Ticket t;
        t.player = caller;
        t.mainNumbers = nums;
        t.eightBall = eb;
        t.purchaseTime = ctx.getBlockTimestamp();
        t.hasWon = false;
        t.prizeClaimed = false;
        t.isFree = useFree;
        
        tickets.push(t);
        auto id = tickets.size() - 1;
        playerTicketIds[caller].push(id);
        
        totalTicketsSold[caller]++;
        
        // Emit event
        ctx.emit("TicketPurchased", t.toString());
    }
    
    // ===== QUICK PICK =====
    
    void quickPick() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(roundActive[caller], "Round not active");
        
        Array<uint8_t, 5> nums;
        uint8_t eb;
        
        if (freeTicketCredits[caller] > 0 && ctx.getAssetValue() == 0) {
            freeTicketCredits[caller]--;
            generateRandomNumbers(nums, eb, caller);
            createFreeTicket(nums, eb);
        } else {
            require(ctx.getAssetValue() == TICKET_PRICE, "Must send 100 KLV");
            generateRandomNumbers(nums, eb, caller);
            buyTicket(nums, eb);
        }
    }
    
    // ===== FREE TICKETS =====
    
    void claimFreeTickets() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(roundActive[caller], "Round not active");
        
        // Check staking - simplified for now
        // In real implementation, call staking contract
        
        require(lastFreeTicketClaim[caller] + 86400 < ctx.getBlockTimestamp(), "Cooldown active");
        
        freeTicketCredits[caller]++;
        lastFreeTicketClaim[caller] = ctx.getBlockTimestamp();
        
        ctx.emit("FreeTicketsClaimed", caller.toString() + ":1");
    }
    
    // ===== DRAW FUNCTIONS =====
    
    void startDraw() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(!drawInProgress[caller], "Draw already in progress");
        require(tickets.size() > 0, "No tickets to draw");
        
        drawInProgress[caller] = true;
        ctx.emit("DrawStarted", std::to_string(ctx.getBlockTimestamp()));
    }
    
    void completeDraw() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(ctx.isCallerContractOwner(), "Not owner");
        require(drawInProgress[caller], "No draw in progress");
        require(tickets.size() > 0, "No tickets");
        
        // Generate winning numbers
        generateWinningNumbers(caller);
        
        // Distribute prizes
        uint64_t winners = distributePrizes(caller);
        
        // Update pool
        auto& pool = prizePool[caller];
        pool = (pool * POOL_RETENTION) / 10000;
        
        // Expire free tickets
        expireFreeTickets(caller);
        
        drawInProgress[caller] = false;
        lastDrawTime[caller] = ctx.getBlockTimestamp();
        
        ctx.emit("DrawCompleted", "Draw complete: " + std::to_string(winners) + " winners");
    }
    
    // ===== PRIZE CLAIMS =====
    
    void claimPrize(uint64_t ticketId) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(ticketId < tickets.size(), "Invalid ticket");
        
        Ticket& t = tickets[ticketId];
        require(t.player == caller, "Not your ticket");
        require(t.hasWon, "Ticket did not win");
        require(!t.prizeClaimed, "Prize already claimed");
        
        uint8_t tier = calculateTier(t);
        uint64_t prize = calculatePrize(tier, caller);
        
        require(prize > 0, "No prize");
        
        t.prizeClaimed = true;
        auto& pool = prizePool[caller];
        pool -= prize;
        
        ctx.transfer(caller, prize);
        ctx.emit("PrizeClaimed", caller.toString() + ":" + std::to_string(prize));
    }
    
    void claimKPEPEPrize() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        uint64_t pending = kpepePrizesPending[caller];
        require(pending > 0, "No pending KPEPE");
        
        kpepePrizesPending[caller] = 0;
        
        // Transfer KPEPE tokens
        // Would need token contract integration
        ctx.emit("KPEPEPrizeClaimed", caller.toString() + ":" + std::to_string(pending));
    }
    
    // ===== ADMIN FUNCTIONS =====
    
    void initializeWallets(std::string pw, std::string ppw) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(ctx.isCallerContractOwner(), "Not owner");
        require(projectWallet.count(caller) == 0, "Already initialized");
        
        projectWallet[caller] = pw;
        prizePoolWallet[caller] = ppw;
        
        ctx.emit("WalletsInitialized", pw + "," + ppw);
    }
    
    void setKPEPEToken(std::string token) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        require(ctx.isCallerContractOwner(), "Not owner");
        kpepeToken[caller] = token;
    }
    
    void setKPEPEStaking(std::string staking) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        require(ctx.isCallerContractOwner(), "Not owner");
        kpepeStaking[caller] = staking;
    }
    
    void toggleRound() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        require(ctx.isCallerContractOwner(), "Not owner");
        roundActive[caller] = !roundActive[caller];
    }
    
    void setKPEPEPrizes(uint64_t j, uint64_t m5, uint64_t m48, uint64_t m4, uint64_t m38, uint64_t m3, uint64_t m28, uint64_t m18, uint64_t m8) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        require(ctx.isCallerContractOwner(), "Not owner");
        
        kpepeJackpotPrize[caller] = j;
        kpepeMatch5Prize[caller] = m5;
        kpepeMatch48BPrize[caller] = m48;
        kpepeMatch4Prize[caller] = m4;
        kpepeMatch38BPrize[caller] = m38;
        kpepeMatch3Prize[caller] = m3;
        kpepeMatch28BPrize[caller] = m28;
        kpepeMatch18BPrize[caller] = m18;
        kpepeMatch8BOnlyPrize[caller] = m8;
    }
    
    void withdrawPrizePool(uint64_t amt) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        require(ctx.isCallerContractOwner(), "Not owner");
        require(prizePool.count(caller) > 0, "No pool");
        require(amt <= prizePool[caller], "Insufficient balance");
        require(amt <= prizePool[caller] / 10, "Max 10%");
        
        prizePool[caller] -= amt;
        
        if (prizePoolWallet.count(caller) > 0) {
            ctx.transfer(Address::fromString(prizePoolWallet[caller]), amt);
        }
    }
    
    // ===== VIEW FUNCTIONS =====
    
    uint64_t getPoolBalance() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        return prizePool.count(caller) > 0 ? prizePool[caller] : 0;
    }
    
    uint64_t getFreeTicketsAvailable() {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        // Check if new draw occurred
        if (lastDrawTime.count(caller) > 0) {
            uint64_t currentDay = ctx.getBlockTimestamp() / 86400;
            uint64_t lastDrawDay = lastDrawTime[caller] / 86400;
            if (currentDay > lastDrawDay) {
                return 0;
            }
        }
        return freeTicketCredits[caller];
    }
    
    // ===== INTERNAL HELPERS =====
    
    void generateRandomNumbers(Array<uint8_t, 5>& nums, uint8_t& eb, Address& caller) {
        auto& ctx = getContext();
        
        bool used[51] = {false};
        
        for (uint8_t i = 0; i < MAIN_COUNT; i++) {
            uint64_t rand = ctx.getRandom(caller.toString() + std::to_string(i));
            uint8_t num = (rand % MAIN_RANGE) + 1;
            while (used[num]) {
                rand = ctx.getRandom(caller.toString() + std::to_string(i) + "x");
                num = (rand % MAIN_RANGE) + 1;
            }
            used[num] = true;
            nums[i] = num;
        }
        
        sortArray(nums);
        
        uint64_t randEB = ctx.getRandom(caller.toString() + "100");
        eb = (randEB % EIGHT_RANGE) + 1;
    }
    
    void generateWinningNumbers(Address& caller) {
        auto& ctx = getContext();
        
        bool used[51] = {false};
        
        for (uint8_t i = 0; i < MAIN_COUNT; i++) {
            uint64_t rand = ctx.getRandom("draw" + std::to_string(i));
            uint8_t num = (rand % MAIN_RANGE) + 1;
            while (used[num]) {
                rand = ctx.getRandom("draw" + std::to_string(i) + "x");
                num = (rand % MAIN_RANGE) + 1;
            }
            used[num] = true;
            winningNumbers[caller][i] = num;
        }
        
        sortArray(winningNumbers[caller]);
        
        uint64_t randEB = ctx.getRandom("draw100");
        winningEightBall[caller] = (randEB % EIGHT_RANGE) + 1;
    }
    
    void sortArray(Array<uint8_t, 5>& arr) {
        for (uint8_t i = 0; i < MAIN_COUNT - 1; i++) {
            for (uint8_t j = 0; j < MAIN_COUNT - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    uint8_t tmp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = tmp;
                }
            }
        }
    }
    
    uint8_t calculateTier(Ticket& t) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        uint8_t matches = 0;
        for (uint8_t i = 0; i < MAIN_COUNT; i++) {
            for (uint8_t j = 0; j < MAIN_COUNT; j++) {
                if (t.mainNumbers[i] == winningNumbers[caller][j]) {
                    matches++;
                    break;
                }
            }
        }
        
        bool ebMatch = (t.eightBall == winningEightBall[caller]);
        
        if (matches == 5 && ebMatch) return 1;  // Jackpot
        if (matches == 5) return 2;             // Match 5
        if (matches == 4 && ebMatch) return 3;  // 4 + 8B
        if (matches == 4) return 4;             // Match 4
        if (matches == 3 && ebMatch) return 5;  // 3 + 8B
        if (matches == 3) return 6;             // Match 3
        if (matches == 2 && ebMatch) return 7;  // 2 + 8B
        if (matches == 1 && ebMatch) return 8;  // 1 + 8B
        if (ebMatch) return 9;                  // 8B only
        
        return 0;
    }
    
    uint64_t calculatePrize(uint8_t tier, Address& caller) {
        auto& pool = prizePool[caller];
        uint64_t pct = 0;
        
        switch (tier) {
            case 1: pct = PRIZE_JACKPOT; break;
            case 2: pct = PRIZE_MATCH5; break;
            case 3: pct = PRIZE_4_8B; break;
            case 4: pct = PRIZE_4; break;
            case 5: pct = PRIZE_3_8B; break;
            case 6: pct = PRIZE_3; break;
            case 7: pct = PRIZE_2_8B; break;
            case 8: pct = PRIZE_1_8B; break;
            case 9: pct = PRIZE_8B_ONLY; break;
            default: return 0;
        }
        
        return (pool * pct) / 10000;
    }
    
    uint64_t distributePrizes(Address& caller) {
        uint64_t winners = 0;
        
        for (uint64_t i = 0; i < tickets.size(); i++) {
            Ticket& t = tickets[i];
            if (t.prizeClaimed) continue;
            
            uint8_t tier = calculateTier(t);
            if (tier > 0) {
                uint64_t prize = calculatePrize(tier, caller);
                if (prize > 0 && prize <= prizePool[caller]) {
                    t.hasWon = true;
                    t.prizeClaimed = true;
                    prizePool[caller] -= prize;
                    winners++;
                    
                    // Transfer prize
                    auto& ctx = getContext();
                    ctx.transfer(t.player, prize);
                    
                    // Calculate KPEPE prize
                    uint64_t kp = calculateKPEPE(tier);
                    if (kp > 0) {
                        kpepePrizesPending[t.player] += kp;
                    }
                }
            }
        }
        
        return winners;
    }
    
    uint64_t calculateKPEPE(uint8_t tier) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        switch (tier) {
            case 1: return kpepeJackpotPrize[caller];
            case 2: return kpepeMatch5Prize[caller];
            case 3: return kpepeMatch48BPrize[caller];
            case 4: return kpepeMatch4Prize[caller];
            case 5: return kpepeMatch38BPrize[caller];
            case 6: return kpepeMatch3Prize[caller];
            case 7: return kpepeMatch28BPrize[caller];
            case 8: return kpepeMatch18BPrize[caller];
            case 9: return kpepeMatch8BOnlyPrize[caller];
            default: return 0;
        }
    }
    
    void createFreeTicket(Array<uint8_t, 5> nums, uint8_t eb) {
        auto& ctx = getContext();
        auto caller = ctx.getCaller();
        
        Ticket t;
        t.player = caller;
        t.mainNumbers = nums;
        t.eightBall = eb;
        t.purchaseTime = ctx.getBlockTimestamp();
        t.hasWon = false;
        t.prizeClaimed = false;
        t.isFree = true;
        
        tickets.push(t);
        uint64_t id = tickets.size() - 1;
        playerTicketIds[caller].push(id);
        
        totalTicketsSold[caller]++;
        ctx.emit("TicketPurchased", "Free ticket: " + std::to_string(id));
    }
    
    void expireFreeTickets(Address& caller) {
        for (uint64_t i = 0; i < freeTicketPlayers[caller].size(); i++) {
            Address player = freeTicketPlayers[caller][i];
            freeTicketCredits[player] = 0;
        }
        freeTicketPlayers[caller].clear();
    }
    
    // ===== FALLBACK =====
    
    void receive() {
        // Accept KLV deposits
    }
};

KVK_REGISTER(KPEPEJackpot, "kpepe-jackpot");
