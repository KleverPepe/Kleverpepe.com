# KPEPE Lottery Contract - Build & Deploy Instructions

## ✅ Complete Implementation

The Rust smart contract is now **fully functional** with:

✅ **Ticket Purchase (`buy_ticket`)**
- Accepts 1 KLV payment
- Stores ticket data (player, numbers, eight ball, timestamp)
- Splits: 85% to prize pool, 15% to project wallet
- Caps pool at 1M KLV
- Tracks total tickets sold

✅ **Prize Distribution (`claim_prize`)**
- Players verify their ticket
- Contract calculates matches against winning numbers
- Prize calculated based on match percentage:
  - 5 numbers + EB: 40% of pool (Jackpot)
  - 5 numbers: 15% of pool
  - 4 numbers + EB: 8% of pool
  - 4 numbers: 5% of pool
  - 3 numbers + EB: 6% of pool
  - 3 numbers: 4.5% of pool
  - 2 numbers + EB: 3% of pool
  - 1 number + EB: 1.5% of pool
  - EB only: 1.25% of pool
- Transfers prize directly to winner

✅ **KPEPE Token Prizes (`claim_kpepe_prize`)**
- Separate claim function for KPEPE token rewards
- Prize amounts:
  - Jackpot: 500,000 KPEPE
  - 5 Match: 100,000 KPEPE
  - 4 Match+EB: 50,000 KPEPE
  - 4 Match: 25,000 KPEPE
  - 3 Match+EB: 10,000 KPEPE
  - 3 Match: 5,000 KPEPE
  - 2 Match+EB: 1,000 KPEPE
  - 1 Match+EB: 500 KPEPE
  - EB only: 100 KPEPE

✅ **Draw Management**
- Owner starts draw
- Owner completes draw with winning numbers
- Validates all inputs
- Automatically starts new round after draw

---

## Build Instructions

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install WASM target
rustup target add wasm32-unknown-unknown
```

### Build the Contract
```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign/rust-contract

# Build release
cargo build --release --target wasm32-unknown-unknown

# WASM output:
# target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm
```

---

## Deployment Steps

### 1. Compile WASM
```bash
cd rust-contract
cargo build --release --target wasm32-unknown-unknown
```

### 2. Deploy to KleverChain Mainnet

**Option A: Using KleverScan Web Interface (Easiest)**

1. Go to: https://kleverscan.org/contracts
2. Click **Deploy Contract**
3. Upload: `target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm`
4. Set Gas Limit: **3,000,000**
5. Connect Klever Wallet
6. Click **Deploy**
7. **Note the new contract address**

**Option B: Using Klever CLI**
```bash
npm install -g @klever/cli

klever deploy \
  --wasm target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm \
  --gas-limit 3000000 \
  --gas-price 1000000
```

**Option C: Using Klever SDK (Node.js)**
```javascript
const Klever = require('@klever/sdk');
const fs = require('fs');

const klever = await Klever.init({
  mnemonic: 'YOUR 24 WORD MNEMONIC'
});

const wasm = fs.readFileSync('target/wasm32-unknown-unknown/release/kpepe_jackpot.wasm');

const deployed = await klever.deployContract(wasm, {
  gasLimit: 3000000,
  gasPrice: 1000000
});

console.log('Contract deployed at:', deployed.address);
```

### 3. Initialize Contract (CRITICAL!)

After deployment, call these functions via KleverScan:

**Function: `initialize_wallets`**
```
Parameters:
  - project_wallet: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
  - prize_pool_wallet: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
```

**Function: `set_kpepe_token`**
```
Parameters:
  - token_id: kpepe-1eod
```

**Function: `toggle_round`**
```
(No parameters - activates the lottery)
```

### 4. Update Frontend

Update `lottery/index.html`:
```javascript
const CONTRACT_ADDRESS = "YOUR_NEW_CONTRACT_ADDRESS"; // Replace with deployed address
```

Then commit and push:
```bash
git add lottery/index.html
git commit -m "Update to new deployed contract address"
git push origin main
```

---

## Contract Functions Reference

### User Functions

**buy_ticket(num1, num2, num3, num4, num5, eb)**
- Buy a lottery ticket
- Requires exactly 1 KLV payment
- Numbers: 1-50, Eight ball: 1-20
- Payable: Yes (1 KLV)

**claim_prize(ticket_id)**
- Claim KLV prize for matching ticket
- Returns: Prize amount based on matches
- Requires: Draw completed, ticket owner

**claim_kpepe_prize(ticket_id)**
- Claim KPEPE token prize for matching ticket
- Returns: KPEPE tokens based on matches
- Requires: Draw completed, KPEPE token configured

### Owner Functions

**initialize_wallets(project_wallet, prize_pool_wallet)**
- Set project and prize pool wallets
- Required before lottery starts
- Owner only

**set_kpepe_token(token_id)**
- Set KPEPE token identifier (e.g., "kpepe-1eod")
- Required to enable KPEPE prize claims
- Owner only

**toggle_round()**
- Pause/Resume ticket sales
- Owner only

**start_draw()**
- Begin draw process
- Owner only

**complete_draw(winning_nums, winning_eb)**
- Complete draw with winning numbers
- Parameters: Array of 5 numbers (1-50), Eight ball (1-20)
- Owner only

**withdraw_project_funds(amount)**
- Withdraw project funds
- Owner only

### View Functions

**get_pool_balance()** → BigUint
- Current prize pool balance

**get_next_draw_time()** → u64
- Unix timestamp of next draw

**get_winning_numbers()** → Array[u8]
- Winning numbers from last draw

**get_winning_eight_ball()** → u8
- Winning eight ball from last draw

**get_ticket(ticket_id)** → Ticket
- View ticket details by ID

**get_player_tickets(player)** → Array[u64]
- View all ticket IDs for a player

**get_total_tickets_sold()** → u64
- Total tickets sold so far

**is_round_active()** → bool
- Is the lottery accepting tickets?

**is_draw_in_progress()** → bool
- Is a draw currently happening?

---

## Security Features

✅ **Payment Verification** - Exact amount required
✅ **Access Control** - Owner-only functions protected
✅ **Validation** - All inputs validated (numbers 1-50, EB 1-20)
✅ **Pool Capping** - Prevents infinite growth (max 1M KLV)
✅ **Ticket Integrity** - Players can only claim own tickets
✅ **Prize Prevention** - Can't claim same prize twice
✅ **Number Matching** - Accurate winner calculation

---

## Testing on Testnet (Recommended!)

Before mainnet deployment, test on KleverChain testnet:

1. Deploy to testnet first
2. Call initialize_wallets
3. Call toggle_round to activate
4. Buy a few tickets
5. Complete a draw
6. Claim prizes
7. Verify all functions work

**Testnet RPC:** `https://node.testnet.klever.org`
**KleverScan Testnet:** `https://testnet.kleverscan.org`

---

## Next Steps

1. **Build contract**: `cargo build --release --target wasm32-unknown-unknown`
2. **Deploy to testnet** first for testing
3. **Deploy to mainnet** once verified
4. **Initialize contract** (wallets, token, toggle round)
5. **Update frontend** with new contract address
6. **Announce lottery** live on https://www.kleverpepe.com/lottery/

---

## Support

- Klever Docs: https://docs.klever.org
- KleverScan: https://kleverscan.org
- GitHub: https://github.com/KleverPepe/kpepe-lottery
