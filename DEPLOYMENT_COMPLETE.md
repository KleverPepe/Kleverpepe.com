# 🎱 KPEPE Lottery - Deployment Status

## ✅ LIVE & OPERATIONAL

### Frontend Dapp
- **Status**: 🟢 LIVE
- **URL**: https://www.kleverpepe.com/lottery/
- **Deployment**: Netlify (production)
- **Features**:
  - ✅ Klever wallet connection via extension
  - ✅ Number selection (5 main + 1 Eight Ball)
  - ✅ Quick pick randomization
  - ✅ Live KLV price updates
  - ✅ Transaction broadcasting to KleverChain
  - ✅ Prize table with percentages
  - ✅ Countdown timer
  - ✅ **NEW**: Prize claim interface

### Smart Contract
- **Status**: 🟢 DEPLOYED
- **Network**: KleverChain Mainnet (Chain ID: 0x8F4)
- **Contract Address**: `klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d`
- **Contract Type**: WASM-based smart contract
- **Source**: Rust with klever-sc framework v0.45.0

### User Flows - OPERATIONAL

#### 1. Buying Tickets ✅
```
User connects wallet → Selects 5 numbers + Eight Ball → Pays 1 KLV → 
Transaction broadcasts to KleverChain → Ticket stored on contract
```
- **Verified**: Multiple test transactions confirmed on KleverScan
- **Last Test**: Transaction hash `371843b8375c6e031481416de7293cfd8e88bafe946a7c9099a98ef16a910ec7`
- **Payment Split**: 85% held in contract, 15% to project wallet

#### 2. Claiming Prizes ✅ (NEW)
```
Winner receives draw results → Enters ticket ID → Calls claim_prize endpoint →
Contract calculates matches → Prize transferred from contract balance
```
- **Transaction Type**: Type 0 (Transfer with data field)
- **Function Call**: `claim_prize(ticket_id)`
- **Prize Calculation**: Based on number matches (0-5) and Eight Ball match
- **Prize Tiers**: 9 tiers from 40% jackpot down to 1.25% for Eight Ball only

## 📊 Prize Distribution Structure

| Match | Eight Ball | Pool % | Tier |
|-------|-----------|--------|------|
| 5 | ✅ | 40% | 🎰 JACKPOT |
| 5 | ❌ | 15% | 🏆 Match 5 |
| 4 | ✅ | 8% | 🎯 Match 4+EB |
| 4 | ❌ | 5% | 🎯 Match 4 |
| 3 | ✅ | 6% | 🎲 Match 3+EB |
| 3 | ❌ | 4.5% | 🎲 Match 3 |
| 2 | ✅ | 3% | 🍀 Match 2+EB |
| 1 | ✅ | 1.5% | 🌟 Match 1+EB |
| 0 | ✅ | 1.25% | ✨ Eight Ball only |

## 🏦 Contract Functions

### User-Facing Endpoints

#### `buy_ticket(n1, n2, n3, n4, n5, eb)`
- **Payable**: Yes (1 KLV required)
- **Parameters**: 
  - n1-n5: Main lottery numbers (1-50)
  - eb: Eight Ball number (1-20)
- **Returns**: Ticket ID for later claiming
- **Revenue Split**: 85% pool / 15% project

#### `claim_prize(ticket_id)`
- **Payable**: No
- **Parameters**: Ticket ID from purchase
- **Returns**: KLV transfer if player won
- **Calculation**: Automatic match counting and prize distribution

### Owner-Only Endpoints

#### `complete_draw(winning_numbers[], winning_eb)`
- Sets winning numbers for current draw
- Marks draw as complete
- Opens new round for ticket purchases

#### `toggle_round()`
- Pause/resume ticket sales
- Used between draws

#### `initialize_wallets(project_wallet)`
- Sets project wallet address
- Required for receiving 15% of ticket sales

## 🔧 Technical Specifications

### Network Configuration
- **Chain ID**: 0x8F4 (2292 decimal)
- **RPC**: https://node.mainnet.klever.org
- **Explorer**: https://kleverscan.org

### Contract Specifications
- **Language**: Rust
- **Framework**: klever-sc v0.45.0
- **Target**: wasm32-unknown-unknown
- **Optimization**: Release build with LTO
- **WASM Module**: kpepe_jackpot.wasm

### Transaction Format
```javascript
{
  type: 0,  // Transfer type
  payload: {
    receiver: "klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d",
    amount: 100000000,  // 1 KLV in smallest units
    kda: "",  // Empty for native KLV
    data: ["buy_ticket", "1", "2", "3", "4", "5", "8"]  // Function + args
  }
}
```

## 📋 Ticket Purchase Confirmation

The smart contract records:
- **ticket_owner**: Player's wallet address
- **ticket_numbers**: Array of 5 main numbers
- **ticket_eight_ball**: Eight Ball number (1-20)
- **ticket_claimed**: Boolean flag (false until claimed)
- **total_tickets**: Running counter of all tickets sold

## 💰 Prize Pool Management

### Automatic Operations
1. **On Purchase**: 85% of ticket price held in contract (stored in prize_pool variable)
2. **On Claim**: Percentage calculated, prize transferred from contract balance
3. **On Draw**: Pool amount tracked internally, available for next prizes

### Storage
- **Storage Key**: `prize_pool`
- **Type**: BigUint (supports unlimited precision)
- **Calculation**: `payment * 85 / 100` added per ticket

## 🔐 Security Features

- ✅ Owner-only functions for draw management
- ✅ Ticket ownership verification on claims
- ✅ Duplicate claim prevention (ticket_claimed flag)
- ✅ Input validation on all parameters
- ✅ Draw-in-progress status check
- ✅ Number range validation (1-50 for main, 1-20 for EB)

## 📈 Deployment Verification

### Contract Deployed Successfully
```bash
Network: KleverChain Mainnet
Contract: klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
Status: Accepting transactions
Verified Transactions: 5+ test purchases confirmed
```

### Frontend Verified
```bash
URL: https://www.kleverpepe.com/lottery/
Status: Live and accessible
Wallet Connection: Working
Transaction Broadcasting: Working
```

## 🚀 Next Steps for Operators

1. **Initialize Project Wallet**
   ```
   Call: initialize_wallets(project_wallet_address)
   Purpose: Set destination for 15% project revenue
   ```

2. **Set Up Draw Schedule**
   ```
   Call: start_draw() → Set winning numbers → complete_draw()
   Frequency: Daily / Weekly (as desired)
   ```

3. **Monitor Prize Pool**
   - View current pool: `get_pool()` endpoint
   - Watch for growth with each ticket purchase
   - Calculate expected payouts before each draw

4. **Claim Management**
   - Winners call `claim_prize(ticket_id)`
   - Contract validates ownership and matches
   - Automatic transfer if eligible

## 📞 Support

- **Frontend Issues**: Check browser console for KleverWeb API errors
- **Transaction Failures**: Verify sufficient KLV for gas + 1 KLV ticket price
- **Contract Issues**: Inspect transaction on https://kleverscan.org
- **Wallet Issues**: Ensure Klever Extension is installed and unlocked

---

**Last Updated**: January 27, 2025
**Status**: 🟢 PRODUCTION READY - All systems operational
**Users**: Ready to purchase tickets and claim prizes on KleverChain mainnet
