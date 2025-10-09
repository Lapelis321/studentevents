# 🔧 How to Fix Netlify Auto-Deploy from GitHub

## Problem
Netlify is not automatically deploying when you push code to GitHub. The site is online but serving old code.

---

## 📋 Solution Steps

### Step 1: Log in to Netlify Dashboard

1. **Open your browser** and go to: https://app.netlify.com
2. **Click "Log in"**
3. **Choose your login method**:
   - If you signed up with GitHub: Click "Log in with GitHub"
   - If you signed up with email: Click "Log in with email"
4. **Complete authentication**

---

### Step 2: Find Your Site

1. After logging in, you'll see your **Sites dashboard**
2. **Look for** "afterstateevents" in your sites list
3. **Click on it** to open the site overview

**Alternative**: Go directly to:
```
https://app.netlify.com/sites/afterstateevents/overview
```

---

### Step 3: Check Current Deploy Status

1. **Click the "Deploys" tab** at the top
2. **Look at the deploy list** - you should see:
   - Deploy history with timestamps
   - Status of each deploy (Published/Failed/Building)
   
3. **Check the most recent deploy**:
   - When was it? (It's probably from several days/weeks ago)
   - What branch was it from?
   - Did it succeed?

---

### Step 4: Manually Trigger a Deployment (Immediate Fix)

This will deploy your latest code RIGHT NOW:

1. **In the Deploys tab**, look for the **"Trigger deploy"** button (top right)
2. **Click "Trigger deploy"**
3. **Select "Deploy site"** from the dropdown
4. **Wait for the build**:
   - You'll see a new deploy appear at the top
   - Status will show "Building..." (yellow)
   - Wait 1-3 minutes
   - Status will change to "Published" (green) ✅

5. **Verify it worked**:
   - Open: https://afterstateevents.netlify.app
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Check if you see:
     - ✅ Only 3 events (not 4)
     - ✅ "SOLD OUT" red badge on VIP Gala
     - ✅ "CANCELLED" orange badge on Tech Fair
     - ✅ Summer Beach Party is hidden

---

### Step 5: Fix Auto-Deploy (Long-term Solution)

Now let's fix why it's not auto-deploying from GitHub:

#### 5.1: Check Build Settings

1. **From your site dashboard**, click **"Site settings"** (or "Site configuration")
2. **Navigate to**: `Build & deploy` → `Continuous deployment`
3. **Check these settings**:

   **A. Build settings**
   - Build command: Should be empty or `echo No build command needed`
   - Publish directory: Should be `.` (current directory)
   - ✅ Both should be set correctly in your `netlify.toml`

   **B. Deploy contexts**
   - Production branch: Should be `main` or `master`
   - ✅ Make sure this matches your GitHub branch

   **C. Deploy notifications**
   - Check if there are any error notifications
   - Look for webhook failures

#### 5.2: Check GitHub Connection

1. **Still in Build & deploy**, scroll to **"Link to repository"**
2. **Look for**:
   ```
   Repository: Lapelis321/studentevents
   Branch: main
   ```
3. **If you see "Not connected" or no repository**:
   - Click **"Link repository"**
   - Choose **GitHub**
   - Authorize Netlify to access your GitHub account
   - Select repository: `Lapelis321/studentevents`
   - Select branch: `main`
   - Click **"Save"**

#### 5.3: Verify Build Hooks

1. **In Build & deploy**, scroll to **"Build hooks"**
2. **Check if there's a webhook listed**
3. **If not, or if you want to recreate it**:
   - Click **"Add build hook"**
   - Name it: "GitHub Push Hook"
   - Branch to build: `main`
   - Click **"Save"**
   - Copy the webhook URL (you won't need it, but it's good to have)

---

### Step 6: Check GitHub Webhook (Advanced)

If auto-deploy still doesn't work, check the GitHub side:

1. **Go to your GitHub repository**: https://github.com/Lapelis321/studentevents
2. **Click "Settings"** (repository settings, not account)
3. **Click "Webhooks"** in the left sidebar
4. **Look for Netlify webhook**:
   - You should see a webhook with URL like: `https://api.netlify.com/hooks/github`
   - It should have a green checkmark ✅

5. **If webhook is missing or has a red X**:
   - Click **"Add webhook"**
   - Payload URL: (leave this - Netlify will add it automatically when you reconnect)
   - **Better approach**: Go back to Netlify and re-link the repository (Step 5.2)

6. **If webhook exists but failing**:
   - Click on the webhook
   - Scroll down to "Recent Deliveries"
   - Click on a recent delivery
   - Check the "Response" tab for errors
   - Common issues:
     - 401/403: Authorization problem → Re-link repository in Netlify
     - 404: Webhook URL wrong → Delete and recreate in Netlify
     - 500: Netlify server issue → Try manual deploy, then contact support

---

### Step 7: Enable Auto-Publishing

1. **Back in Netlify**, go to: `Site settings` → `Build & deploy` → `Deploy contexts`
2. **Find "Deploy Previews"** section
3. **Make sure these are set**:
   - ✅ **Branch deploys**: Set to "All" or "Let me choose" (and select `main`)
   - ✅ **Deploy previews**: Any pull request against your production branch
   - ✅ **Production branch**: `main`

4. **Check "Stop auto publishing"**:
   - Scroll down in the same section
   - Make sure **"Stop auto publishing"** is **NOT enabled**
   - If it's enabled (showing red "Auto publishing stopped"):
     - Click **"Start auto publishing"**
     - This is often the culprit!

---

### Step 8: Test Auto-Deploy

Let's verify auto-deploy is working:

1. **Make a small test change** in your local repository:
   ```bash
   # Open any file and add a comment
   echo "<!-- Test auto-deploy -->" >> index.html
   ```

2. **Commit and push**:
   ```bash
   git add index.html
   git commit -m "Test: Verify Netlify auto-deploy"
   git push origin main
   ```

3. **Watch Netlify**:
   - Go back to Netlify Deploys tab
   - Within 30-60 seconds, you should see a new deploy appear
   - Status: "Building..."
   - Wait for it to complete

4. **If it works**:
   - ✅ Auto-deploy is fixed!
   - Remove the test comment:
     ```bash
     git revert HEAD
     git push origin main
     ```

5. **If it doesn't work**:
   - Proceed to Step 9 (Troubleshooting)

---

### Step 9: Advanced Troubleshooting

#### 9.1: Check Build Logs

1. **In Netlify Deploys tab**, click on the most recent deploy
2. **Click "Deploy log"**
3. **Look for errors**:
   - Red error messages
   - "Build failed" status
   - Specific error messages about files or commands

#### 9.2: Check Netlify Status

1. **Visit**: https://www.netlifystatus.com/
2. **Check if there are any ongoing incidents**:
   - GitHub integration issues
   - Webhook processing delays
   - Build system problems

#### 9.3: Clear Build Cache

1. **In Netlify**: `Site settings` → `Build & deploy` → `Build settings`
2. **Scroll to "Build image selection"**
3. **Click "Clear build cache"**
4. **Then trigger a new deploy**

#### 9.4: Check Environment Variables

1. **Go to**: `Site settings` → `Environment variables`
2. **Check if API_BASE_URL is set**:
   - Should be: `https://studentevents-production.up.railway.app/api`
3. **If missing or wrong**:
   - Click **"Add a variable"**
   - Key: `API_BASE_URL`
   - Value: `https://studentevents-production.up.railway.app/api`
   - Scopes: All scopes
   - Click **"Create variable"**

#### 9.5: Re-link Repository (Nuclear Option)

If nothing else works:

1. **In Netlify**: `Site settings` → `Build & deploy` → `Continuous deployment`
2. **Click "Unlink repository"**
3. **Confirm unlinking**
4. **Wait 30 seconds**
5. **Click "Link repository"**
6. **Re-authorize GitHub**
7. **Select**: `Lapelis321/studentevents` → `main` branch
8. **Save**
9. **Trigger a manual deploy**
10. **Test with Step 8**

---

## 🎯 Quick Checklist

Use this checklist to verify everything:

- [ ] Logged in to Netlify
- [ ] Found "afterstateevents" site
- [ ] Manually triggered deploy successfully
- [ ] Verified new code is live (3 events, badges visible)
- [ ] Checked "Auto publishing" is enabled
- [ ] Verified GitHub repository is linked
- [ ] Confirmed production branch is `main`
- [ ] GitHub webhook exists and has green checkmark
- [ ] Made test commit and verified auto-deploy worked
- [ ] Cleaned up test commit

---

## 📞 Still Not Working?

### Option 1: Contact Netlify Support
1. **In Netlify dashboard**, click the **"Support"** button (bottom left)
2. **Click "Contact support"**
3. **Describe the issue**:
   ```
   Subject: Auto-deploy from GitHub not working
   
   My site "afterstateevents" is not auto-deploying when I push to GitHub.
   - Repository: Lapelis321/studentevents
   - Branch: main
   - Multiple commits pushed, but no deploys triggered
   - Manual deploys work fine
   - Request help checking GitHub webhook and auto-publish settings
   ```

### Option 2: Deploy to Alternative Platform

If Netlify continues to have issues, you can deploy the frontend to:

**Vercel** (recommended alternative):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**GitHub Pages**:
```bash
# Add to package.json scripts
"scripts": {
  "deploy": "gh-pages -d ."
}

# Deploy
npm run deploy
```

**Cloudflare Pages**:
- Go to: https://dash.cloudflare.com/
- Pages → Create project
- Connect GitHub repository
- Deploy

---

## 🔍 Common Causes & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| No deploys appearing | Auto-publishing stopped | Enable auto-publishing in settings |
| Webhook not firing | GitHub disconnected | Re-link repository |
| Build succeeds but old code | Browser cache | Hard refresh (Ctrl+Shift+R) |
| Deploy fails | Build command error | Check build logs, fix errors |
| Webhook shows 401/403 | OAuth expired | Re-authorize GitHub in Netlify |
| Deploys very delayed | Netlify incident | Check netlifystatus.com |

---

## ✅ Expected Result

After fixing auto-deploy:

1. **Every time you push to GitHub**:
   - Netlify automatically detects the push (within 60 seconds)
   - Starts a new build
   - Deploys the new code
   - You receive an email notification (if enabled)

2. **Your live site** (https://afterstateevents.netlify.app):
   - Always shows the latest code from `main` branch
   - Updates automatically within 2-3 minutes of pushing

3. **No more manual intervention needed**:
   - Push to GitHub → Automatic deployment
   - Just code, commit, push, and it's live!

---

**Created**: October 9, 2025  
**For**: afterstateevents.netlify.app  
**Repository**: Lapelis321/studentevents

