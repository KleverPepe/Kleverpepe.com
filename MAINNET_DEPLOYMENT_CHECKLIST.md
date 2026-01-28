# 🚀 MAINNET DEPLOYMENT CHECKLIST

## Pre-Deployment Security ✅

### Private Key Management
- [ ] Create `.env` file from `.env.example`
- [ ] Add your private key to `.env` (NEVER commit .env to git)
- [ ] Add `.env` to `.gitignore` (should already be there)
- [ ] Verify `.env` is NOT tracked by git: `git ls-files .env`
- [ ] Plan to rotate private key after deployment

### Configuration
- [ ] Update all wallet addresses in `.env`:
  - [ ] `PRIVATE_KEY` - Your signing wallet private key
  - [ ] `PROJECT_WALLET` - 15% revenue recipient
  - [ ] `PRIZE_POOL_WALLET` - 85% + prize distributor
- [ ] Verify KPEPE token address: `kpepe-1eod` (check on KleverScan)
- [ ] Set correct network: `NETWORK=mainnet`
- [ ] Review `.env` values before deployment

---

## Contract Deployment ✅

### Deploy Smart Contract
- [ ] Ensure contract is ready (KPEPEJackpot.js)
- [ ] Deploy to KleverChain Mainnet
- [ ] Note deployed contract address
- [ ] Verify contract was deployed successfully on KleverScan
- [ ] Test contract getStats() returns valid data

### Initialize Contract
- [ ] Call `initializeWallets(PROJECT_WALLET, PRIZE_POOL_WALLET)`
- [ ] Verify wallets are properly set
- [ ] Initialize KPEPE token address
- [ ] Initialize staking contract address (if applicable)

### Verify Contract Data
- [ ] Check KPEPE seed fund values via `getStats()`
  - `kpepeJackpotPrize`: 50000000000000 (500K)
  - `kpepeMatch5Prize`: 5000000000000 (50K)
  - `kpepeMatch48BPrize`: 4000000000000 (40K)
  - `kpepeMatch4Prize`: 3500000000000 (35K)
  - `kpepeMatch38BPrize`: 2500000000000 (25K)
- [ ] Test prize distribution calculation
- [ ] Test KPEPE transfer functionality

---

## Frontend Deployment ✅

### Update Configuration
- [ ] Update `CONTRACT_ADDRESS` in `.env.example` with deployed contract
- [ ] Update `KPEPE_TOKEN_ADDRESS` to verified mainnet address
- [ ] Verify `KLEVERSCAN_API_URL` points to mainnet
- [ ] Check `KLEVER_RPC_URL` is correct
- [ ] Set `NETWORK=mainnet`

### Deploy Frontend
- [ ] Build/bundle if using build tools
- [ ] Deploy to web server (e.g., HTTPS required for production)
- [ ] Test on HTTPS only (Klever wallet requires HTTPS)
- [ ] Verify page loads without errors
- [ ] Check browser console for warnings/errors

### Test Frontend
- [ ] Verify contract address is correct
- [ ] Check that contract data loads from KleverScan
- [ ] Verify KPEPE bonuses display correctly
- [ ] Test wallet connection flow
- [ ] Confirm API timeout handling works
- [ ] Test error messages for network failures

---

## Signing Server Deployment ✅

### Setup Server
- [ ] Create `.env` file with all required variables
- [ ] Verify `PRIVATE_KEY` is loaded correctly
- [ ] Check `PROJECT_WALLET` and `PRIZE_POOL_WALLET`
- [ ] Set `API_URL` to mainnet: `https://api.mainnet.klever.org`
- [ ] Set `API_TIMEOUT` to appropriate value (30000ms)

### Start Server
- [ ] Start signing server: `node sign-tx.js`
- [ ] Verify it starts without errors
- [ ] Check `/health` endpoint responds with 200 OK
- [ ] Verify console shows environment loaded correctly
- [ ] Monitor for any connection errors

### Test Server
- [ ] Test signing a sample transaction
- [ ] Verify transaction broadcast works
- [ ] Check retry logic handles timeouts
- [ ] Test rate limit handling
- [ ] Verify error responses are clear

---

## Security Verification ✅

### Code Review
- [ ] Verify no hardcoded secrets in code
- [ ] Check `.env` is in `.gitignore`
- [ ] Verify environment variables are used everywhere
- [ ] Check error messages don't expose sensitive data
- [ ] Review API endpoints are HTTPS

### Access Control
- [ ] Ensure only authorized wallets can receive revenue
- [ ] Verify wallet addresses are correct
- [ ] Test that funds go to correct wallets
- [ ] Confirm private key can only be accessed via .env

### Monitoring
- [ ] Set up logging for transactions
- [ ] Monitor API success/failure rates
- [ ] Track revenue split accuracy
- [ ] Monitor KPEPE seed fund depletion
- [ ] Set up alerts for errors

---

## Testing on Mainnet ✅

### Ticket Purchase Flow
- [ ] User can connect wallet
- [ ] User can select numbers
- [ ] User can purchase ticket (100 KLV)
- [ ] Transaction signed by server
- [ ] Transaction broadcast successfully
- [ ] Ticket appears in contract

### Revenue Split
- [ ] 15% KLV goes to PROJECT_WALLET
- [ ] 85% KLV goes to PRIZE_POOL_WALLET
- [ ] Verify amounts using KleverScan
- [ ] Check wallet transactions

### Free Tickets
- [ ] Users with 50K+ KPEPE can claim free ticket
- [ ] Can claim max 1 per day
- [ ] Ticket expires before draw
- [ ] System rejects expired free tickets

### Prize Distribution
- [ ] Draw completes successfully
- [ ] Winners are calculated correctly
- [ ] KLV prizes sent automatically
- [ ] KPEPE prizes sent automatically (when applicable)
- [ ] KPEPE seed fund depletes correctly

### KPEPE Bonus Display
- [ ] Bonuses display for Tiers 1-5
- [ ] Bonuses hide when depleted (amount = 0)
- [ ] Stats total updates correctly
- [ ] Warning color shows when < 50%
- [ ] Polling refreshes every 30 seconds

---

## Post-Deployment ✅

### Monitoring
- [ ] Monitor transaction success rate
- [ ] Track revenue split accuracy
- [ ] Monitor KPEPE seed fund balance
- [ ] Check for any error patterns
- [ ] Monitor API response times

### User Support
- [ ] Document how to play
- [ ] Create FAQ for common issues
- [ ] Set up support contact
- [ ] Monitor social media for issues
- [ ] Be ready for hot-fixes if needed

### Key Rotation
- [ ] Plan private key rotation schedule
- [ ] Document rotation procedure
- [ ] Schedule regular rotation (monthly recommended)
- [ ] Keep backup of old keys for audit

---

## Verification Checklist ✅

**Before Going Live, Verify:**

- [ ] Contract deployed and verified
- [ ] All environment variables set
- [ ] `.env` file created and not committed
- [ ] Frontend loads without console errors
- [ ] Signing server starts successfully
- [ ] Test transaction completes end-to-end
- [ ] Revenue split routes correctly
- [ ] Wallets receive funds
- [ ] Contract data accessible via API
- [ ] Polling works and updates UI
- [ ] Error handling works for network failures
- [ ] Timeouts work correctly
- [ ] Retry logic functions as expected
- [ ] All HTTPS endpoints working
- [ ] Wallet connection works
- [ ] Ticket purchase flow complete
- [ ] Free ticket claims work
- [ ] Draw mechanism works
- [ ] Prize distribution works
- [ ] KPEPE seed fund tracking works

---

## Troubleshooting Guide

### Private Key Not Found
```
❌ ERROR: PRIVATE_KEY not found in .env file
✅ Fix: Create .env file from .env.example and add your private key
```

### Contract Address Wrong
```
⚠️  CONTRACT_ADDRESS appears to be using default/placeholder value
✅ Fix: Update CONTRACT_ADDRESS in .env and frontend after deploying
```

### API Timeout
```
⚠️  Request timeout, retrying...
✅ Fix: Check internet connection, verify KleverScan is accessible
```

### Wallet Addresses Wrong
```
❌ Transaction sent to wrong wallet
✅ Fix: Verify PROJECT_WALLET and PRIZE_POOL_WALLET in .env
```

### Transaction Broadcast Fails
```
❌ Broadcast failed
✅ Fix: Check private key is valid, account has sufficient balance
```

---

## Final Confirmation

Before declaring "LIVE":

1. **Contract**: ✅ Deployed, verified, data accessible
2. **Frontend**: ✅ Loads, displays correct data, handles errors
3. **Server**: ✅ Signing transactions, broadcasting successfully
4. **Security**: ✅ No hardcoded secrets, proper error handling
5. **Testing**: ✅ Full end-to-end flow works on mainnet
6. **Monitoring**: ✅ Logging and alerts in place
7. **Documentation**: ✅ Clear instructions for users

---

**Status: READY FOR DEPLOYMENT**

**Timeline:**
- Setup & configuration: ~15 minutes
- Contract deployment: ~5-10 minutes
- Frontend/server deployment: ~5 minutes
- Testing: ~30 minutes
- **Total estimated time: ~1 hour**

Once all checkboxes are completed, your lottery system is ready for production! 🚀
