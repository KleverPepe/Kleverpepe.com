# Deploy KPEPE Rust Contract

## Step 1: Get WASM File
The contract is at:
```
/Users/chotajarvis/clawd/klevertepepe-redesign/kpepe-jackpot.wasm
```

## Step 2: Deploy via KleverScan

### Option A: Upload to KleverScan (Easiest)

1. **Go to:** https://kleverscan.org/contracts

2. **Click "Deploy Contract"**

3. **Upload:** Drag & drop `kpepe-jackpot.wasm`

4. **Settings:**
   - Gas Limit: **3000000**
   - Upgradable: ON
   - Readable: ON

5. **Click "Deploy"** and confirm in wallet

6. **Copy the new contract address**

---

### Option B: Using VS Code Klever IDE

1. Open VS Code
2. Click **Klever icon** in sidebar
3. Click **"Deploy Contract"**
4. Select: `rust-contract/src/lib.rs`
5. Gas: **3000000**
6. Click **"Deploy"**

---

## Step 3: Update Website

After getting new address:

```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign
```

Edit `lottery/index.html` line 610:
```
CONTRACT_ADDRESS = "NEW_ADDRESS_HERE"
```

Then:
```bash
git add lottery/index.html
git commit -m "Update contract address"
git push origin main
```

---

## Step 4: Initialize Contract

New Rust contract will show all functions on KleverScan:

1. `initialize_wallets` - Your wallet in both fields
2. `set_kpepe_token` - `klv1qqqqqqqqqqqqqpgq6xv6kjc603gys4l2jma9szhujxjmnlhnud2s7lwyhl`
3. `toggle_round` - No parameters

---

## Files Ready

| File | Path |
|------|------|
| WASM | `/Users/chotajarvis/clawd/klevertepepe-redesign/kpepe-jackpot.wasm` |
| Size | ~15KB |
