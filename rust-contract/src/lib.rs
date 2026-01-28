#![no_std]

extern crate wee_alloc;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

klever_sc::imports!();

// Constants
const TICKET_PRICE: u64 = 100_000_000; // 1 KLV (8 decimals)
const POOL_SHARE_PERCENTAGE: u64 = 85; // 85% to pool
const PROJECT_SHARE_PERCENTAGE: u64 = 15; // 15% to project
const MAX_POOL_BALANCE: u64 = 1_000_000_000_000_000; // 1M KLV (8 decimals)

#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub struct Ticket<M: ManagedTypeApi> {
    pub player: ManagedAddress<M>,
    pub numbers: [u8; 5],
    pub eight_ball: u8,
    pub timestamp: u64,
    pub prize_claimed: bool,
}

#[klever_sc::contract]
pub trait KPEPEJackpot: ContractBase {
    #[init]
    fn init(&self) {
        self.draw_interval().set(86400u64); // 24 hours
        self.last_draw_time().set(self.blockchain().get_block_timestamp());
        self.round_active().set(true);
        self.kpepe_token().set(&ManagedBuffer::new()); // Empty until set
        self.total_tickets_sold().set(0u64);
    }

    // ==================== Storage Mappers ====================

    #[storage_mapper("draw_interval")]
    fn draw_interval(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("last_draw_time")]
    fn last_draw_time(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("round_active")]
    fn round_active(&self) -> SingleValueMapper<bool>;

    #[storage_mapper("project_wallet")]
    fn project_wallet(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("prize_pool_wallet")]
    fn prize_pool_wallet(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("prize_pool")]
    fn prize_pool(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("winning_numbers")]
    fn winning_numbers(&self) -> SingleValueMapper<ManagedVec<u8>>;

    #[storage_mapper("winning_eight_ball")]
    fn winning_eight_ball(&self) -> SingleValueMapper<u8>;

    #[storage_mapper("draw_in_progress")]
    fn draw_in_progress(&self) -> SingleValueMapper<bool>;

    #[storage_mapper("tickets")]
    fn tickets(&self) -> VecMapper<Ticket<Self::Api>>;

    #[storage_mapper("player_tickets")]
    fn player_tickets(&self, player: &ManagedAddress) -> VecMapper<u64>;

    #[storage_mapper("kpepe_token")]
    fn kpepe_token(&self) -> SingleValueMapper<ManagedBuffer>;

    #[storage_mapper("total_tickets_sold")]
    fn total_tickets_sold(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("player_prizes")]
    fn player_prizes(&self, player: &ManagedAddress) -> SingleValueMapper<BigUint>;

    // ==================== Owner Functions ====================

    #[only_owner]
    #[endpoint]
    fn initialize_wallets(&self, project_wallet: ManagedAddress, prize_pool_wallet: ManagedAddress) {
        require!(!project_wallet.is_zero(), "Invalid project wallet");
        require!(!prize_pool_wallet.is_zero(), "Invalid prize pool wallet");
        
        self.project_wallet().set(&project_wallet);
        self.prize_pool_wallet().set(&prize_pool_wallet);
    }

    #[only_owner]
    #[endpoint]
    fn set_kpepe_token(&self, token_id: ManagedBuffer) {
        require!(!token_id.is_empty(), "Invalid token ID");
        self.kpepe_token().set(&token_id);
    }

    #[only_owner]
    #[endpoint]
    fn toggle_round(&self) {
        let current = self.round_active().get();
        self.round_active().set(!current);
    }

    #[only_owner]
    #[endpoint]
    fn start_draw(&self) {
        require!(!self.draw_in_progress().get(), "Draw already in progress");
        self.draw_in_progress().set(true);
    }

    #[only_owner]
    #[endpoint]
    fn complete_draw(&self, winning_nums: ManagedVec<u8>, winning_eb: u8) {
        require!(self.draw_in_progress().get(), "No draw in progress");
        require!(winning_nums.len() == 5, "Invalid number count");
        require!(winning_eb > 0 && winning_eb <= 20, "Invalid eight ball");
        
        // Verify all winning numbers are valid
        for i in 0..5 {
            let num = winning_nums.get(i);
            require!(num > 0 && num <= 50, "Invalid winning number");
        }
        
        self.winning_numbers().set(&winning_nums);
        self.winning_eight_ball().set(winning_eb);
        self.draw_in_progress().set(false);
        self.last_draw_time().set(self.blockchain().get_block_timestamp());
        self.round_active().set(true); // Start new round
    }

    #[only_owner]
    #[endpoint]
    fn withdraw_project_funds(&self, amount: BigUint) {
        let project_wallet = self.project_wallet().get();
        require!(!project_wallet.is_zero(), "Project wallet not set");
        
        // Send KLV to project wallet
        self.send().direct_klv(&project_wallet, &amount);
    }

    // ==================== User Functions ====================

    #[endpoint]
    #[payable("KLV")]
    fn buy_ticket(&self, num1: u8, num2: u8, num3: u8, num4: u8, num5: u8, eb: u8) {
        require!(self.round_active().get(), "Round not active");
        require!(eb > 0 && eb <= 20, "Eight ball must be 1-20");
        
        // Validate all numbers
        require!(num1 > 0 && num1 <= 50, "Invalid number 1");
        require!(num2 > 0 && num2 <= 50, "Invalid number 2");
        require!(num3 > 0 && num3 <= 50, "Invalid number 3");
        require!(num4 > 0 && num4 <= 50, "Invalid number 4");
        require!(num5 > 0 && num5 <= 50, "Invalid number 5");
        
        // Verify payment
        let payment = self.call_value().klv_value();
        require!(payment == BigUint::from(TICKET_PRICE), "Incorrect payment amount");
        
        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();
        
        // Calculate splits
        let pool_amount = &payment * POOL_SHARE_PERCENTAGE / 100u64;
        let project_amount = &payment - &pool_amount;
        
        // Check pool cap
        let current_pool = self.prize_pool().get();
        let new_pool = current_pool.clone() + pool_amount;
        
        if new_pool > BigUint::from(MAX_POOL_BALANCE) {
            // Cap the pool, refund excess to project
            let excess = new_pool - MAX_POOL_BALANCE;
            self.prize_pool().set(&BigUint::from(MAX_POOL_BALANCE));
            
            let refund = project_amount + excess;
            self.send().direct_klv(&self.project_wallet().get(), &refund);
        } else {
            // Normal case: update pool and send project share
            self.prize_pool().set(&new_pool);
            self.send().direct_klv(&self.project_wallet().get(), &project_amount);
        }
        
        // Create and store ticket
        let ticket = Ticket {
            player: caller.clone(),
            numbers: [num1, num2, num3, num4, num5],
            eight_ball: eb,
            timestamp: current_time,
            prize_claimed: false,
        };
        
        let ticket_id = self.tickets().len();
        self.tickets().push(&ticket);
        self.player_tickets(&caller).push(&ticket_id);
        self.total_tickets_sold().set(self.total_tickets_sold().get() + 1);
    }

    #[endpoint]
    fn claim_prize(&self, ticket_id: u64) {
        let caller = self.blockchain().get_caller();
        
        // Get ticket
        let mut ticket = self.tickets().get(ticket_id);
        require!(ticket.player == caller, "Not ticket owner");
        require!(!ticket.prize_claimed, "Prize already claimed");
        
        // Check draw is complete
        require!(!self.draw_in_progress().get(), "Draw not completed");
        
        // Calculate matches
        let winning_numbers = self.winning_numbers().get();
        let winning_eb = self.winning_eight_ball().get();
        
        let main_matches = self.count_main_matches(&ticket.numbers, &winning_numbers);
        let eb_match = ticket.eight_ball == winning_eb;
        
        // Calculate prize
        let prize = self.calculate_prize(main_matches, eb_match);
        
        if prize > BigUint::zero() {
            // Mark as claimed
            ticket.prize_claimed = true;
            self.tickets().set(ticket_id, &ticket);
            
            // Send prize to player
            self.send().direct_klv(&caller, &prize);
        }
    }

    #[endpoint]
    fn claim_kpepe_prize(&self, ticket_id: u64) {
        let caller = self.blockchain().get_caller();
        
        // Get ticket
        let mut ticket = self.tickets().get(ticket_id);
        require!(ticket.player == caller, "Not ticket owner");
        require!(!ticket.prize_claimed, "Prize already claimed");
        
        // Check draw is complete
        require!(!self.draw_in_progress().get(), "Draw not completed");
        
        // Get KPEPE token ID
        let kpepe_token = self.kpepe_token().get();
        require!(!kpepe_token.is_empty(), "KPEPE token not configured");
        
        // Calculate matches
        let winning_numbers = self.winning_numbers().get();
        let winning_eb = self.winning_eight_ball().get();
        
        let main_matches = self.count_main_matches(&ticket.numbers, &winning_numbers);
        let eb_match = ticket.eight_ball == winning_eb;
        
        // Calculate KPEPE prize (different from KLV)
        let kpepe_prize = self.calculate_kpepe_prize(main_matches, eb_match);
        
        if kpepe_prize > BigUint::zero() {
            // Mark as claimed
            ticket.prize_claimed = true;
            self.tickets().set(ticket_id, &ticket);
            
            // Send KPEPE tokens to player
            self.send()
                .direct(
                    &caller,
                    kpepe_token.as_slice(),
                    0,
                    &kpepe_prize,
                );
        }
    }

    // ==================== View Functions ====================

    #[view]
    fn get_pool_balance(&self) -> BigUint {
        self.prize_pool().get()
    }

    #[view]
    fn get_next_draw_time(&self) -> u64 {
        self.last_draw_time().get() + self.draw_interval().get()
    }

    #[view]
    fn get_winning_numbers(&self) -> ManagedVec<u8> {
        self.winning_numbers().get()
    }

    #[view]
    fn get_winning_eight_ball(&self) -> u8 {
        self.winning_eight_ball().get()
    }

    #[view]
    fn get_ticket(&self, ticket_id: u64) -> Option<Ticket<Self::Api>> {
        if ticket_id < self.tickets().len() {
            Some(self.tickets().get(ticket_id))
        } else {
            None
        }
    }

    #[view]
    fn get_player_tickets(&self, player: ManagedAddress) -> ManagedVec<u64> {
        let mut player_ticket_ids = ManagedVec::new();
        for ticket_id in self.player_tickets(&player).iter() {
            player_ticket_ids.push(ticket_id);
        }
        player_ticket_ids
    }

    #[view]
    fn get_total_tickets_sold(&self) -> u64 {
        self.total_tickets_sold().get()
    }

    #[view]
    fn is_round_active(&self) -> bool {
        self.round_active().get()
    }

    #[view]
    fn is_draw_in_progress(&self) -> bool {
        self.draw_in_progress().get()
    }

    // ==================== Internal Functions ====================

    fn count_main_matches(&self, ticket_numbers: &[u8; 5], winning_numbers: &ManagedVec<u8>) -> u8 {
        let mut matches = 0u8;
        for i in 0..5 {
            for j in 0..5 {
                if ticket_numbers[i] == winning_numbers.get(j) {
                    matches += 1;
                    break;
                }
            }
        }
        matches
    }

    fn calculate_prize(&self, main_matches: u8, eight_ball_match: bool) -> BigUint {
        let pool = self.get_pool_balance();
        
        match (main_matches, eight_ball_match) {
            (5, true) => pool * 40u64 / 100u64,    // Jackpot: 40% of pool
            (5, false) => pool * 15u64 / 100u64,   // Match 5: 15% of pool
            (4, true) => pool * 8u64 / 100u64,     // Match 4+EB: 8% of pool
            (4, false) => pool * 5u64 / 100u64,    // Match 4: 5% of pool
            (3, true) => pool * 6u64 / 100u64,     // Match 3+EB: 6% of pool
            (3, false) => pool * 45u64 / 1000u64,  // Match 3: 4.5% of pool
            (2, true) => pool * 3u64 / 100u64,     // Match 2+EB: 3% of pool
            (1, true) => pool * 15u64 / 1000u64,   // Match 1+EB: 1.5% of pool
            (0, true) => pool * 125u64 / 10000u64, // EB only: 1.25% of pool
            _ => BigUint::zero(),
        }
    }

    fn calculate_kpepe_prize(&self, main_matches: u8, eight_ball_match: bool) -> BigUint {
        // KPEPE prizes (in KPEPE tokens, 8 decimals)
        match (main_matches, eight_ball_match) {
            (5, true) => BigUint::from(500_000_000_000_000u64),    // Jackpot: 500,000 KPEPE
            (5, false) => BigUint::from(100_000_000_000_000u64),   // Match 5: 100,000 KPEPE
            (4, true) => BigUint::from(50_000_000_000_000u64),     // Match 4+EB: 50,000 KPEPE
            (4, false) => BigUint::from(25_000_000_000_000u64),    // Match 4: 25,000 KPEPE
            (3, true) => BigUint::from(10_000_000_000_000u64),     // Match 3+EB: 10,000 KPEPE
            (3, false) => BigUint::from(5_000_000_000_000u64),     // Match 3: 5,000 KPEPE
            (2, true) => BigUint::from(1_000_000_000_000u64),      // Match 2+EB: 1,000 KPEPE
            (1, true) => BigUint::from(500_000_000_000u64),        // Match 1+EB: 500 KPEPE
            (0, true) => BigUint::from(100_000_000_000u64),        // EB only: 100 KPEPE
            _ => BigUint::zero(),
        }
    }
}

// WASM entry points - explicit exports for WASM module
#[no_mangle]
pub extern "C" fn init() {
    endpoints::init::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn initialize_wallets() {
    endpoints::initialize_wallets::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn toggle_round() {
    endpoints::toggle_round::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn start_draw() {
    endpoints::start_draw::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn complete_draw() {
    endpoints::complete_draw::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn get_pool_balance() {
    endpoints::get_pool_balance::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn get_next_draw_time() {
    endpoints::get_next_draw_time::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn get_winning_numbers() {
    endpoints::get_winning_numbers::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn get_winning_eight_ball() {
    endpoints::get_winning_eight_ball::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn buy_ticket() {
    endpoints::buy_ticket::<klever_sc_wasm_adapter::api::VmApiImpl>();
}

#[no_mangle]
pub extern "C" fn claim_prize() {
    endpoints::claim_prize::<klever_sc_wasm_adapter::api::VmApiImpl>();
}
