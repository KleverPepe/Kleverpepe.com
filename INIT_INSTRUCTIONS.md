# KPEPE Jackpot - Contract Initialization

## Your Addresses

| Type | Address |
|------|---------|
| **Your Wallet** | `klv1a84816aaa16a7d0ed57b012526dcd0d0692d02` |
| **Contract** | `klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d` |
| **KPEPE Token** | `klv1qqqqqqqqqqqqqpgq6xv6kjc603gys4l2jma9szhujxjmnlhnud2s7lwyhl` |

---

## Manual Initialization Steps

### Step 1: Go to KleverScan
```
https://kleverscan.org/contract/klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d
```

### Step 2: Click "Write Contract" or "Interact"

### Step 3: Call `initialize_wallets`
- **First field (projectWallet):** `klv1a84816aaa16a7d0ed57b012526dcd0d0692d02`
- **Second field (prizePoolWallet):** `klv1a84816aaa16a7d0ed57b012526dcd0d0692d02`

### Step 4: Call `set_kpepe_token`
- **Token:** `klv1qqqqqqqqqqqqqpgq6xv6kjc603gys4l2jma9szhujxjmnlhnud2s7lwyhl`

### Step 5: Call `toggle_round`
- (no parameters)

---

## What This Does

1. **initialize_wallets** - Sets your wallet as both project and prize pool wallet
2. **set_kpepe_token** - Sets the KPEPE token address
3. **toggle_round** - Starts the lottery purchases (enables ticket)

---

## After Initialization

- Users can buy tickets (100 KLV each)
- 85% goes to prize pool
- 15% goes to project wallet
- Winners get paid directly from contract when draw is completed
