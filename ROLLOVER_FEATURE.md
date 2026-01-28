# KPEPE Lottery - 20% Rollover Feature

## Overview
The KPEPE smart contract now implements an automatic 20% rollover mechanism for leftover prize pool funds. This ensures continuity of prize pools across draws and maximizes player engagement.

## How It Works

### Fund Flow
```
Ticket Sale (100 KLV)
├─ 15 KLV → Project Wallet (immediate payout)
└─ 85 KLV → Contract Prize Pool

After Draw - Prize Distribution:
├─ Tickets processed from 1 to N
├─ Winners paid from pool
└─ Remaining Pool Calculation:
    ├─ 20% → Rolls over to NEXT draw
    └─ 80% → Tracked as withdrawn
```

### Implementation Details

**Storage Mappers:**
- `next_draw_rollover`: Tracks KLV amount rolling to next draw
- `withdrawn_from_pool`: Tracks KLV amount withdrawn from current draw

**Prize Distribution Logic (`auto_distribute_prizes`):**
1. Process all winners from ticket pool (1 to total_tickets)
2. Track total distributed prizes (`total_distributed`)
3. Calculate remaining: `remaining = pool - total_distributed`
4. On final ticket (when `end_ticket == total_tickets`):
   - Calculate rollover: `rollover = remaining × 20%`
   - Calculate withdrawn: `withdrawn = remaining × 80%`
   - Store both values in mappers
   - Reset `prize_pool` to rollover amount
   - Reset `last_distributed_ticket` to 0 for next draw

**Example:**
- Prize pool: 10,000 KLV
- Total distributed: 8,500 KLV
- Remaining: 1,500 KLV
- **Next draw gets:** 300 KLV (20% of 1,500)
- **Withdrawn:** 1,200 KLV (80% of 1,500)

### View Functions

New view functions expose rollover tracking data:

```rust
#[view]
fn get_next_draw_rollover(&self) -> BigUint
// Returns: Amount rolling over to next draw

#[view]
fn get_withdrawn_from_pool(&self) -> BigUint
// Returns: Amount withdrawn from current pool
```

## Deployment Status

✅ **Feature Status:** Implemented and Compiled
- Contract size: 16 KB (optimized)
- Binary: `kpepe-jackpot.wasm` (root directory)
- Git commit: 626cc51 - "Add 20% rollover mechanism..."
- Tested: All view functions accessible

## Benefits

1. **Prize Pool Growth:** Leftover funds boost next draw's prize pool
2. **Player Retention:** Larger pools attract more players
3. **Fairness:** Leftover 80% tracked for accounting/project use
4. **Automation:** No manual intervention needed between draws

## Technical Notes

- Rollover calculation uses integer arithmetic (no decimal loss)
- All mappings update atomically at draw completion
- New draw starts with rollover amount plus new ticket sales
- View functions allow real-time monitoring of rollover amounts
