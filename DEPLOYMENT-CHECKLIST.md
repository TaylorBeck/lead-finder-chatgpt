# 🚀 Railway Deployment Checklist

Use this checklist to track your deployment progress. Check off each step as you complete it!

---

## Prerequisites

- [ ] Code is working locally (tested both MCP server and UI)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub (`git push origin main`)
- [ ] Railway account created at [railway.app](https://railway.app)
- [ ] ChatGPT Plus or Pro subscription (for Developer Mode)

---

## Part 1: Deploy UI Service

- [ ] **1.1** Logged into Railway
- [ ] **1.2** Created new project from GitHub repo
- [ ] **1.3** Set root directory to `lead-finder-ui`
- [ ] **1.4** Set build command: `npm install && npm run build`
- [ ] **1.5** Set start command: `npx serve -s ./assets -p $PORT --cors`
- [ ] **1.6** Generated public domain
- [ ] **1.7** Deployment successful (status shows "Success")
- [ ] **1.8** Copied UI URL: `__________________________________.up.railway.app`
- [ ] **1.9** Verified UI works: `curl <ui-url>/lead-finder.js` returns JavaScript

---

## Part 2: Deploy MCP Server

- [ ] **2.1** Added new service to same Railway project
- [ ] **2.2** Connected to same GitHub repo
- [ ] **2.3** Set root directory to `lead-finder-server`
- [ ] **2.4** Added environment variable `WIDGET_BASE_URL` = (UI URL from step 1.8)
- [ ] **2.5** Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] **2.6** Generated public domain
- [ ] **2.7** Deployment successful (status shows "Success")
- [ ] **2.8** Copied MCP URL: `__________________________________.up.railway.app`
- [ ] **2.9** Verified MCP works: `curl <mcp-url>/mcp` returns response

---

## Part 3: Connect to ChatGPT

- [ ] **3.1** Opened ChatGPT
- [ ] **3.2** Went to Settings → Developer
- [ ] **3.3** Clicked "Add MCP Server" or "Connect Custom Server"
- [ ] **3.4** Entered server name: `Business Lead Finder`
- [ ] **3.5** Entered MCP endpoint: `<mcp-url>/mcp` (don't forget `/mcp`!)
- [ ] **3.6** Clicked Connect/Save
- [ ] **3.7** Status shows "Connected" ✅

---

## Part 4: Test the App

### Test 1: Find Business Leads
- [ ] **4.1** Typed: `"Find business leads for CRM software"`
- [ ] **4.2** Widget appeared in the chat
- [ ] **4.3** Widget shows list of leads
- [ ] **4.4** Leads have company names, scores, and details

### Test 2: Widget Interactions
- [ ] **4.5** Can click to select individual leads
- [ ] **4.6** Filter buttons work (All Leads / Hot / Warm)
- [ ] **4.7** "Select All" button works
- [ ] **4.8** Lead cards show all data correctly

### Test 3: Tool Calls from Widget
- [ ] **4.9** Selected some leads
- [ ] **4.10** Clicked "Enrich Selected" button
- [ ] **4.11** Tool was called successfully
- [ ] **4.12** Widget updated with enriched data

### Test 4: Other Tools
- [ ] **4.13** Typed: `"Show me lead analytics"`
- [ ] **4.14** Dashboard widget appeared
- [ ] **4.15** Typed: `"Export leads to CRM"`
- [ ] **4.16** Export widget appeared

### Test 5: Display Modes & Theme
- [ ] **4.17** Widget works in inline mode (default)
- [ ] **4.18** Toggled ChatGPT to dark mode → widget adapted
- [ ] **4.19** Toggled back to light mode → widget adapted

---

## Troubleshooting (If needed)

### Widget doesn't appear
- [ ] Checked Railway logs for MCP server
- [ ] Verified `WIDGET_BASE_URL` is set correctly
- [ ] Verified UI service is running
- [ ] Checked browser console (F12) for errors

### CORS errors in console
- [ ] Verified UI start command includes `--cors` flag
- [ ] Redeployed UI service
- [ ] Hard refreshed browser (Cmd+Shift+R / Ctrl+Shift+F5)

### MCP connection failed
- [ ] Verified URL includes `/mcp` endpoint
- [ ] Checked MCP server logs in Railway
- [ ] Tried reconnecting in ChatGPT settings
- [ ] Verified Railway service is running (not sleeping)

---

## 🎉 Success Criteria

You're done when you can:
- ✅ Ask ChatGPT to find leads
- ✅ See interactive widget with lead list
- ✅ Click and interact with the widget
- ✅ Widget calls tools successfully
- ✅ Analytics and export tools work

---

## 📝 Your URLs (Fill these in)

```
GitHub Repo:    https://github.com/____________________
Railway UI:     https://________________________________.up.railway.app
Railway MCP:    https://________________________________.up.railway.app
MCP Endpoint:   https://________________________________.up.railway.app/mcp
```

---

## Next Steps After Deployment

- [ ] Bookmark your Railway dashboard
- [ ] Save your MCP endpoint URL
- [ ] Test with different prompts (see DEPLOYMENT.md for examples)
- [ ] Share with team members
- [ ] Consider adding real API integrations
- [ ] Set up monitoring/alerts in Railway

---

## 📖 Need Help?

- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Reference**: [RAILWAY-QUICKSTART.md](./RAILWAY-QUICKSTART.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Railway Support**: [docs.railway.app](https://docs.railway.app)

---

**Progress**: Check off items as you complete them. You've got this! 🚀

