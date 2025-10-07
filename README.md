# Business Lead Finder - OpenAI Apps SDK Implementation

AI-powered business lead generation tool built with the OpenAI Apps SDK (MCP + React).

## 🚀 Quick Start

### 1. Set Up the MCP Server (Backend)

```bash
cd lead-finder-server

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

Server runs at `http://localhost:8000` with MCP endpoint at `/mcp`.

### 2. Set Up the UI Components (Frontend)

```bash
cd lead-finder-ui

# Install dependencies
pnpm install

# Start dev server
pnpm run dev
```

UI dev server runs at `http://localhost:4444`.

### 3. Test with ChatGPT

#### Option A: Use ngrok (Recommended for Testing)

```bash
# In a new terminal, expose the MCP server
ngrok http 8000
```

Then in ChatGPT:
1. Enable Developer Mode in Settings
2. Go to Settings → Connectors → Add connector
3. Enter: `https://YOUR-NGROK-URL.ngrok-free.app/mcp`
4. Test with prompts like: "Find business leads for CRM software"

#### Option B: Use MCP Inspector (Local Testing)

Point MCP Inspector to `http://localhost:8000/mcp` to test tools locally.

## 📁 Project Structure

```
/lead-finder-server/           # Python MCP Server
  ├── main.py                   # FastMCP server with tools
  ├── requirements.txt          # Python dependencies
  ├── env.example              # Environment variables template
  └── README.md                 # Server documentation

/lead-finder-ui/               # React UI Components
  ├── src/
  │   ├── lead-finder/         # Main lead search component
  │   ├── lead-dashboard/      # Analytics dashboard
  │   ├── crm-export/          # CRM export tool
  │   └── shared/              # Shared utilities & types
  ├── assets/                   # Built bundles (generated)
  ├── build-all.mts            # Build orchestrator
  ├── vite.config.mts          # Vite configuration
  ├── package.json             # Dependencies
  └── README.md                # UI documentation
```

## 🛠️ Available Tools

### `find-business-leads`
Find high-quality business leads by analyzing social conversations.

**Example Prompts:**
- "Find business leads for CRM software in the technology industry"
- "Search for companies looking for marketing automation"
- "Find leads for sales prospecting tools with high purchase intent"

### `analyze-lead-trends`
Show analytics dashboard with lead metrics and trends.

**Example Prompts:**
- "Show me lead analytics for the past month"
- "Analyze my lead generation trends"

### `export-to-crm`
Export leads to CRM systems (Salesforce, HubSpot, Pipedrive).

**Example Prompts:**
- "Export my top 5 leads to HubSpot"
- "Send hot leads to Salesforce with follow-up tasks"

## 🎨 Features

### Lead Finder Component
- **Smart Filtering**: Filter by lead score (Hot/Warm/Cold)
- **Bulk Selection**: Select multiple leads for batch operations
- **Real-time Search**: Analyze social conversations for purchase intent
- **Contact Enrichment**: Email discovery and company data
- **Source Tracking**: LinkedIn, Reddit, Twitter integration

### Analytics Dashboard
- **Lead Distribution**: Visual breakdown of lead quality
- **Growth Metrics**: Weekly and monthly trends
- **Performance Tracking**: Conversion rates and response times
- **Industry Insights**: Top industries and locations

### CRM Export
- **Multi-CRM Support**: Salesforce, HubSpot, Pipedrive
- **Automated Follow-ups**: Create tasks and set reminders
- **Field Mapping**: Comprehensive lead data export
- **Status Tracking**: Real-time export progress

## 🔧 Development

### Building for Production

```bash
cd lead-finder-ui
pnpm run build
```

This generates hashed bundles in `assets/`:
- `lead-finder-{hash}.js/css/html`
- `lead-dashboard-{hash}.js/css/html`
- `crm-export-{hash}.js/css/html`

### Updating Widget URLs

After building, update the MCP server (`lead-finder-server/main.py`) with production URLs:

```python
html=(
    '<div id="lead-finder-root"></div>\n'
    '<link rel="stylesheet" href="https://your-cdn.com/assets/lead-finder-{hash}.css">\n'
    '<script type="module" src="https://your-cdn.com/assets/lead-finder-{hash}.js"></script>'
)
```

### Hot Reload Development

1. **Server**: Runs with `reload=True` - changes to `main.py` auto-restart
2. **UI**: Vite dev server provides instant hot module replacement

## 📦 Deployment

### 🚀 Quick Deploy to Railway (Recommended)

Deploy both MCP server and UI to Railway in under 5 minutes:

**📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions**

Or use the quick reference: [RAILWAY-QUICKSTART.md](./RAILWAY-QUICKSTART.md)

**Why Railway?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Git-based deployments
- ✅ Simple environment variables
- ✅ One platform for both services

**Quick Summary:**
1. Deploy UI service → Get URL
2. Deploy MCP server with `WIDGET_BASE_URL=<ui-url>`
3. Connect to ChatGPT with MCP endpoint
4. Start testing!

### Other Deployment Options

- **Vercel + Render**: UI on Vercel, Server on Render
- **Fly.io**: Docker-based deployment
- **Cloud Run**: Google Cloud serverless
- **DigitalOcean**: App Platform

See [DEPLOYMENT.md](./DEPLOYMENT.md) for all options and detailed guides.

## 🔑 Environment Variables

Create `.env` in `lead-finder-server/`:

```bash
# See env.example for full list
OPENAI_API_KEY=sk-...
REDDIT_CLIENT_ID=...
TWITTER_BEARER_TOKEN=...
HUNTER_API_KEY=...
CLEARBIT_API_KEY=...
STRIPE_SECRET_KEY=sk_live_...
```

## 🧪 Testing

### Test Prompts

Try these in ChatGPT:

```
1. "Find business leads for CRM software"
2. "Show me companies looking for marketing automation with high purchase intent"
3. "Analyze my lead trends for the past 30 days"
4. "Export my top 10 leads to HubSpot with follow-up tasks"
5. "Find leads in the SaaS industry targeting mid-market companies"
```

### Local Testing

```bash
# Terminal 1: Start MCP server
cd lead-finder-server
python main.py

# Terminal 2: Start UI dev server
cd lead-finder-ui
pnpm run dev

# Terminal 3: Expose via ngrok
ngrok http 8000
```

## 📚 Documentation

- **🚀 Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete Railway deployment walkthrough
- **⚡ Quick Start**: [RAILWAY-QUICKSTART.md](./RAILWAY-QUICKSTART.md) - 5-minute deployment
- **🏗️ Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into how everything works
- **Server README**: `lead-finder-server/README.md`
- **UI README**: `lead-finder-ui/README.md`
- **Apps SDK Docs**: `apps-sdk/` - OpenAI Apps SDK documentation

## 🎯 Next Steps

1. ✅ **Test Locally**: Run both servers and test with MCP Inspector
2. ✅ **Test in ChatGPT**: Use ngrok to expose and test in ChatGPT
3. 🔄 **Add Real APIs**: Integrate Reddit, Twitter, Hunter.io, Clearbit
4. 🔄 **Deploy to Production**: Choose Railway, Fly.io, or DigitalOcean
5. 🔄 **Monetize**: Set up Stripe for subscription tiers

## 💡 Key Patterns

### MCP Server (Python)
- **FastMCP**: Official Python MCP framework
- **Widget Resources**: HTML templates with embedded React
- **Tool Registration**: Type-safe tool definitions with Pydantic
- **Mock Data**: Development-friendly mock lead generation

### React Components
- **`useWidgetProps()`**: Access MCP tool output
- **`useWebplusGlobal()`**: Access layout/theme globals
- **`window.openai.callTool()`**: Call tools from UI
- **`window.openai.setWidgetState()`**: Persist component state

### Build Pipeline
- **Vite**: Fast dev server with HMR
- **build-all.mts**: Multi-entry bundler
- **Hashing**: Version-based cache busting
- **Tailwind**: Utility-first styling

## 🤝 Contributing

This is a reference implementation following OpenAI Apps SDK best practices. Feel free to:
- Add more lead sources (Facebook, Instagram, TikTok)
- Enhance scoring algorithms
- Add more CRM integrations
- Improve UI/UX

## 📄 License

MIT

---

**Built with the OpenAI Apps SDK**

