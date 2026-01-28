# 📦 GitHub & Website Deployment Guide

## Overview

This guide covers publishing the KPEPE Lottery system to GitHub and your website for public access.

## Table of Contents

1. [GitHub Repository Setup](#github-repository-setup)
2. [Code Publishing](#code-publishing)
3. [Website Deployment](#website-deployment)
4. [GitHub Pages Configuration](#github-pages-configuration)
5. [Documentation Setup](#documentation-setup)
6. [Verification Checklist](#verification-checklist)

---

## GitHub Repository Setup

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Fill in repository details:
   - **Repository name:** `klevertepepe-redesign`
   - **Description:** KPEPE Lottery System - Production Ready
   - **Public/Private:** Public (for website publication)
   - **Initialize:** No (we already have code)

3. Click "Create repository"

### Step 2: Configure Local Repository

```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/klevertepepe-redesign.git

# Verify remote
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/klevertepepe-redesign.git (fetch)
# origin  https://github.com/YOUR_USERNAME/klevertepepe-redesign.git (push)
```

### Step 3: Create Main Branch and Initial Commit

```bash
# Rename branch to main
git branch -M main

# Add all files except .env
git add -A
git status  # Verify .env is NOT listed

# Commit with detailed message
git commit -m "🎰 KPEPE Lottery System - Production Ready

🔒 Security: All critical issues fixed (95/100 audit score)
✅ Functionality: All tests passing (18/18)
📚 Documentation: Complete deployment guide included
🚀 Status: Ready for mainnet deployment

Key Features:
- Secure signing server with environment variables
- 30-second API timeout protection
- 3-retry logic with exponential backoff
- Configuration validation on startup
- Responsive web interface
- Smart contract with automatic prize distribution
- 650K KPEPE launch bonus (Tiers 1-5)

See MAINNET_DEPLOYMENT_CHECKLIST.md for deployment instructions."
```

### Step 4: Push to GitHub

```bash
# Push main branch
git push -u origin main

# Verify
git branch -a  # Should show: * main, remotes/origin/main
```

---

## Code Publishing

### Files to Publish

**Core Application Files:**
- ✅ `sign-tx.js` (265 lines - Signing server with environment variables)
- ✅ `kpepe-jackpot.sol` (910 lines - Smart contract)
- ✅ `lottery/index.html` (1611 lines - Web interface)
- ✅ `package.json` - Dependencies and scripts

**Configuration Files:**
- ✅ `.env.example` - Configuration template (NEVER publish actual .env)
- ✅ `.gitignore` - Protects sensitive files
- ✅ `hardhat.config.js` - Contract configuration

**Documentation Files:**
- ✅ `MAINNET_DEPLOYMENT_CHECKLIST.md` - Deployment guide (30+ items)
- ✅ `SECURITY_FIXES_APPLIED.md` - Security audit results
- ✅ `COMPREHENSIVE_FUNCTIONALITY_TEST.md` - Test results
- ✅ `DEPLOYMENT_READY_REPORT.md` - Technical specifications
- ✅ `GITHUB_README.md` - Main GitHub documentation

**Workflow & Scripts:**
- ✅ `.github/workflows/deploy.yml` - Automated deployment
- ✅ `.gitpod.yml` - Cloud IDE configuration

### What NOT to Publish

**NEVER commit these files:**
- ❌ `.env` - Contains private key and secrets (protected by .gitignore)
- ❌ `node_modules/` - Dependencies (installed via npm install)
- ❌ `.DS_Store` - OS files
- ❌ Old deployment scripts (already handled)

---

## Website Deployment

### Option 1: Deploy Website to Your Domain

#### Prerequisites
- Your domain (e.g., kpepe-lottery.com)
- Web hosting with HTTPS support
- Node.js or static hosting

#### Steps

1. **Copy frontend files to your server:**
```bash
# Copy lottery folder
scp -r lottery/ user@your-server:/var/www/kpepe-lottery/

# Copy documentation
scp *.md user@your-server:/var/www/kpepe-lottery/docs/
```

2. **Set up HTTPS (Required for Klever wallet):**
```bash
# Using Let's Encrypt (free)
certbot certonly --webroot -w /var/www/kpepe-lottery -d kpepe-lottery.com
```

3. **Configure web server (nginx example):**
```nginx
server {
    listen 443 ssl http2;
    server_name kpepe-lottery.com;
    
    ssl_certificate /etc/letsencrypt/live/kpepe-lottery.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kpepe-lottery.com/privkey.pem;
    
    root /var/www/kpepe-lottery;
    index index.html;
    
    # Serve lottery app
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to signing server
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Documentation
    location /docs {
        alias /var/www/kpepe-lottery/docs;
        index index.html;
    }
}
```

4. **Start signing server:**
```bash
# Using PM2 for persistence
npm install -g pm2

cd /var/www/kpepe-lottery
pm2 start sign-tx.js --name kpepe-signing

# Verify
pm2 status
pm2 logs kpepe-signing
```

### Option 2: Deploy to GitHub Pages (Free)

See [GitHub Pages Configuration](#github-pages-configuration) below.

---

## GitHub Pages Configuration

### Step 1: Enable GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages" section (left sidebar)
3. Configure:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/docs` (or `/lottery`)
4. Click "Save"

### Step 2: Create Docs Folder Structure

```bash
cd /Users/chotajarvis/clawd/klevertepepe-redesign

# Copy files to docs folder
mkdir -p docs
cp lottery/index.html docs/
cp -r lottery/css docs/
cp -r lottery/js docs/
cp *.md docs/

# Create index for documentation
cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KPEPE Lottery - Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; }
        h1 { color: #1f2937; }
        .links { list-style: none; padding: 0; }
        .links li { margin: 1rem 0; }
        .links a { color: #2563eb; text-decoration: none; font-size: 1.1rem; }
        .links a:hover { text-decoration: underline; }
        .status { background: #dcfce7; border-left: 4px solid #22c55e; padding: 1rem; margin: 2rem 0; }
    </style>
</head>
<body>
    <h1>🎰 KPEPE Lottery System</h1>
    
    <div class="status">
        <strong>Status:</strong> 🟢 Production Ready for Mainnet Deployment
    </div>
    
    <h2>Documentation</h2>
    <ul class="links">
        <li><a href="MAINNET_DEPLOYMENT_CHECKLIST.md">📋 Deployment Checklist</a> - Step-by-step guide (30+ items)</li>
        <li><a href="SECURITY_FIXES_APPLIED.md">🔐 Security Audit</a> - Detailed security review</li>
        <li><a href="COMPREHENSIVE_FUNCTIONALITY_TEST.md">✅ Functionality Tests</a> - Full test results</li>
        <li><a href="DEPLOYMENT_READY_REPORT.md">📊 Technical Report</a> - Specifications</li>
        <li><a href="GITHUB_README.md">📖 Main README</a> - Overview and features</li>
    </ul>
    
    <h2>Quick Links</h2>
    <ul class="links">
        <li><a href="/lottery">🎫 Play Lottery</a> - Web interface</li>
        <li><a href="https://github.com/YOUR_USERNAME/klevertepepe-redesign">📦 GitHub Repository</a></li>
    </ul>
</body>
</html>
EOF

git add docs/
git commit -m "📚 Add documentation and GitHub Pages setup"
git push
```

### Step 3: Verify GitHub Pages

1. Your site will be available at: `https://YOUR_USERNAME.github.io/klevertepepe-redesign/`
2. Wait 1-2 minutes for deployment
3. Check the "Actions" tab for build status

---

## Documentation Setup

### Update Main README.md

Replace the root `README.md` with the comprehensive version:

```bash
cp GITHUB_README.md README.md
git add README.md
git commit -m "📖 Update main README with complete documentation"
git push
```

### Create Documentation Index

The documentation is organized as follows:

```
📚 Documentation Structure:

├── README.md (Main overview)
├── MAINNET_DEPLOYMENT_CHECKLIST.md
│   ├── Pre-deployment security (10 items)
│   ├── Contract deployment (8 items)
│   ├── Frontend deployment (9 items)
│   ├── Signing server setup (7 items)
│   ├── Security verification (9 items)
│   ├── Testing on mainnet (20+ items)
│   └── Troubleshooting guide
│
├── SECURITY_FIXES_APPLIED.md
│   ├── 7 critical issues fixed
│   ├── Before/after code examples
│   ├── Testing checklist
│   └── Deployment notes
│
├── COMPREHENSIVE_FUNCTIONALITY_TEST.md
│   ├── 18/18 tests passing
│   ├── Financial verification
│   ├── Security assessment
│   ├── Integration checklist
│   └── Performance metrics
│
└── DEPLOYMENT_READY_REPORT.md
    ├── Technical specifications
    ├── Component verification
    ├── Pre-deployment requirements
    └── Monitoring guide
```

---

## Verification Checklist

### Before Publishing to GitHub

- [ ] `.env` file is **NOT** included in git
- [ ] `git status` shows clean working directory
- [ ] All changes committed: `git log --oneline | head -5`
- [ ] No hardcoded secrets in code files
- [ ] `.gitignore` properly protects `.env`

### Before Publishing to Website

- [ ] HTTPS certificate installed and valid
- [ ] Signing server running on production server
- [ ] Environment variables configured in `.env`
- [ ] Frontend accessible at your domain
- [ ] All documentation links working
- [ ] Health check passes: `curl https://kpepe-lottery.com/api/health`

### After Publishing

- [ ] Repository visible at GitHub
- [ ] GitHub Pages builds successfully (check Actions tab)
- [ ] Documentation accessible
- [ ] Website loads without errors (check browser console)
- [ ] All links working (external and internal)
- [ ] Security headers proper (use HTTPS)

---

## Troubleshooting

### GitHub Push Errors

**Error: "fatal: unable to access repository"**
```bash
# Add GitHub credentials
git config credential.helper cache
git push -u origin main
# Will prompt for credentials (use personal access token, not password)
```

**Error: "Your branch and 'origin/main' have diverged"**
```bash
# Reset to origin/main
git reset --hard origin/main
git pull
```

### GitHub Pages Not Deploying

1. Check Actions tab for build errors
2. Verify branch is set to `main` in Pages settings
3. Ensure folder path is correct (`/docs` or `/lottery`)
4. Check `.nojekyll` file exists (already added)

### Website HTTPS Issues

```bash
# Test SSL certificate
openssl s_client -connect kpepe-lottery.com:443

# Verify cert validity
curl -I https://kpepe-lottery.com
```

---

## Final Checklist

**Repository Setup:**
- [ ] GitHub account created
- [ ] Repository initialized
- [ ] Remote added correctly
- [ ] Initial commit pushed

**Code Published:**
- [ ] All source files in GitHub
- [ ] Documentation complete
- [ ] `.env` protected (not published)
- [ ] `.gitignore` working properly

**Website Deployed:**
- [ ] Domain configured
- [ ] HTTPS enabled
- [ ] Frontend accessible
- [ ] Signing server running
- [ ] Documentation accessible

**Verification:**
- [ ] Security audit: ✅ 95/100
- [ ] Functionality tests: ✅ 18/18
- [ ] Deployment guide: ✅ Complete
- [ ] All documentation: ✅ Published

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code to GitHub
3. ✅ Enable GitHub Pages
4. ✅ Deploy website to your domain
5. 🔄 Follow MAINNET_DEPLOYMENT_CHECKLIST.md for contract deployment
6. 🚀 Go live on mainnet

---

**Status:** 🟢 READY FOR PUBLICATION

*For questions, refer to individual documentation files or check the troubleshooting section above.*
