# Business Lead Finder MCP Server

Python FastMCP server implementing the Model Context Protocol for AI-powered lead generation.

## Quick Start

### 1. Install Dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python main.py
```

The server will start at `http://localhost:8000` with MCP endpoints at `/mcp`.

### 3. Test with MCP Inspector

Point your MCP Inspector to `http://localhost:8000/mcp` to test the tools.

### 4. Expose Publicly (for ChatGPT testing)

```bash
ngrok http 8000
```

Then add the ngrok URL to ChatGPT Settings → Connectors.

## Available Tools

### `find-business-leads`
Find high-quality business leads by analyzing social conversations.

**Parameters:**
- `search_terms` (required): Keywords to search for
- `industry_focus` (optional): Target industry
- `platforms` (default: reddit, twitter, linkedin): Platforms to search
- `max_leads` (default: 50): Maximum number of leads

### `analyze-lead-trends`
Show analytics dashboard with lead metrics and trends.

**Parameters:**
- `time_range` (default: 30d): Time range for analysis

### `export-to-crm`
Export leads to CRM systems (Salesforce, HubSpot, Pipedrive).

**Parameters:**
- `lead_ids` (required): IDs of leads to export
- `crm_system` (required): Target CRM system
- `create_tasks` (default: true): Create follow-up tasks
- `set_reminders` (default: true): Set reminders

## Architecture

- **FastMCP**: Official Python MCP server framework
- **Pydantic**: Input validation and type safety
- **Uvicorn**: ASGI server for FastAPI
- **Widget Resources**: HTML templates with embedded React components

## Development

### Hot Reload

The server runs with `reload=True` for development. Changes to `main.py` will automatically restart the server.

### Mock Data

Currently uses mock lead data for demonstration. In production, integrate with:
- Reddit API
- Twitter API
- LinkedIn API
- Hunter.io (email finding)
- Clearbit (company data)

### Widget URLs

During development, widgets are served from `http://localhost:4444` (the Vite dev server).

For production, update widget HTML URLs in `main.py` to point to your CDN.

## Testing with ChatGPT

1. Start the server: `python main.py`
2. Expose via ngrok: `ngrok http 8000`
3. In ChatGPT:
   - Enable Developer Mode
   - Settings → Connectors → Add connector
   - Enter: `https://YOUR-NGROK-URL.ngrok-free.app/mcp`
4. Test prompts:
   - "Find business leads for CRM software"
   - "Show me lead analytics"
   - "Export my top 5 leads to HubSpot"

## Production Deployment

Update widget HTML URLs to point to your production CDN before deploying.

