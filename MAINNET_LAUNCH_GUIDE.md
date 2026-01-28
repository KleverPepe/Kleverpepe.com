# 🚀 KPEPE Lottery - Mainnet Launch Guide

## Status: READY FOR MAINNET DEPLOYMENT

**Last Updated:** January 28, 2026  
**Deployment Status:** ✅ ALL SYSTEMS GO  
**Network:** KleverChain Mainnet  
**Contract:** KPEPEJackpot (910 lines)

---

## Phase 1: Deploy Smart Contract ⚡

### Option A: Deploy via KleverScan (Recommended - Easiest)

1. **Go to KleverScan Contracts:**
   - URL: https://kleverscan.org/contracts
   - Click "Deploy Contract" button

2. **Configure Deployment:**
   - **Language:** Select "JavaScript/WASM"
   - **Contract Code:** Copy from `contracts/KPEPEJackpot.js`
   - **Gas Limit:** 3,000,000 KLV
   - **Access:** Public

3. **Connect & Deploy:**
   - Click "Connect Wallet" (use your project wallet)
   - Address: `klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9`
   - Click "Deploy"
   - **⏱️ Wait 2-3 minutes for confirmation**

4. **Copy Contract Address:**
   - Once deployed, copy the contract address
   - Format: `klv1qqq...` (starts with klv1)

### Option B: Deploy via Klever CLI (Advanced)

```bash
# Install CLI
npm install -g @klever/cli

# Deploy contract
klever deploy ./contracts/KPEPEJackpot.js

# Wait for confirmation
```

---

## Phase 2: Update Configuration ⚙️

After contract deployment, update `.env`:

```bash
# .env
CONTRACT_ADDRESS=klv1qqq...{paste-your-deployed-address}
MAINNET_MNEMONIC={already-configured}
PROJECT_WALLET=klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
PRIZE_POOL_WALLET=klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
KPEPE_TOKEN=kpepe-1eod
```

---

## Phase 3: Initialize Contract Functions 🔧

Go back to **KleverScan → Your Contract → Functions**

### Call 1: Initialize Wallets

```
Function: initializeWallets
Parameters:
  - projectWallet: klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9
  - prizePoolWallet: klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2
```

**⏱️ Wait for confirmation**

### Call 2: Set KPEPE Token

```
Function: setKPEPEToken
Parameters:
  - token: kpepe-1eod
```

**⏱️ Wait for confirmation**

### Call 3: Enable Lottery

```
Function: toggleRound
Parameters: (none - just call it)
```

**⏱️ Wait for confirmation**

---

## Phase 4: Verify Contract State ✅

Run verification script:

```bash
node verify-mainnet.js
```

**Expected Output:**
```
✅ Contract deployed at: klv1qqq...
✅ Project wallet initialized: klv19a7...
✅ Prize pool wallet initialized: klv1zz5...
✅ KPEPE token configured: kpepe-1eod
✅ Lottery enabled: true
✅ System ready for tickets
```

---

## Phase 5: Start Signing Server 🔐

The signing server handles secure transaction signing:

```bash
# Start with PM2 (recommended for production)
pm2 start sign-tx.js --name kpepe-signing

# OR run directly
node sign-tx.js
```

**Verify it's running:**

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "network": "kleverchain-mainnet",
  "timestamp": "2026-01-28T10:00:00Z"
}
```

---

## Phase 6: Run System Tests 🧪

Execute comprehensive functionality tests:

```bash
# Install dependencies if needed
npm install

# Run tests
npm test

# OR manually test
node test-mainnet.js
```

**Tests Verify:**
- ✅ Contract deployment successful
- ✅ Wallet initialization correct
- ✅ KPEPE token linked
- ✅ Signing server responding
- ✅ Ticket purchase flow working
- ✅ Prize distribution logic correct
- ✅ Revenue split (15% / 85%)
- ✅ Free ticket generation
- ✅ Draw mechanism functional
- ✅ Claim prize workflow

**Expected Results:** 18/18 tests passing ✅

---

## Phase 7: Monitor First 24 Hours 📊

After launch, monitor:

```bash
# Check signing server
curl http://localhost:3001/health

# View recent transactions
curl https://api.mainnet.klever.org/transactions?contract=klv1qqq...

# Monitor server logs
pm2 logs kpepe-signing

# Check system health
node check-system-health.js
```

**What to Watch For:**
- ✅ First tickets being purchased
- ✅ Revenue split calculating correctly
- ✅ No transaction errors
- ✅ Prize distribution working
- ✅ Website showing live data
- ✅ Signing server stable

---

## Phase 8: Official Launch Announcement 🎊

Once verified and stable:

### 1. Update Website Status
```
- Mark as "LIVE" on kleverpepe.com
- Add launch date
- Show contract address
```

### 2. Social Media Announcement
```
🎉 KPEPE Lottery is LIVE on KleverChain Mainnet!

🎰 Buy tickets, win prizes, watch your numbers
🏆 9-tier prize structure
💰 Automatic revenue distribution
🚀 Completely decentralized

Play now: https://kleverpepe.com
Contract: klv1qqq...

#KleverChain #Lottery #KPEPE #DeFi
```

### 3. Community Updates
- Post on Discord/Telegram channels
- Update GitHub releases
- Email subscribers (if applicable)

---

## Configuration Reference 📋

| Parameter | Value |
|-----------|-------|
| **Network** | KleverChain Mainnet |
| **RPC** | https://node.klever.finance |
| **API** | https://api.mainnet.klever.org |
| **Project Wallet** | `klv19a7...` (15% revenue) |
| **Prize Pool** | `klv1zz5...` (85% revenue) |
| **KPEPE Token** | `kpepe-1eod` |
| **Ticket Price** | 100 KLV |
| **Gas Limit** | 3,000,000 |
| **Draw Time** | 00:00 UTC (daily) |

---

## Emergency Procedures 🚨

### If Deployment Fails

1. **Check gas limit:** Ensure you have enough KLV for gas fees
2. **Verify network:** Confirm https://node.klever.finance is responsive
3. **Check wallet:** Verify wallet address has sufficient funds
4. **Redeploy:** Delete deployment-info.json and try again

```bash
rm deployment-info.json
node deploy-kleverchain-mainnet.js
```

### If Contract Initialization Fails

1. **Verify contract address:** Check it's correct in .env
2. **Verify wallet addresses:** Ensure they match configuration
3. **Check permissions:** Your wallet must be contract owner
4. **Try again:** Retry initialization from KleverScan

### If Signing Server Fails

1. **Check port:** Port 3001 must be available
   ```bash
   lsof -i :3001
   ```

2. **Restart:**
   ```bash
   pm2 restart kpepe-signing
   ```

3. **Check logs:**
   ```bash
   pm2 logs kpepe-signing --lines 100
   ```

### If Tests Fail

1. **Verify contract deployed:** Check KleverScan
2. **Verify initialization:** All functions called?
3. **Check signing server:** Running on port 3001?
4. **Review logs:**
   ```bash
   node test-mainnet.js --verbose
   ```

---

## Success Criteria ✅

Mainnet deployment is successful when:

1. ✅ Contract deployed to KleverChain Mainnet
2. ✅ All initialization functions called successfully
3. ✅ 18/18 system tests passing
4. ✅ Signing server running stable
5. ✅ First test transaction succeeds
6. ✅ Website shows live status
7. ✅ No errors in first 24 hours
8. ✅ Revenue distribution working correctly

---

## Next Steps After Launch 🚀

1. **Monitor Continuously**
   - Set up alerts for transaction failures
   - Monitor server health
   - Track prize distributions

2. **Community Engagement**
   - Respond to user questions
   - Share winners on social media
   - Post regular updates

3. **Performance Optimization**
   - Analyze transaction patterns
   - Optimize gas usage if needed
   - Plan future features

4. **Security Maintenance**
   - Regular security audits
   - Update dependencies
   - Monitor for vulnerabilities

---

## Support & Documentation 📚

| Resource | Link |
|----------|------|
| **Website** | https://kleverpepe.com |
| **GitHub** | https://github.com/KleverPepe/kpepe-lottery |
| **KleverScan** | https://kleverscan.org |
| **KleverChain Docs** | https://docs.klever.org |
| **Discord** | [Your Discord] |

---

## Deployment Timeline ⏰

- **Phase 1 (Deploy):** ~10 minutes
- **Phase 2 (Configure):** ~2 minutes
- **Phase 3 (Initialize):** ~5 minutes
- **Phase 4 (Verify):** ~2 minutes
- **Phase 5 (Start Server):** ~1 minute
- **Phase 6 (Tests):** ~5 minutes
- **Phase 7 (Monitor):** ~15 minutes
- **Phase 8 (Launch):** ~5 minutes

**Total Time: ~45 minutes to full launch** ✅

---

**Status:** PRODUCTION READY 🎉

All prerequisites met. System fully configured. Ready for immediate mainnet deployment.

*Last verified: January 28, 2026 - All systems operational*
