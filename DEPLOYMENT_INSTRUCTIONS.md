# Deploy KPEPE Lottery to Public Web

Your lottery dapp needs to be served via HTTP/HTTPS for the Klever Extension to work. Here are deployment options:

---

## Option 1: GitHub Pages (Recommended - Free)

### Step 1: Push to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "Deploy KPEPE Lottery dapp"

# Push to GitHub (replace with your repo URL)
git push origin main
```

### Step 2: Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Source**, select **main** branch
4. Under **Folder**, select **/ (root)**
5. Click **Save**
6. Your site will be live at: `https://yourusername.github.io/klevertepepe-redesign/lottery/`

### Step 3: Access Your Dapp
Visit: `https://yourusername.github.io/klevertepepe-redesign/lottery/`

The Klever Extension will automatically inject and work!

---

## Option 2: Netlify (Free, Custom Domain Support)

### Deploy via Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag the `lottery` folder onto the page
3. Your site will be live at: `https://random-name.netlify.app`
4. Optional: Add custom domain in site settings

### Deploy via Git
1. Sign up at https://netlify.com
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Set **Base directory**: `lottery`
5. Click **Deploy**

---

## Option 3: Vercel (Free, Fast Deployment)

### Deploy via Git
1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Set **Root Directory**: `lottery`
5. Click **Deploy**

Your site will be live at: `https://project-name.vercel.app`

---

## Option 4: Keep Using Localhost (Development Only)

If you want to continue using localhost for testing:

```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign/lottery
python3 -m http.server 8080
```

Then visit: http://localhost:8080/

**Note:** This only works on your computer. Users won't be able to access it.

---

## Recommended: Use GitHub Pages

**Pros:**
- ✅ Free forever
- ✅ HTTPS enabled automatically  
- ✅ Works with Klever Extension
- ✅ Easy updates (just `git push`)
- ✅ Custom domain support
- ✅ Already have git repo set up

**Quick Deploy:**
```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign

# Add and commit
git add lottery/index.html
git commit -m "Fix Klever wallet integration"

# Push to GitHub
git push origin main

# Enable GitHub Pages in repository settings
```

Access at: `https://YOUR_USERNAME.github.io/klevertepepe-redesign/lottery/`

---

## Custom Domain (Optional)

After deploying to GitHub Pages, Netlify, or Vercel:

1. Buy a domain (e.g., `kpepe-lottery.com`)
2. Add DNS records pointing to your hosting provider
3. Configure custom domain in hosting settings
4. Your lottery will be at: `https://kpepe-lottery.com`

---

## Important Notes

⚠️ **Klever Extension Requirement:**
The Klever browser extension ONLY works on pages served via:
- `http://localhost:*` (local development)
- `https://*` (production sites)

It will NOT work if you open `file:///path/to/index.html` directly in your browser.

✅ **Contract Address:**
The lottery is already configured for KleverChain mainnet:
- Contract: `klv1qqqqqqqqqqqqqpgqeqqq08ulxf7j97vw8mxqq7wwxjgmcwx9ud2scd508d`
- Network: KleverChain Mainnet
- No changes needed for deployment!
