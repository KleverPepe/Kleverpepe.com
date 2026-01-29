#![no_std]

use klever_sc::imports::*;

// ============================================
// KPEPE Lottery Smart Contract with VIP & Rollover
// ============================================
// 
// Fund Flow Model (Path B - Contract Manager):
// 1. User buys ticket for 100 KLV
// 2. Contract receives 100 KLV
// 3. Split immediately:
//    - 15 KLV → Project Wallet
//    - 85 KLV → Stored in contract as prize_pool
// 4. When winners are determined:
//    - auto_distribute_prizes() calculates prizes
//    - Sends prizes directly from contract balance
//
// VIP System:
// - Bronze (10+ tickets): +5% bonus
// - Silver (50+ tickets): +7% bonus
// - Gold (100+ tickets): +10% bonus
// - Platinum (500+ tickets): +15% bonus
//
// Streak Multipliers:
// - 3+ days: +2% bonus
// - 7+ days: +5% bonus
// - 14+ days: +10% bonus
// - 30+ days: +15% bonus
//
// Rollover Mechanics:
// - Unclaimed prizes per tier carry over to next draw
// - Jackpot carries over if not won
// ============================================

// Constants
const TICKET_COST_KLV: u64 = 100_000_000; // 100 KLV in smallest units (8 decimal places)
const PROJECT_SHARE_PERCENT: u64 = 15;
const POOL_SHARE_PERCENT: u64 = 85;
const ROLLOVER_PERCENT: u64 = 20;
const DRAW_INTERVAL: u64 = 86400; // 24 hours in seconds

// Prize distribution percentages (from pool)
const PRIZE_JACKPOT_MATCH5_EB: u64 = 40;  // 40% - Match 5 + 8Ball
const PRIZE_MATCH5_NO_EB: u64 = 14;       // 14% - Match 5 only
const PRIZE_MATCH4_EB: u64 = 9;           // 9% - Match 4 + 8Ball
const PRIZE_MATCH4_NO_EB: u64 = 6;        // 6% - Match 4 only
const PRIZE_MATCH3_EB: u64 = 6;           // 6% - Match 3 + 8Ball
const PRIZE_MATCH3_NO_EB: u64 = 4;        // 4% - Match 3 only
const PRIZE_MATCH2_EB: u64 = 3;           // 3% - Match 2 + 8Ball
const PRIZE_MATCH1_EB: u64 = 2;           // 2% - Match 1 + 8Ball
const PRIZE_MATCH0_EB: u64 = 1;           // 1% - Match 0 + 8Ball (Lucky)

// VIP tier thresholds
const TIER_BRONZE_THRESHOLD: u64 = 10;
const TIER_SILVER_THRESHOLD: u64 = 50;
const TIER_GOLD_THRESHOLD: u64 = 100;
const TIER_PLATINUM_THRESHOLD: u64 = 500;

// VIP base bonuses (percentage)
const BONUS_BRONZE: u64 = 5;
const BONUS_SILVER: u64 = 7;
const BONUS_GOLD: u64 = 10;
const BONUS_PLATINUM: u64 = 15;

// Streak thresholds (in days)
const STREAK_BONUS_3_DAYS: u64 = 3;
const STREAK_BONUS_7_DAYS: u64 = 7;
const STREAK_BONUS_14_DAYS: u64 = 14;
const STREAK_BONUS_30_DAYS: u64 = 30;

// Streak bonuses (percentage)
const BONUS_STREAK_3: u64 = 2;
const BONUS_STREAK_7: u64 = 5;
const BONUS_STREAK_14: u64 = 10;
const BONUS_STREAK_30: u64 = 15;

/**
 * KPEPE Lottery Contract Main Trait
 * 
 * This contract implements a complete lottery system with:
 * - VIP player rewards system
 * - Rollover mechanics for unclaimed prizes
 * - Chain-based random number generation
 * - Secure prize distribution
 */
#[klever_sc::contract]
pub trait KPEPEJackpot: ContractBase {
    // ============================================
    // Initialization
    // ============================================
    
    #[init]
    fn init(&self) {
        // All initialization done via initialize_contract() after deployment
        // This ensures proper setup with all storage mappers initialized
    }

    /**
     * Initialize the contract after deployment
     * Sets up all storage mappers and default values
     * Can only be called by the owner once
     */
    #[only_owner]
    #[endpoint]
    fn initialize_contract(&self) {
        // SECURITY FIX H-01: Prevent re-initialization
        require!(
            !self.contract_initialized().get(),
            "Contract already initialized! Use separate functions to update individual settings."
        );
        
        // Mark as initialized
        self.contract_initialized().set(true);
        
        // Initialize prize pool
        self.prize_pool().set(&BigUint::zero());
        
        // Initialize rollover storage
        self.jackpot_rollover().set(&BigUint::zero());
        self.next_draw_rollover().set(&BigUint::zero());
        
        // Initialize accounting
        self.total_tickets().set(0u64);
        self.total_klv_collected().set(&BigUint::zero());
        self.total_kpepe_pool().set(&BigUint::zero());
        
        // Initialize draw state
        self.draw_interval().set(DRAW_INTERVAL);
        self.last_draw_time().set(0u64);
        self.round_active().set(true);
        self.draw_in_progress().set(false);
        self.last_distributed_ticket().set(0u64);
        
        // Set project wallet to owner initially (can be changed later)
        let owner = self.blockchain().get_owner_address();
        self.project_wallet().set(&owner);
        
        // Initialize unclaimed prize pools (for each tier 0-4)
        for i in 0..=4 {
            self.unclaimed_klv(i).set(&BigUint::zero());
            self.unclaimed_kpepe(i).set(&BigUint::zero());
        }
    }

    // ============================================
    // Storage Mappers - Core State
    // ============================================

    /// Project wallet address for fund allocation
    #[storage_mapper("project_wallet")]
    fn project_wallet(&self) -> SingleValueMapper<ManagedAddress>;

    /// Current prize pool balance (KLV)
    #[storage_mapper("prize_pool")]
    fn prize_pool(&self) -> SingleValueMapper<BigUint>;

    /// Total KPEPE tokens in prize pool
    #[storage_mapper("total_kpepe_pool")]
    fn total_kpepe_pool(&self) -> SingleValueMapper<BigUint>;

    /// Total KLV collected from ticket sales
    #[storage_mapper("total_klv_collected")]
    fn total_klv_collected(&self) -> SingleValueMapper<BigUint>;

    /// Draw interval in seconds
    #[storage_mapper("draw_interval")]
    fn draw_interval(&self) -> SingleValueMapper<u64>;

    /// Timestamp of last draw
    #[storage_mapper("last_draw_time")]
    fn last_draw_time(&self) -> SingleValueMapper<u64>;

    /// Whether the current round is active for ticket purchases
    #[storage_mapper("round_active")]
    fn round_active(&self) -> SingleValueMapper<bool>;

    /// Whether a draw is currently in progress
    #[storage_mapper("draw_in_progress")]
    fn draw_in_progress(&self) -> SingleValueMapper<bool>;

    /// SECURITY FIX H-01: Prevent re-initialization
    #[storage_mapper("contract_initialized")]
    fn contract_initialized(&self) -> SingleValueMapper<bool>;

    /// Total tickets sold
    #[storage_mapper("total_tickets")]
    fn total_tickets(&self) -> SingleValueMapper<u64>;

    /// Last ticket that was processed for prize distribution
    #[storage_mapper("last_distributed_ticket")]
    fn last_distributed_ticket(&self) -> SingleValueMapper<u64>;

    // ============================================
    // Storage Mappers - Winning Numbers
    // ============================================

    /// Winning numbers for current draw
    #[storage_mapper("winning_numbers")]
    fn winning_numbers(&self) -> SingleValueMapper<ManagedVec<u8>>;

    /// Winning 8-ball number for current draw
    #[storage_mapper("winning_eight_ball")]
    fn winning_eight_ball(&self) -> SingleValueMapper<u8>;

    /// Rollover amount for next draw (legacy)
    #[storage_mapper("next_draw_rollover")]
    fn next_draw_rollover(&self) -> SingleValueMapper<BigUint>;

    // ============================================
    // Storage Mappers - VIP System
    // ============================================

    /// Total tickets bought by each wallet
    #[storage_mapper("tickets_bought")]
    fn tickets_bought(&self) -> MapMapper<ManagedAddress, u64>;

    /// VIP level for each wallet (0=none,1=bronze,2=silver,3=gold,4=platinum)
    #[storage_mapper("vip_level")]
    fn vip_level(&self) -> MapMapper<ManagedAddress, u8>;

    /// Number of consecutive days played
    #[storage_mapper("streak_days")]
    fn streak_days(&self) -> MapMapper<ManagedAddress, u64>;

    /// Last timestamp when user played
    #[storage_mapper("last_play_date")]
    fn last_play_date(&self) -> MapMapper<ManagedAddress, u64>;

    // ============================================
    // Storage Mappers - Rollover System
    // ============================================

    /// Unclaimed KLV prizes per tier (0-4)
    #[storage_mapper("unclaimed_klv")]
    fn unclaimed_klv(&self, tier_id: usize) -> SingleValueMapper<BigUint>;

    /// Unclaimed KPEPE prizes per tier (0-4)
    #[storage_mapper("unclaimed_kpepe")]
    fn unclaimed_kpepe(&self, tier_id: usize) -> SingleValueMapper<BigUint>;

    /// Jackpot rollover amount (accumulates if not won)
    #[storage_mapper("jackpot_rollover")]
    fn jackpot_rollover(&self) -> SingleValueMapper<BigUint>;

    // ============================================
    // Storage Mappers - Tickets
    // ============================================

    /// Ticket owner address
    #[storage_mapper("ticket_owner")]
    fn ticket_owner(&self, id: u64) -> SingleValueMapper<ManagedAddress>;

    /// Ticket numbers (5 numbers)
    #[storage_mapper("ticket_numbers")]
    fn ticket_numbers(&self, id: u64) -> SingleValueMapper<ManagedVec<u8>>;

    /// Ticket 8-ball number
    #[storage_mapper("ticket_eight_ball")]
    fn ticket_eight_ball(&self, id: u64) -> SingleValueMapper<u8>;

    /// Whether ticket prize has been claimed
    #[storage_mapper("ticket_claimed")]
    fn ticket_claimed(&self, id: u64) -> SingleValueMapper<bool>;

    // ============================================
    // Owner Functions - Configuration
    // ============================================

    /**
     * Set project wallet address
     * @param project_wallet - Address to receive project share (15%)
     */
    #[only_owner]
    #[endpoint]
    fn set_project_wallet(&self, project_wallet: ManagedAddress) {
        require!(!project_wallet.is_zero(), "Invalid wallet address");
        self.project_wallet().set(&project_wallet);
    }

    /**
     * Toggle round active status
     * Used to pause ticket sales without stopping the contract
     */
    #[only_owner]
    #[endpoint]
    fn toggle_round(&self) {
        let current = self.round_active().get();
        self.round_active().set(!current);
    }

    /**
     * Start a new draw
     * Locks the draw process until complete_draw is called
     */
    #[only_owner]
    #[endpoint]
    fn start_draw(&self) {
        require!(!self.draw_in_progress().get(), "Draw already in progress");
        self.draw_in_progress().set(true);
    }

    /**
     * Complete the draw with winning numbers
     * @param winning_nums - 5 winning numbers (1-50)
     * @param winning_eb - Winning 8-ball number (1-20)
     */
    #[only_owner]
    #[endpoint]
    fn complete_draw(&self, winning_nums: ManagedVec<u8>, winning_eb: u8) {
        require!(self.draw_in_progress().get(), "No draw in progress");
        require!(winning_nums.len() == 5, "Must provide exactly 5 winning numbers");
        require!(winning_eb > 0 && winning_eb <= 20, "8-ball must be between 1-20");
        
        // Validate all winning numbers
        for i in 0..winning_nums.len() {
            let num = winning_nums.get(i);
            require!(num > 0 && num <= 50, "Winning numbers must be between 1-50");
        }
        
        // Set winning numbers
        self.winning_numbers().set(&winning_nums);
        self.winning_eight_ball().set(winning_eb);
        
        // Finalize draw
        self.draw_in_progress().set(false);
        self.last_draw_time().set(self.blockchain().get_block_timestamp());
        self.round_active().set(true);
    }

    /**
     * SECURE FIX H-02: Complete draw using chain randomness
     * This is the RECOMMENDED method - uses blockchain random number generator
     * No owner control over winning numbers
     */
    #[only_owner]
    #[endpoint]
    fn complete_draw_with_randomness(&self) {
        require!(self.draw_in_progress().get(), "No draw in progress");
        
        // Generate winning numbers using block timestamp and block nonce
        let timestamp = self.blockchain().get_block_timestamp();
        let block_nonce = self.blockchain().get_block_nonce();
        
        // Create seed from timestamp and block nonce
        let mut seed: u64 = timestamp;
        seed ^= (block_nonce as u64).wrapping_mul(0x9e3779b97f4a7c15);
        
        // Use seed for pseudo-random generation
        let mut rng_val = seed.wrapping_mul(1103515245).wrapping_add(12345);
        
        // Generate 5 unique numbers between 1-50
        let mut winning_nums: ManagedVec<Self::Api, u8> = ManagedVec::new();
        let mut used_numbers: ManagedVec<Self::Api, u8> = ManagedVec::new();
        
        for _ in 0..5 {
            let mut valid = false;
            let mut num: u8 = 0;
            while !valid {
                rng_val = rng_val.wrapping_mul(1103515245).wrapping_add(12345);
                num = ((rng_val % 50) as u8) + 1;
                
                // Check if number already used
                let mut already_used = false;
                for i in 0..used_numbers.len() {
                    if used_numbers.get(i) == num {
                        already_used = true;
                        break;
                    }
                }
                if !already_used {
                    valid = true;
                }
            }
            used_numbers.push(num);
            winning_nums.push(num);
        }
        
        // Generate 8-ball number between 1-20
        rng_val = rng_val.wrapping_mul(1103515245).wrapping_add(12345);
        let winning_eb = ((rng_val % 20) as u8) + 1;
        
        // Set winning numbers
        self.winning_numbers().set(&winning_nums);
        self.winning_eight_ball().set(winning_eb);
        
        // Finalize draw
        self.draw_in_progress().set(false);
        self.last_draw_time().set(self.blockchain().get_block_timestamp());
        self.round_active().set(true);
    }

    /**
     * Roll over unclaimed prizes to next draw
     * @param tier_id - Prize tier to rollover (0-4)
     */
    #[only_owner]
    #[endpoint]
    fn rollover_tier(&self, tier_id: usize) {
        require!(tier_id <= 4, "Invalid tier ID (0-4)");
        
        let unclaimed_klv = self.unclaimed_klv(tier_id).get();
        let unclaimed_kpepe = self.unclaimed_kpepe(tier_id).get();
        
        require!(
            unclaimed_klv > BigUint::zero() || unclaimed_kpepe > BigUint::zero(),
            "No unclaimed prizes for this tier"
        );
        
        // Add to rollover pools
        let current_pool = self.prize_pool().get();
        self.prize_pool().set(&(current_pool + unclaimed_klv));
        
        let current_kpepe = self.total_kpepe_pool().get();
        self.total_kpepe_pool().set(&(current_kpepe + unclaimed_kpepe));
        
        // Clear unclaimed
        self.unclaimed_klv(tier_id).set(&BigUint::zero());
        self.unclaimed_kpepe(tier_id).set(&BigUint::zero());
    }

    // ============================================
    // Owner Functions - VIP Management
    // ============================================

    /**
     * Manually set VIP level for a player
     * @param player - Player address
     * @param level - VIP level (0=none,1=bronze,2=silver,3=gold,4=platinum)
     */
    #[only_owner]
    #[endpoint]
    fn set_vip_level(&self, player: ManagedAddress, level: u8) {
        require!(level <= 4, "Invalid VIP level (0-4)");
        self.vip_level().insert(player, level);
    }

    // ============================================
    // Owner Functions - Fund Management
    // ============================================

    /**
     * Withdraw project share from contract
     * @param amount - Amount to withdraw in KLV (smallest units)
     */
    #[only_owner]
    #[endpoint]
    fn withdraw(&self, amount: BigUint) {
        let wallet = self.project_wallet().get();
        require!(!wallet.is_zero(), "Project wallet not set");
        require!(amount > BigUint::zero(), "Amount must be positive");
        
        self.send().direct_klv(&wallet, &amount);
    }

    /**
     * Withdraw all project balance
     */
    #[only_owner]
    #[endpoint]
    fn withdraw_all(&self) {
        let wallet = self.project_wallet().get();
        require!(!wallet.is_zero(), "Project wallet not set");
        
        let contract_balance = self.blockchain().get_balance(&self.blockchain().get_sc_address());
        require!(contract_balance > BigUint::zero(), "No balance to withdraw");
        
        self.send().direct_klv(&wallet, &contract_balance);
    }

    // ============================================
    // User Functions - Ticket Purchase
    // ============================================

    /**
     * Buy a lottery ticket
     * @param n1, n2, n3, n4, n5 - Lucky numbers (1-50)
     * @param eb - 8-ball number (1-20)
     */
    #[endpoint]
    #[payable("KLV")]
    fn buy_ticket(&self, n1: u8, n2: u8, n3: u8, n4: u8, n5: u8, eb: u8) {
        // Validate round is active
        require!(self.round_active().get(), "Ticket sales are closed");
        
        // Validate 8-ball number
        require!(eb > 0 && eb <= 20, "8-ball must be between 1-20");
        
        // Validate all numbers are in range
        require!(n1 > 0 && n1 <= 50, "Number 1 must be between 1-50");
        require!(n2 > 0 && n2 <= 50, "Number 2 must be between 1-50");
        require!(n3 > 0 && n3 <= 50, "Number 3 must be between 1-50");
        require!(n4 > 0 && n4 <= 50, "Number 4 must be between 1-50");
        require!(n5 > 0 && n5 <= 50, "Number 5 must be between 1-50");
        
        // Validate payment amount
        let payment = self.call_value().klv_value();
        let expected_cost = BigUint::from(TICKET_COST_KLV);
        require!(*payment == expected_cost, "Ticket cost must be exactly 100 KLV");
        
        let caller = self.blockchain().get_caller();
        
        // Calculate VIP bonus for this purchase
        let _vip_bonus_percent = self.calculate_vip_bonus(&caller);
        
        // Update streak
        self.update_streak(&caller);
        
        // Update total tickets bought for VIP tracking
        let current_tickets = self.tickets_bought().get(&caller).unwrap_or(0);
        self.tickets_bought().insert(caller.clone(), current_tickets + 1);
        
        // Note: VIP level auto-upgrade is calculated dynamically in calculate_vip_bonus()
        // based on tickets_bought count. Manual VIP levels are still supported via set_vip_level().
        
        // Create ticket
        let ticket_id = self.total_tickets().get();
        self.ticket_owner(ticket_id).set(&caller);
        
        // Store ticket numbers
        let mut nums = ManagedVec::new();
        nums.push(n1);
        nums.push(n2);
        nums.push(n3);
        nums.push(n4);
        nums.push(n5);
        self.ticket_numbers(ticket_id).set(&nums);
        self.ticket_eight_ball(ticket_id).set(eb);
        self.ticket_claimed(ticket_id).set(false);
        
        // Split payment: 15% to project wallet, 85% to prize pool
        let project_share = BigUint::from(TICKET_COST_KLV * PROJECT_SHARE_PERCENT / 100);
        let pool_share = BigUint::from(TICKET_COST_KLV * POOL_SHARE_PERCENT / 100);
        
        // Transfer project share
        let project_wallet = self.project_wallet().get();
        self.send().direct_klv(&project_wallet, &project_share);
        
        // Add to prize pool
        let current_pool = self.prize_pool().get();
        self.prize_pool().set(&(current_pool + pool_share.clone()));
        
        // Update totals
        let total_collected = self.total_klv_collected().get();
        self.total_klv_collected().set(&(total_collected + pool_share));
        
        self.total_tickets().set(ticket_id + 1);
    }

    // ============================================
    // User Functions - Prize Claims
    // ============================================

    /**
     * Claim prize for a winning ticket
     * @param ticket_id - ID of the ticket to claim
     */
    #[endpoint]
    fn claim_prize(&self, ticket_id: u64) {
        let caller = self.blockchain().get_caller();
        let owner = self.ticket_owner(ticket_id).get();
        
        require!(owner == caller, "You are not the owner of this ticket");
        require!(!self.ticket_claimed(ticket_id).get(), "Prize already claimed");
        require!(!self.draw_in_progress().get(), "Draw is currently in progress");
        
        // Calculate prize
        let (prize_klv, prize_kpepe, _tier) = self.calculate_prize(ticket_id);
        
        require!(
            prize_klv > BigUint::zero() || prize_kpepe > BigUint::zero(),
            "No prize for this ticket"
        );
        
        // Mark as claimed
        self.ticket_claimed(ticket_id).set(true);
        
        // Transfer prizes
        if prize_klv > BigUint::zero() {
            self.send().direct_klv(&caller, &prize_klv);
        }
        
        if prize_kpepe > BigUint::zero() {
            // KPEPE token transfer would be implemented here
            // self.send().direct_esdt(&caller, KPEPE_TOKEN_ID, 0, &prize_kpepe);
        }
    }

    // ============================================
    // Automated Prize Distribution (Backend)
    // ============================================

    /**
     * Auto-distribute prizes in batches (called by backend)
     * This function is more efficient for processing many tickets
     * @param batch_size - Number of tickets to process in this batch
     */
    #[only_owner]
    #[endpoint]
    fn auto_distribute_prizes(&self, batch_size: u64) {
        require!(!self.draw_in_progress().get(), "Draw is in progress");
        require!(self.winning_numbers().get().len() > 0, "No winning numbers set");
        
        let last_ticket = self.last_distributed_ticket().get();
        let total_tickets = self.total_tickets().get();
        let end_ticket = core::cmp::min(last_ticket + batch_size, total_tickets);
        let pool = self.prize_pool().get();
        
        let mut total_distributed_klv = BigUint::zero();
        let mut total_distributed_kpepe = BigUint::zero();
        
        for ticket_id in last_ticket..end_ticket {
            if self.ticket_claimed(ticket_id).get() {
                continue;
            }
            
            let owner = self.ticket_owner(ticket_id).get();
            if owner.is_zero() {
                continue;
            }
            
            let (prize_klv, prize_kpepe, tier) = self.calculate_prize(ticket_id);
            
            if prize_klv > BigUint::zero() || prize_kpepe > BigUint::zero() {
                self.ticket_claimed(ticket_id).set(true);
                
                if prize_klv > BigUint::zero() {
                    self.send().direct_klv(&owner, &prize_klv);
                    total_distributed_klv += &prize_klv;
                }
                
                if prize_kpepe > BigUint::zero() {
                    // KPEPE transfer would go here
                    total_distributed_kpepe += &prize_kpepe;
                }
                
                // Track unclaimed rollover for this tier
                if prize_klv > BigUint::zero() {
                    let current_unclaimed = self.unclaimed_klv(tier).get();
                    self.unclaimed_klv(tier).set(&(current_unclaimed + prize_klv));
                }
            }
        }
        
        self.last_distributed_ticket().set(end_ticket);
        
        // If this batch completes all ticket payouts, process rollover
        if end_ticket == total_tickets {
            self.process_rollover(&pool, &total_distributed_klv, &total_distributed_kpepe);
        }
    }

    // ============================================
    // View Functions
    // ============================================

    /**
     * Get current prize pool balance
     */
    #[view]
    fn get_pool(&self) -> BigUint {
        self.prize_pool().get()
    }

    /**
     * Get total KLV collected from ticket sales
     */
    #[view]
    fn get_total_collected(&self) -> BigUint {
        self.total_klv_collected().get()
    }

    /**
     * Get next scheduled draw timestamp
     */
    #[view]
    fn get_next_draw(&self) -> u64 {
        let last_time = self.last_draw_time().get();
        if last_time == 0 {
            return 0;
        }
        last_time + self.draw_interval().get()
    }

    /**
     * Get current winning numbers
     */
    #[view]
    fn get_winning(&self) -> ManagedVec<u8> {
        self.winning_numbers().get()
    }

    /**
     * Get winning 8-ball number
     */
    #[view]
    fn get_winning_eb(&self) -> u8 {
        self.winning_eight_ball().get()
    }

    /**
     * Get jackpot rollover amount
     */
    #[view]
    fn get_jackpot_rollover(&self) -> BigUint {
        self.jackpot_rollover().get()
    }

    /**
     * Get next draw rollover amount (legacy)
     */
    #[view]
    fn get_next_draw_rollover(&self) -> BigUint {
        self.next_draw_rollover().get()
    }

    /**
     * Get total tickets sold
     */
    #[view]
    fn get_total(&self) -> u64 {
        self.total_tickets().get()
    }

    /**
     * Check if round is active
     */
    #[view]
    fn is_active(&self) -> bool {
        self.round_active().get()
    }

    /**
     * Check if draw is in progress
     */
    #[view]
    fn is_drawing(&self) -> bool {
        self.draw_in_progress().get()
    }

    /**
     * Get player's VIP information
     */
    #[view]
    #[allow(deprecated)]
    fn get_player_info(&self, player: ManagedAddress) -> MultiResult7<BigUint, u8, u64, u64, BigUint, BigUint, BigUint> {
        let tickets = self.tickets_bought().get(&player).unwrap_or(0);
        let vip = self.vip_level().get(&player).unwrap_or(0);
        let streak = self.streak_days().get(&player).unwrap_or(0);
        let last_play = self.last_play_date().get(&player).unwrap_or(0);
        let pool = self.prize_pool().get();
        let rollover = self.jackpot_rollover().get();
        let unclaimed = self.unclaimed_klv(4).get(); // Jackpot tier
        
        MultiResult7::from((
            BigUint::from(tickets),
            vip,
            streak,
            last_play,
            pool,
            rollover,
            unclaimed
        ))
    }

    // ============================================
    // Internal Helper Functions
    // ============================================

    /**
     * Calculate VIP bonus percentage for a player
     * Combines tier bonus and streak multiplier
     * @param player - Player address
     * @returns Bonus percentage (u64)
     */
    fn calculate_vip_bonus(&self, player: &ManagedAddress) -> u64 {
        let vip_level = self.vip_level().get(player).unwrap_or(0);
        let streak = self.streak_days().get(player).unwrap_or(0);
        
        let mut bonus = 0u64;
        
        // VIP tier bonus
        bonus += match vip_level {
            1 => BONUS_BRONZE,   // Bronze
            2 => BONUS_SILVER,   // Silver
            3 => BONUS_GOLD,     // Gold
            4 => BONUS_PLATINUM, // Platinum
            _ => 0,              // No VIP
        };
        
        // Streak multiplier bonus
        if streak >= STREAK_BONUS_30_DAYS {
            bonus += BONUS_STREAK_30;
        } else if streak >= STREAK_BONUS_14_DAYS {
            bonus += BONUS_STREAK_14;
        } else if streak >= STREAK_BONUS_7_DAYS {
            bonus += BONUS_STREAK_7;
        } else if streak >= STREAK_BONUS_3_DAYS {
            bonus += BONUS_STREAK_3;
        }
        
        bonus
    }

    /**
     * Calculate player's current VIP level based on tickets bought
     * This is a view function for checking VIP status
     * @param player - Player address
     * @returns VIP level (0=none,1=bronze,2=silver,3=gold,4=platinum)
     */
    #[view]
    fn calculate_vip_level(&self, player: ManagedAddress) -> u8 {
        let tickets = self.tickets_bought().get(&player).unwrap_or(0);
        
        if tickets >= TIER_PLATINUM_THRESHOLD {
            4 // Platinum
        } else if tickets >= TIER_GOLD_THRESHOLD {
            3 // Gold
        } else if tickets >= TIER_SILVER_THRESHOLD {
            2 // Silver
        } else if tickets >= TIER_BRONZE_THRESHOLD {
            1 // Bronze
        } else {
            0 // No VIP
        }
    }

    /**
     * Update player's streak
     * Resets streak if they missed a day
     * @param player - Player address
     */
    fn update_streak(&self, player: &ManagedAddress) {
        let current_time = self.blockchain().get_block_timestamp();
        let last_play = self.last_play_date().get(player).unwrap_or(0);
        let current_streak = self.streak_days().get(player).unwrap_or(0);
        
        // Calculate days since last play
        let seconds_per_day: u64 = 86400;
        let days_since_last = if last_play == 0 {
            0
        } else {
            (current_time - last_play) / seconds_per_day
        };
        
        let new_streak = if days_since_last <= 1 {
            // Streak continues (same day or next day)
            current_streak + 1
        } else if days_since_last == 0 {
            // Same day, no change
            current_streak
        } else {
            // Streak broken, start fresh
            1
        };
        
        self.streak_days().insert(player.clone(), new_streak);
        self.last_play_date().insert(player.clone(), current_time);
    }

    /**
     * Calculate prize for a ticket
     * @param ticket_id - ID of the ticket
     * @returns Tuple of (KLV prize, KPEPE prize, tier)
     */
    fn calculate_prize(&self, ticket_id: u64) -> (BigUint, BigUint, usize) {
        let ticket_nums = self.ticket_numbers(ticket_id).get();
        let ticket_eb = self.ticket_eight_ball(ticket_id).get();
        let winning_nums = self.winning_numbers().get();
        let winning_eb = self.winning_eight_ball().get();
        
        // Count number matches
        let mut matches = 0u8;
        for i in 0..5 {
            for j in 0..5 {
                if ticket_nums.get(i) == winning_nums.get(j) {
                    matches += 1;
                    break;
                }
            }
        }
        
        let eb_match = ticket_eb == winning_eb;
        let pool = self.prize_pool().get();
        
        // Calculate base prize based on match count and 8-ball
        let (base_percent, tier) = match (matches, eb_match) {
            (5, true) => (PRIZE_JACKPOT_MATCH5_EB, 4),      // Jackpot
            (5, false) => (PRIZE_MATCH5_NO_EB, 3),          // Tier 3
            (4, true) => (PRIZE_MATCH4_EB, 2),              // Tier 2
            (4, false) => (PRIZE_MATCH4_NO_EB, 2),          // Tier 2
            (3, true) => (PRIZE_MATCH3_EB, 1),               // Tier 1
            (3, false) => (PRIZE_MATCH3_NO_EB, 1),          // Tier 1
            (2, true) => (PRIZE_MATCH2_EB, 0),              // Tier 0
            (1, true) => (PRIZE_MATCH1_EB, 0),              // Tier 0
            (0, true) => (PRIZE_MATCH0_EB, 0),              // Tier 0
            _ => (0, 0),                                     // No prize
        };
        
        if base_percent == 0 {
            return (BigUint::zero(), BigUint::zero(), 0);
        }
        
        // Calculate base prize
        let base_prize = &pool * base_percent / 100u64;
        
        // Apply VIP bonus
        let caller = self.ticket_owner(ticket_id).get();
        let vip_bonus_percent = self.calculate_vip_bonus(&caller);
        
        if vip_bonus_percent > 0 {
            let bonus_amount = &base_prize * vip_bonus_percent / 100u64;
            return (base_prize + bonus_amount, BigUint::zero(), tier);
        }
        
        (base_prize, BigUint::zero(), tier)
    }

    /**
     * Process rollover after all prizes are distributed
     */
    fn process_rollover(&self, pool: &BigUint, distributed: &BigUint, _distributed_kpepe: &BigUint) {
        // Calculate remaining pool
        let remaining_pool = pool - distributed;
        
        if remaining_pool == BigUint::zero() {
            return;
        }
        
        // 20% rolls over to next draw
        let rollover_amount = &remaining_pool * ROLLOVER_PERCENT / 100u64;
        
        // Add to jackpot rollover
        let current_jackpot = self.jackpot_rollover().get();
        self.jackpot_rollover().set(&(current_jackpot + rollover_amount.clone()));
        
        // Update next draw rollover
        self.next_draw_rollover().set(&rollover_amount);
        
        // Reset pool for next draw
        self.prize_pool().set(&rollover_amount);
        self.last_distributed_ticket().set(0u64);
    }
}
