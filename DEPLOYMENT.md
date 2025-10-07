# Railway Deployment Guide - Business Lead Finder

This guide will walk you through deploying your Business Lead Finder MCP app to Railway and testing it in ChatGPT Developer Mode.

## 🎯 Goal

Deploy both the MCP server and UI to Railway, then connect the app to ChatGPT to test your interactive lead finder widgets.

## 📋 Prerequisites

- [x] GitHub account
- [x] Railway account (sign up at [railway.app](https://railway.app) - free tier available)
- [x] Your code pushed to a GitHub repository
- [x] ChatGPT Plus or Pro subscription (for Developer Mode access)

---

## 🚀 Part 1: Deploy to Railway

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
cd /Users/taylorbeck/Code/apps-sdk
git add .
git commit -m "Add Railway deployment configs"
git push origin main
```

### Step 2: Deploy the UI Service First

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub

2. **Create a New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository: `apps-sdk`

3. **Configure the UI Service:**
   - Railway will auto-detect your project
   - Click **"Add Service"** → **"From GitHub repo"**
   - Select your repo again
   
4. **Set Root Directory:**
   - Click on the service
   - Go to **Settings** → **Root Directory**
   - Set to: `lead-finder-ui`
   - Click **"Update"**

5. **Configure Build Command:**
   - Go to **Settings** → **Build**
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s ./assets -p $PORT --cors`
   - Click **"Update"**

6. **Deploy:**
   - Railway will automatically start deploying
   - Wait for deployment to complete (2-3 minutes)
   - Look for "Success" status

7. **Get Your UI URL:**
   - Click on **Settings** → **Networking**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `https://lead-finder-ui-production.up.railway.app`)
   - **✏️ Save this URL - you'll need it in the next step!**

### Step 3: Deploy the MCP Server Service

1. **Add Another Service:**
   - In the same Railway project, click **"New"** → **"GitHub Repo"**
   - Select your repository again
   
2. **Set Root Directory:**
   - Click on the new service
   - Go to **Settings** → **Root Directory**
   - Set to: `lead-finder-server`
   - Click **"Update"**

3. **Add Environment Variable:**
   - Go to **Variables** tab
   - Click **"New Variable"**
   - Add:
     ```
     WIDGET_BASE_URL=https://your-ui-service-url.up.railway.app
     ```
     ⚠️ **Replace with your actual UI URL from Step 2.7**
   
   Example:
   ```
   WIDGET_BASE_URL=https://lead-finder-ui-production.up.railway.app
   ```

4. **Configure Service:**
   - Railway should auto-detect Python
   - If needed, go to **Settings** → **Build**
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Deploy:**
   - Railway will automatically deploy
   - Wait for "Success" status

6. **Get Your MCP Server URL:**
   - Go to **Settings** → **Networking**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `https://lead-finder-mcp.up.railway.app`)
   - **✏️ Save this URL - you'll use it to connect to ChatGPT!**

### Step 4: Verify Deployment

**Test UI Assets:**
```bash
# Replace with your actual UI URL
curl https://your-ui-url.up.railway.app/lead-finder.js
curl https://your-ui-url.up.railway.app/lead-finder.css
```

You should see JavaScript and CSS content (not 404 errors).

**Test MCP Server:**
```bash
# Replace with your actual MCP server URL
curl -N https://your-mcp-url.up.railway.app/mcp
```

You should see SSE connection established or JSON response.

---

## 🔗 Part 2: Connect to ChatGPT Developer Mode

### Step 1: Access Developer Mode

1. **Open ChatGPT** (you need ChatGPT Plus or Pro)
2. **Go to Settings:**
   - Click your profile icon (bottom left)
   - Select **"Settings"**
   - Go to **"Developer"** section

3. **Enable Developer Mode** (if not already enabled)

### Step 2: Add Your MCP Server

1. **Click "Add MCP Server"** or **"Connect Custom Server"**

2. **Enter Server Details:**
   - **Server Name:** `Business Lead Finder`
   - **Server URL:** `https://your-mcp-url.up.railway.app/mcp`
     
     ⚠️ **Important:** Add `/mcp` to the end of your Railway MCP server URL!
     
     Example: `https://lead-finder-mcp-production.up.railway.app/mcp`

3. **Click "Connect"** or **"Save"**

4. **Wait for Connection:**
   - ChatGPT will verify the connection
   - You should see "Connected" status
   - The server should appear in your list of connected tools

### Step 3: Test Your Lead Finder App

**Test Tool 1: Find Business Leads**

In ChatGPT, type:
```
Find business leads for CRM software companies in the tech industry
```

**Expected Result:**
- ChatGPT will call the `find-business-leads` tool
- You should see a widget appear with:
  - List of leads with company names and details
  - Lead scores and quality indicators
  - Filters for hot/warm/cold leads
  - Action buttons (Enrich, Export, Analytics)
  - Interactive UI with hover states

**Test Tool 2: Analytics Dashboard**

Type:
```
Show me an analytics dashboard for the leads
```

**Expected Result:**
- ChatGPT will call the `analyze-lead-trends` tool
- You should see a dashboard widget with:
  - Lead distribution charts
  - Quality metrics
  - Industry breakdown
  - Trend analysis

**Test Tool 3: CRM Export**

Type:
```
Export these leads to CRM
```

**Expected Result:**
- ChatGPT will call the `export-to-crm` tool
- You should see an export widget with:
  - CRM platform options (Salesforce, HubSpot, Pipedrive)
  - Field mapping interface
  - Export settings

### Step 4: Test Interactive Features

**Within the Lead Finder Widget:**

1. **Selection:**
   - Click checkboxes to select leads
   - Click "Select All" to select multiple

2. **Filtering:**
   - Click filter buttons (All Leads, Hot, Warm)
   - Watch the list update dynamically

3. **Actions:**
   - Click "Enrich Selected"
   - Widget should call back to the MCP server
   - Data should update with enriched information

4. **Display Modes:**
   - Click the expand icon (if present)
   - Widget should request fullscreen mode
   - Layout should adapt to larger space

5. **Theme:**
   - Toggle ChatGPT dark/light mode
   - Widget should adapt to the theme

---

## 🔍 Troubleshooting

### Issue: Widget Doesn't Appear

**Check:**
1. Is the UI service running on Railway?
   ```bash
   curl https://your-ui-url.up.railway.app/lead-finder.js
   ```
   Should return JavaScript (not 404)

2. Is `WIDGET_BASE_URL` set correctly in MCP server?
   - Go to Railway → MCP Server → Variables
   - Verify URL matches your UI service URL (no trailing slash)

3. Check browser console (F12):
   - Look for CORS errors
   - Look for 404 errors on JS/CSS files

**Fix:**
- Update `WIDGET_BASE_URL` in Railway
- Redeploy the MCP server service

### Issue: MCP Connection Failed

**Check:**
1. Is the MCP endpoint responding?
   ```bash
   curl -N https://your-mcp-url.up.railway.app/mcp
   ```

2. Did you include `/mcp` in the URL when connecting to ChatGPT?

3. Check Railway logs:
   - Go to Railway → MCP Server → Deployments → View Logs
   - Look for startup errors

**Fix:**
- Ensure correct URL with `/mcp` endpoint
- Check Railway deployment logs for errors
- Restart the service in Railway

### Issue: CORS Errors

**Symptoms:**
- Browser console shows: `Access to script blocked by CORS policy`

**Check:**
1. Is the UI service using `serve` with `--cors` flag?
   - Go to Railway → UI Service → Settings
   - Verify Start Command: `npx serve -s ./assets -p $PORT --cors`

**Fix:**
- Update start command to include `--cors`
- Redeploy UI service

### Issue: Tools Not Found

**Symptoms:**
- ChatGPT says: "I don't have access to lead finder tools"

**Check:**
1. Is MCP server connected in ChatGPT settings?
2. Test connection:
   ```bash
   curl https://your-mcp-url.up.railway.app/mcp
   ```

**Fix:**
- Reconnect the MCP server in ChatGPT settings
- Verify server is running on Railway

### Issue: Mock Data Not Showing

**This is expected!** The app uses mock data for demonstration. In a real deployment, you'd:
1. Add API keys for Reddit, Twitter, LinkedIn APIs
2. Update the mock data generator to call real APIs
3. Add environment variables to Railway

---

## 📊 Railway Dashboard Overview

Your Railway project should have 2 services:

### Service 1: lead-finder-ui
- **Root Directory:** `lead-finder-ui`
- **Build:** `npm install && npm run build`
- **Start:** `npx serve -s ./assets -p $PORT --cors`
- **Domain:** `https://lead-finder-ui-xxx.up.railway.app`
- **Purpose:** Serves React widget bundles (JS/CSS)

### Service 2: lead-finder-server
- **Root Directory:** `lead-finder-server`
- **Build:** Auto (Python detected)
- **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Variables:** `WIDGET_BASE_URL=<ui-service-url>`
- **Domain:** `https://lead-finder-mcp-xxx.up.railway.app`
- **Purpose:** MCP server that handles tool calls from ChatGPT

---

## 🔄 Updating Your Deployment

### Update UI (Widget Changes)

```bash
cd lead-finder-ui
# Make your changes to src/
git add .
git commit -m "Update widget UI"
git push origin main
```

Railway will automatically:
1. Rebuild the UI service
2. Deploy the new assets
3. Widgets in ChatGPT will load the new code on next tool call

### Update Server (Tool Changes)

```bash
cd lead-finder-server
# Make your changes to main.py
git add .
git commit -m "Update MCP tools"
git push origin main
```

Railway will automatically:
1. Rebuild the MCP server
2. Restart the service
3. ChatGPT will use the new tools immediately

---

## 💡 Tips for Testing

### Prompts to Try

1. **Basic Search:**
   ```
   Find leads for SaaS companies looking for CRM software
   ```

2. **Filtered Search:**
   ```
   Show me hot leads in the enterprise software space
   ```

3. **Analytics:**
   ```
   Give me an analytics dashboard for these leads
   ```

4. **Export:**
   ```
   Export the top 5 leads to Salesforce
   ```

5. **Complex Workflow:**
   ```
   Find leads in the healthcare AI industry, enrich the top 3, 
   and prepare them for export to HubSpot
   ```

### Widget Interaction Testing

- ✅ Click leads to select them
- ✅ Use filters to narrow down results
- ✅ Click "Enrich Selected" to trigger tool calls
- ✅ Try "View Dashboard" to switch widgets
- ✅ Test responsive behavior (resize window)
- ✅ Toggle dark mode to test theme adaptation

---

## 🎓 Understanding the Architecture

### How It All Works

```
┌─────────────┐
│  ChatGPT    │
│  (Browser)  │
└──────┬──────┘
       │ 1. User asks for leads
       ↓
┌──────────────────────┐
│  MCP Server          │  https://your-mcp.up.railway.app
│  (lead-finder-server)│
└──────┬───────────────┘
       │ 2. Returns structured data + widget HTML
       │    Widget HTML references: https://your-ui.up.railway.app/lead-finder.js
       ↓
┌──────────────────────┐
│  ChatGPT Iframe      │  Loads widget
│  window.openai       │  Provides toolOutput data
└──────┬───────────────┘
       │ 3. Loads React widget
       ↓
┌──────────────────────┐
│  UI Service          │  https://your-ui.up.railway.app
│  (lead-finder-ui)    │  Serves: lead-finder.js, lead-finder.css
└──────────────────────┘
```

**Key Points:**
- MCP server and UI are **separate services**
- MCP server **references** UI URLs in widget HTML
- ChatGPT **loads** UI assets in an iframe
- Widgets **call back** to MCP server via `window.openai.callTool()`

---

## 🚧 Production Readiness Checklist

Before using this for real lead generation:

- [ ] Replace mock data with real API calls
- [ ] Add API keys as Railway environment variables
- [ ] Set up error logging/monitoring
- [ ] Add rate limiting to prevent abuse
- [ ] Implement proper authentication if needed
- [ ] Add analytics to track usage
- [ ] Test with real ChatGPT conversations
- [ ] Document API costs and limits
- [ ] Set up alerts for service downtime

---

## 📚 Additional Resources

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **OpenAI Apps SDK:** Check `apps-sdk/` folder for documentation
- **Architecture:** See `ARCHITECTURE.md` for detailed explanation
- **FastMCP Docs:** [github.com/jlowin/fastmcp](https://github.com/jlowin/fastmcp)
- **MCP Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)

---

## 🎉 Success!

If you've made it here, you should have:
- ✅ Both services deployed to Railway
- ✅ MCP server connected to ChatGPT
- ✅ Interactive widgets appearing in conversations
- ✅ Tools working and returning data

**Next steps:**
1. Customize the UI styling
2. Add real lead generation APIs
3. Enhance the mock data with more variety
4. Add more tools (lead scoring, email campaigns, etc.)
5. Share your MCP server URL with team members

---

## 💬 Need Help?

Common issues and solutions:

| Problem | Solution |
|---------|----------|
| Widget not loading | Check `WIDGET_BASE_URL` in Railway variables |
| CORS error | Ensure UI service uses `--cors` flag |
| MCP not connecting | Verify URL includes `/mcp` endpoint |
| Old widget showing | Clear browser cache, trigger new tool call |
| Railway build fails | Check logs in Railway → Deployments |

**Still stuck?** Check Railway logs:
1. Go to Railway dashboard
2. Click on the failing service
3. Go to Deployments → Latest deployment
4. Click "View Logs"
5. Look for error messages

---

**Happy deploying! 🚀**

