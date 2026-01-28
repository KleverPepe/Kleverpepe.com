#![no_std]

klever_sc::imports!();

// Draw interval (24 hours in seconds)
const DRAW_INTERVAL: u64 = 86400;

/**
 * FUND FLOW MODEL (Path B - Contract Manager)
 * 
 * This contract manages all funds internally:
 * 1. User buys ticket for 100 KLV
 * 2. Contract receives 100 KLV
 * 3. Split immediately:
 *    - 15 KLV → Project Wallet (klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9)
 *    - 85 KLV → Stored in contract memory as `prize_pool` counter
 * 4. When winners are determined:
 *    - auto_distribute_prizes() calculates prizes from stored pool amount
 *    - Sends prizes directly from contract balance
 * 
 * Note: Prize pool wallet (klv1zz5...) is NOT used for fund transfers.
 * Contract is the sole fund manager. All payouts come from contract balance.
 */

#[klever_sc::contract]
pub trait KPEPEJackpot: ContractBase {
    #[init]
    fn init(&self) {
        // Everything is hardcoded - no parameters needed!
        // Just deploy and it's ready to go
        
        self.prize_pool().set(&BigUint::zero());
        self.draw_interval().set(DRAW_INTERVAL);
        self.last_draw_time().set(self.blockchain().get_block_timestamp());
        self.round_active().set(true);
        self.total_tickets().set(0u64);
        self.last_distributed_ticket().set(0u64);
        
        // Set project wallet to owner (pre-configured address)
        let owner = self.blockchain().get_owner_address();
        self.project_wallet().set(&owner);
    }

    // Storage
    #[storage_mapper("draw_interval")]
    fn draw_interval(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("last_draw_time")]
    fn last_draw_time(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("round_active")]
    fn round_active(&self) -> SingleValueMapper<bool>;

    #[storage_mapper("project_wallet")]
    fn project_wallet(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("prize_pool")]
    fn prize_pool(&self) -> SingleValueMapper<BigUint>;

    #[storage_mapper("winning_numbers")]
    fn winning_numbers(&self) -> SingleValueMapper<ManagedVec<u8>>;

    #[storage_mapper("winning_eight_ball")]
    fn winning_eight_ball(&self) -> SingleValueMapper<u8>;

    #[storage_mapper("draw_in_progress")]
    fn draw_in_progress(&self) -> SingleValueMapper<bool>;

    #[storage_mapper("total_tickets")]
    fn total_tickets(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("ticket_owner")]
    fn ticket_owner(&self, id: u64) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("ticket_numbers")]
    fn ticket_numbers(&self, id: u64) -> SingleValueMapper<ManagedVec<u8>>;

    #[storage_mapper("ticket_eight_ball")]
    fn ticket_eight_ball(&self, id: u64) -> SingleValueMapper<u8>;

    #[storage_mapper("ticket_claimed")]
    fn ticket_claimed(&self, id: u64) -> SingleValueMapper<bool>;

    #[storage_mapper("last_distributed_ticket")]
    fn last_distributed_ticket(&self) -> SingleValueMapper<u64>;

    // Owner Functions
    #[only_owner]
    #[endpoint]
    fn initialize_wallets(&self, project_wallet: ManagedAddress) {
        require!(!project_wallet.is_zero(), "Invalid wallet");
        self.project_wallet().set(&project_wallet);
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
        require!(!self.draw_in_progress().get(), "Draw in progress");
        self.draw_in_progress().set(true);
    }

    #[only_owner]
    #[endpoint]
    fn complete_draw(&self, winning_nums: ManagedVec<u8>, winning_eb: u8) {
        require!(self.draw_in_progress().get(), "No draw");
        require!(winning_nums.len() == 5, "Need 5 numbers");
        require!(winning_eb > 0 && winning_eb <= 20, "Bad EB");
        
        for i in 0..winning_nums.len() {
            let num = winning_nums.get(i);
            require!(num > 0 && num <= 50, "Bad number");
        }
        
        self.winning_numbers().set(&winning_nums);
        self.winning_eight_ball().set(winning_eb);
        self.draw_in_progress().set(false);
        self.last_draw_time().set(self.blockchain().get_block_timestamp());
        self.round_active().set(true);
    }

    #[only_owner]
    #[endpoint]
    fn withdraw(&self, amount: BigUint) {
        let wallet = self.project_wallet().get();
        require!(!wallet.is_zero(), "Wallet not set");
        self.send().direct_klv(&wallet, &amount);
    }

    // User Functions
    #[endpoint]
    #[payable("KLV")]
    fn buy_ticket(&self, n1: u8, n2: u8, n3: u8, n4: u8, n5: u8, eb: u8) {
        require!(self.round_active().get(), "Closed");
        require!(eb > 0 && eb <= 20, "Bad EB");
        require!(n1 > 0 && n1 <= 50, "Bad n1");
        require!(n2 > 0 && n2 <= 50, "Bad n2");
        require!(n3 > 0 && n3 <= 50, "Bad n3");
        require!(n4 > 0 && n4 <= 50, "Bad n4");
        require!(n5 > 0 && n5 <= 50, "Bad n5");
        
        let payment = self.call_value().klv_value();
        let expected = BigUint::from(100_000_000u64);
        require!(*payment == expected, "Wrong amount");
        
        let caller = self.blockchain().get_caller();
        let ticket_id = self.total_tickets().get();
        
        self.ticket_owner(ticket_id).set(&caller);
        let mut nums = ManagedVec::new();
        nums.push(n1);
        nums.push(n2);
        nums.push(n3);
        nums.push(n4);
        nums.push(n5);
        self.ticket_numbers(ticket_id).set(&nums);
        self.ticket_eight_ball(ticket_id).set(eb);
        self.ticket_claimed(ticket_id).set(false);
        
        let pool_share = BigUint::from(85_000_000u64);
        let project_share = BigUint::from(15_000_000u64);
        
        let current = self.prize_pool().get();
        self.prize_pool().set(&(current + pool_share));
        
        let wallet = self.project_wallet().get();
        if !wallet.is_zero() {
            self.send().direct_klv(&wallet, &project_share);
        }
        
        self.total_tickets().set(ticket_id + 1);
    }

    #[endpoint]
    fn claim_prize(&self, ticket_id: u64) {
        let caller = self.blockchain().get_caller();
        let owner = self.ticket_owner(ticket_id).get();
        require!(owner == caller, "Not owner");
        require!(!self.ticket_claimed(ticket_id).get(), "Claimed");
        require!(!self.draw_in_progress().get(), "Draw active");
        
        let ticket_nums = self.ticket_numbers(ticket_id).get();
        let ticket_eb = self.ticket_eight_ball(ticket_id).get();
        let winning_nums = self.winning_numbers().get();
        let winning_eb = self.winning_eight_ball().get();
        
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
        
        let prize = match (matches, eb_match) {
            (5, true) => &pool * 40u64 / 100u64,
            (5, false) => &pool * 15u64 / 100u64,
            (4, true) => &pool * 8u64 / 100u64,
            (4, false) => &pool * 5u64 / 100u64,
            (3, true) => &pool * 6u64 / 100u64,
            (3, false) => &pool * 45u64 / 1000u64,
            (2, true) => &pool * 3u64 / 100u64,
            (1, true) => &pool * 15u64 / 1000u64,
            (0, true) => &pool * 125u64 / 10000u64,
            _ => BigUint::zero(),
        };
        
        if prize > BigUint::zero() {
            self.ticket_claimed(ticket_id).set(true);
            self.send().direct_klv(&caller, &prize);
        }
    }

    // View Functions
    #[view]
    fn get_pool(&self) -> BigUint {
        self.prize_pool().get()
    }

    #[view]
    fn get_next_draw(&self) -> u64 {
        self.last_draw_time().get() + self.draw_interval().get()
    }

    #[view]
    fn get_winning(&self) -> ManagedVec<u8> {
        self.winning_numbers().get()
    }

    #[view]
    fn get_winning_eb(&self) -> u8 {
        self.winning_eight_ball().get()
    }

    #[view]
    fn get_total(&self) -> u64 {
        self.total_tickets().get()
    }

    #[view]
    fn is_active(&self) -> bool {
        self.round_active().get()
    }

    #[view]
    fn is_drawing(&self) -> bool {
        self.draw_in_progress().get()
    }

    // Auto-Payout Function (called by backend after draw)
    #[only_owner]
    #[endpoint]
    fn auto_distribute_prizes(&self, batch_size: u64) {
        require!(!self.draw_in_progress().get(), "Draw in progress");
        require!(self.winning_numbers().get().len() > 0, "No winning numbers set");
        
        let mut last_ticket = self.last_distributed_ticket().get();
        let total_tickets = self.total_tickets().get();
        let end_ticket = core::cmp::min(last_ticket + batch_size, total_tickets);
        let pool = self.prize_pool().get();
        
        for ticket_id in last_ticket..end_ticket {
            if self.ticket_claimed(ticket_id).get() {
                continue;
            }
            
            let owner = self.ticket_owner(ticket_id).get();
            if owner.is_zero() {
                continue;
            }
            
            let ticket_nums = self.ticket_numbers(ticket_id).get();
            let ticket_eb = self.ticket_eight_ball(ticket_id).get();
            let winning_nums = self.winning_numbers().get();
            let winning_eb = self.winning_eight_ball().get();
            
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
            
            let prize = match (matches, eb_match) {
                (5, true) => &pool * 40u64 / 100u64,
                (5, false) => &pool * 15u64 / 100u64,
                (4, true) => &pool * 8u64 / 100u64,
                (4, false) => &pool * 5u64 / 100u64,
                (3, true) => &pool * 6u64 / 100u64,
                (3, false) => &pool * 45u64 / 1000u64,
                (2, true) => &pool * 3u64 / 100u64,
                (1, true) => &pool * 15u64 / 1000u64,
                (0, true) => &pool * 125u64 / 10000u64,
                _ => BigUint::zero(),
            };
            
            if prize > BigUint::zero() {
                self.ticket_claimed(ticket_id).set(true);
                self.send().direct_klv(&owner, &prize);
            }
        }
        
        self.last_distributed_ticket().set(end_ticket);
    }
}
