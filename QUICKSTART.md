# Business Lead Finder - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm (or npm)
- ngrok (for ChatGPT testing)

## Step 1: Start the MCP Server (2 minutes)

```bash
cd lead-finder-server

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server (runs on port 8000)
python main.py
```

✅ You should see: `INFO: Application startup complete.`

## Step 2: Start the UI Dev Server (1 minute)

In a **new terminal**:

```bash
cd lead-finder-ui

# Install dependencies (first time only)
pnpm install

# Start dev server (runs on port 4444)
pnpm run dev
```

✅ You should see: `VITE v7.x.x ready in xxx ms`

## Step 3: Test Locally with MCP Inspector (Optional)

Visit the MCP Inspector and point it to:
```
http://localhost:8000/mcp
```

Try calling the `find-business-leads` tool to verify everything works.

## Step 4: Expose to ChatGPT (2 minutes)

In a **new terminal**:

```bash
# Install ngrok if you haven't
# brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose your MCP server
ngrok http 8000
```

Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

## Step 5: Connect to ChatGPT (1 minute)

1. Open ChatGPT (chatgpt.com)
2. Go to **Settings** → **Features** → Enable **Developer Mode**
3. Go to **Settings** → **Connectors** → Click **"Add connector"**
4. Enter your ngrok URL + `/mcp`:
   ```
   https://abc123.ngrok-free.app/mcp
   ```
5. Click **"Test connection"** → Should show ✅ Success

## Step 6: Test It! 🎉

Try these prompts in ChatGPT:

### Basic Search
```
Find business leads for "CRM software" in the technology industry
```

### With Filters
```
Show me companies looking for "marketing automation" with high purchase intent
```

### Analytics
```
Analyze my lead trends
```

### Export
```
Export my top 5 leads to HubSpot
```

## What You'll See

1. **ChatGPT calls your MCP server** → Shows "Searching for high-quality business leads"
2. **Server returns mock leads** → ChatGPT receives the data
3. **React component renders** → Beautiful UI appears inline in ChatGPT
4. **Interactive widget** → You can filter, select, and interact with leads

## Troubleshooting

### Server won't start

**Error**: `ModuleNotFoundError: No module named 'mcp'`

**Fix**:
```bash
pip install mcp fastmcp
```

### UI won't start

**Error**: `pnpm: command not found`

**Fix**:
```bash
npm install -g pnpm
# or use npm instead: npm install && npm run dev
```

### ChatGPT can't connect

**Error**: "Connection failed"

**Check**:
1. Is the MCP server running? (port 8000)
2. Is ngrok running and showing the correct URL?
3. Did you add `/mcp` to the end of the URL?
4. Try refreshing the connection in ChatGPT

### Widget doesn't render

**Check**:
1. Is the UI dev server running? (port 4444)
2. Check browser console for errors
3. Verify widget HTML URLs in `lead-finder-server/main.py` point to `http://localhost:4444`

## Development Workflow

### Making Changes to the Server

1. Edit `lead-finder-server/main.py`
2. Server auto-restarts (reload=True)
3. Test in ChatGPT (no need to restart ngrok)

### Making Changes to the UI

1. Edit files in `lead-finder-ui/src/`
2. Changes appear instantly (hot reload)
3. Refresh the ChatGPT conversation to see updates

## What's Next?

### Add Real Data
Replace mock data with real APIs:
- Reddit API for social mentions
- Twitter API for brand mentions
- Hunter.io for email finding
- Clearbit for company data

### Deploy to Production
Choose a deployment option:
- **Railway**: `railway deploy`
- **Fly.io**: `fly deploy`
- **DigitalOcean**: App Platform

### Monetize
- Set up Stripe for subscriptions
- Implement usage limits
- Add authentication

## Need Help?

- **Server Issues**: Check `lead-finder-server/README.md`
- **UI Issues**: Check `lead-finder-ui/README.md`
- **Architecture**: Check `PLAN.md`
- **Apps SDK**: Check `apps-sdk/` folder

## Key Files

| File | Purpose |
|------|---------|
| `lead-finder-server/main.py` | MCP server with tools |
| `lead-finder-ui/src/lead-finder/index.tsx` | Main React component |
| `lead-finder-ui/vite.config.mts` | Vite configuration |
| `lead-finder-ui/build-all.mts` | Production build script |

---

**Congratulations!** 🎉 You now have a working OpenAI Apps SDK application!

Test it thoroughly, then deploy to production following the deployment guides.

