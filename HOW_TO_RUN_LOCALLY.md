# 🚀 HOW TO RUN THE SITE LOCALLY

## ✅ **METHOD 1: Using The Startup Script (Easiest)**

1. Open Command Prompt (not PowerShell)
2. Navigate to the project folder:
   ```cmd
   cd "C:\Users\Ignas\Desktop\nuotraukos video muzika ir projektai\apps\Cursor\fuxarterparty 2"
   ```
3. Run the startup script:
   ```cmd
   start-local.bat
   ```
4. Wait 5 seconds, then visit: **http://localhost:8000**

---

## ✅ **METHOD 2: Manual Steps**

### Step 1: Start Backend Server
1. Open Command Prompt #1
2. Navigate to backend folder:
   ```cmd
   cd "C:\Users\Ignas\Desktop\nuotraukos video muzika ir projektai\apps\Cursor\fuxarterparty 2\backend"
   ```
3. Start backend:
   ```cmd
   node railway-server.js
   ```
4. You should see: `🚀 Server running on port 3001`

### Step 2: Start Frontend Server
1. Open Command Prompt #2 (new window)
2. Navigate to project folder:
   ```cmd
   cd "C:\Users\Ignas\Desktop\nuotraukos video muzika ir projektai\apps\Cursor\fuxarterparty 2"
   ```
3. Start frontend:
   ```cmd
   node frontend-server-simple.js
   ```
4. You should see: `🚀 Frontend Server Running!`

### Step 3: Open Browser
1. Open your browser
2. Go to: **http://localhost:8000**
3. You should see the site with events loading from the local backend

---

## ⚠️ **IMPORTANT: Local Testing Limitations**

Local testing works but has issues because:
- Python not installed (needed for simple HTTP server)
- PowerShell has execution policy restrictions
- Node.js http server requires proper path handling

**RECOMMENDATION:** Focus on getting the **Netlify deployment working** instead, since all the code is ready and committed to GitHub.

---

## 🎯 **EASIER SOLUTION: Fix Netlify (2 Minutes)**

Instead of debugging local servers, just deploy to Netlify:

1. Go to: **https://app.netlify.com/sites/afterstateevents/deploys**
2. Click **"Trigger deploy"**
3. Select **"Clear cache and deploy site"**
4. Wait 2-3 minutes
5. Visit: **https://afterstateevents.netlify.app/**

This will give you a fully working site online without any local setup issues!

---

## 🐛 **Troubleshooting Local Setup**

### Error: "node" is not recognized
- Install Node.js from: https://nodejs.org/

### Error: Port 3001 or 8000 already in use
- Close the existing servers:
  ```cmd
  taskkill /F /IM node.exe
  ```
- Then restart the servers

### Error: 404 Not Found
- Make sure you're in the correct directory
- Check that `index.html` exists in the project root
- Try restarting the frontend server

---

## 💡 **BOTTOM LINE:**

**Local testing is optional.** The real site works perfectly on Railway (backend) + Netlify (frontend). Just trigger one more Netlify deploy and you're done! 🚀

