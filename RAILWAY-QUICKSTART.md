# Railway Deployment - Quick Reference

**Quick 5-minute deployment guide for Business Lead Finder**

## 📋 Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] UI service deployed
- [ ] MCP server deployed  
- [ ] Environment variable set
- [ ] Connected to ChatGPT

---

## 🚀 Quick Steps

### 1. Deploy UI Service (2 min)

```
1. Go to railway.app → New Project → Deploy from GitHub
2. Select your repo → Add Service
3. Settings → Root Directory: lead-finder-ui
4. Settings → Build: npm install && npm run build
5. Settings → Start: npx serve -s ./assets -p $PORT --cors
6. Settings → Networking → Generate Domain
7. Copy URL: lead-finder-chatgpt-production.up.railway.app
```

### 2. Deploy MCP Server (2 min)

```
1. Same Railway project → New → GitHub Repo
2. Select your repo again
3. Settings → Root Directory: lead-finder-server
4. Variables → Add: WIDGET_BASE_URL=<your-ui-url-from-step-1>
5. Settings → Start: uvicorn main:app --host 0.0.0.0 --port $PORT
6. Settings → Networking → Generate Domain
7. Copy URL: https://lead-finder-mcp-xxx.up.railway.app
```

### 3. Connect to ChatGPT (1 min)

```
1. ChatGPT → Settings → Developer
2. Add MCP Server
3. Name: Business Lead Finder
4. URL: https://lead-finder-mcp-xxx.up.railway.app/mcp
   ⚠️ Don't forget /mcp at the end!
5. Save → Wait for "Connected" status
```

### 4. Test (30 sec)

```
In ChatGPT, type:
"Find business leads for CRM software"

Expected: Widget appears with lead list ✨
```

---

## 🔗 Your URLs

Fill these in as you deploy:

```
UI Service:     https://___________________________.up.railway.app
MCP Server:     https://___________________________.up.railway.app
MCP Endpoint:   https://___________________________.up.railway.app/mcp
```

---

## 🔧 Environment Variables

**MCP Server must have:**
```bash
WIDGET_BASE_URL=https://your-ui-service.up.railway.app
```

⚠️ **Important:** No trailing slash!

---

## ✅ Verification

**Test UI:**
```bash
curl https://your-ui-url.up.railway.app/lead-finder.js
# Should return JavaScript code
```

**Test MCP:**
```bash
curl https://your-mcp-url.up.railway.app/mcp
# Should return SSE connection or JSON
```

**Test in ChatGPT:**
```
Prompt: "Find leads for SaaS companies"
Result: Widget with leads appears
```

---

## 🐛 Quick Fixes

| Issue | Fix |
|-------|-----|
| Widget doesn't load | Check `WIDGET_BASE_URL` in Railway |
| CORS error | Add `--cors` to UI start command |
| MCP won't connect | Add `/mcp` to the URL |
| 404 on JS files | Rebuild UI service |

---

## 📖 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

---

**Railway Dashboard:** https://railway.app/dashboard
**ChatGPT Settings:** https://chat.openai.com/settings (→ Developer tab)

