# 🚀 DEPLOY TO MAINNET NOW - Action Steps

**Time to Deploy: ~45 minutes**  
**Current Status: All files ready, environment configured**

---

## 🎯 STEP 1: Deploy Smart Contract (10 minutes)

### Option A: Deploy via KleverScan (Recommended & Easiest)

**The contract file is ready at:** `contracts/KPEPEJackpot.js`

1. **Open KleverScan Deploy Page**
   - Go to: https://kleverscan.org/contracts
   - Click the **"Deploy Contract"** button (top right)

2. **Configure Contract Deployment**
   - **Language:** Select **"JavaScript/WASM"**
   - **Contract Code:** 
     - Click "Choose File" or paste the code
     - Use file: `contracts/KPEPEJackpot.js` (32KB)
   - **Gas Limit:** Enter **3000000** (3 million)
   - **Access Type:** Public

3. **Connect Your Wallet**
   - Click **"Connect Wallet"**
   - Use the wallet with address: `klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9`
   - Or use your project wallet with sufficient KLV for gas

4. **Deploy**
   - Click **"Deploy Contract"**
   - Confirm the transaction in your wallet
   - **⏱️ Wait 2-3 minutes for confirmation**

5. **Copy Contract Address**
   - Once deployed, you'll see the contract address
   - Format will be: `klv1qqq...` (starts with klv1qqq)
   - **⚠️ SAVE THIS ADDRESS - You'll need it next!**

### Option B: Use Klever Wallet Extension

If KleverScan doesn't work, you can deploy directly from Klever Wallet:
1. Install Klever Extension
2. Import your wallet
3. Go to "Contracts" → "Deploy"
4. Follow similar steps as above

---

## 🎯 STEP 2: Update Configuration (2 minutes)

Once you have the contract address from Step 1:

```bash
# Run this command with YOUR contract address:
echo "CONTRACT_ADDRESS=klv1qqq...YOUR_ADDRESS_HERE" >> .env

# Verify it was added:
cat .env | grep CONTRACT_ADDRESS
```

**Example:**
```bash
echo "CONTRACT_ADDRESS=klv1qqq4r7rvqkcr9mwxqwv8x5svyg5xqqqxqqqxqqq" >> .env
```

---

## 🎯 STEP 3: Initialize Contract Functions (5 minutes)

Now go back to **KleverScan** and find your deployed contract:

1. **Go to Your Contract**
   - Visit: https://kleverscan.org/contracts/[YOUR_CONTRACT_ADDRESS]
   - Or search for it on KleverScan

2. **Call: initializeWallets**
   - Click on **"Write Contract"** tab
   - Find function: **initializeWallets**
   - Enter parameters:
     - `projectWallet`: `klv19a7hrp2wgx0m9tl5kvtu5qpd9p40zm2ym2mh4evxflz64lk8w38qs7hdl9`
     - `prizePoolWallet`: `klv1zz5tyqpa50y5ty7xz9jwegt85p0gt0fces63cde8pjncn7mgeyyqnvucl2`
   - Click **"Write"** and confirm transaction
   - **⏱️ Wait for confirmation**

3. **Call: setKPEPEToken**
   - Find function: **setKPEPEToken**
   - Enter parameter:
     - `token`: `kpepe-1eod`
   - Click **"Write"** and confirm transaction
   - **⏱️ Wait for confirmation**

4. **Call: toggleRound**
   - Find function: **toggleRound**
   - No parameters needed
   - Click **"Write"** and confirm transaction
   - **⏱️ Wait for confirmation**
   - This enables the lottery!

---

## 🎯 STEP 4: Start Signing Server (1 minute)

Back in your terminal, start the signing server:

```bash
# Make sure you're in the project directory
cd /Users/chotajarvis/clawd/klevertepepe-redesign

# Start the signing server with PM2
pm2 start sign-tx.js --name kpepe-signing

# Check it's running
pm2 status
```

**Verify it's healthy:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "network": "kleverchain-mainnet"
}
```

---

## 🎯 STEP 5: Run Verification (2 minutes)

Run the verification script to confirm everything is working:

```bash
node verify-mainnet.js
```

**Expected output:**
```
✅ Contract is deployed on mainnet
✅ Project wallet initialized
✅ Prize pool wallet initialized
✅ KPEPE token is valid
✅ KleverChain network is operational
✅ Signing server is running

TOTAL: 6/6 checks passed
✅ ALL CHECKS PASSED - SYSTEM READY FOR LAUNCH
```

---

## 🎯 STEP 6: Update Website (3 minutes)

Update the website to show the live contract address:

```bash
# I'll help you update the website files after deployment
```

---

## 🎯 STEP 7: Test First Transaction (5 minutes)

Test buying a ticket to make sure everything works:

1. Go to: https://kleverpepe.com
2. Connect your Klever wallet
3. Try to buy 1 ticket (100 KLV)
4. Confirm the transaction
5. Check that it appears in the contract

---

## 🎯 STEP 8: Launch Announcement (5 minutes)

Once everything is verified and working:

### Social Media Post Template:
```
🎉 KPEPE Lottery is officially LIVE on KleverChain Mainnet!

🎰 Features:
• 100 KLV per ticket
• 9-tier prize structure  
• Automatic revenue distribution (15%/85%)
• Daily draws at 00:00 UTC
• Free ticket generation

🔗 Play now: https://kleverpepe.com
📜 Contract: klv1qqq... [your contract address]

#KleverChain #Lottery #KPEPE #DeFi #Web3
```

### Update GitHub README:
- Add "🟢 LIVE ON MAINNET" badge
- Include contract address
- Link to KleverScan contract page

---

## 📊 Monitoring Commands

After launch, monitor the system:

```bash
# Check signing server logs
pm2 logs kpepe-signing

# Check contract transactions
curl "https://api.mainnet.klever.org/transactions?contract=YOUR_CONTRACT_ADDRESS&limit=10"

# View contract on KleverScan
# https://kleverscan.org/contracts/YOUR_CONTRACT_ADDRESS
```

---

## ⚠️ Troubleshooting

### If deployment fails:
1. Check you have enough KLV for gas (need ~500 KLV)
2. Verify network is up: https://kleverscan.org
3. Try refreshing the page and deploying again

### If initialization fails:
1. Verify you're the contract owner
2. Check wallet addresses are correct
3. Make sure you're connected with the deployer wallet

### If signing server fails:
1. Check .env has MAINNET_MNEMONIC set
2. Verify port 3001 is free: `lsof -i :3001`
3. Check logs: `pm2 logs kpepe-signing`

---

## 🎊 Success Checklist

Once complete, you should have:

- [x] Contract deployed to mainnet
- [x] Contract address saved in .env
- [x] Wallets initialized on contract
- [x] KPEPE token configured
- [x] Lottery enabled (toggleRound called)
- [x] Signing server running
- [x] All verification checks passing
- [x] First test transaction successful
- [x] Website updated with contract address
- [x] Launch announced on social media

---

## 📞 Need Help?

If you get stuck:

1. Check the detailed guide: [MAINNET_LAUNCH_GUIDE.md](MAINNET_LAUNCH_GUIDE.md)
2. Review the checklist: [DEPLOYMENT_READY_FOR_MAINNET.md](DEPLOYMENT_READY_FOR_MAINNET.md)
3. Run diagnostics: `node verify-mainnet.js`

---

**🚀 Ready? Let's deploy to mainnet!**

Start with Step 1: https://kleverscan.org/contracts

*Good luck! The system is production-ready and waiting for you! 🎰*
