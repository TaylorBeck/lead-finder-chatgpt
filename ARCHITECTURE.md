# Business Lead Finder - Architecture Documentation

This document provides a comprehensive explanation of how the Business Lead Finder works, including all design patterns, file structures, and communication flows.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [MCP Server Deep Dive](#mcp-server-deep-dive)
3. [React UI Deep Dive](#react-ui-deep-dive)
4. [Build Pipeline Explained](#build-pipeline-explained)
5. [Communication Flow](#communication-flow)
6. [Key Patterns & Conventions](#key-patterns--conventions)

---

## High-Level Architecture

### The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                          ChatGPT                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ User: "Find business leads for CRM software"               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Model: Selects tool "find-business-leads"                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────┘
                               │ MCP Protocol
                               │ (HTTP/SSE)
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server (Python)                           │
│                   lead-finder-server/                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ main.py: FastMCP Server                                     │ │
│  │  - List tools (3 tools)                                     │ │
│  │  - Handle tool calls                                        │ │
│  │  - Generate mock lead data                                  │ │
│  │  - Return structured data + widget HTML                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ Returns:
                               │ - structuredContent: Lead data
                               │ - _meta: Widget HTML reference
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ChatGPT (renders widget)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ <iframe sandbox>                                            │ │
│  │   Loads: http://localhost:4444/lead-finder.js              │ │
│  │   Loads: http://localhost:4444/lead-finder.css             │ │
│  │                                                             │ │
│  │   React Component (lead-finder/index.tsx)                  │ │
│  │    - Reads window.openai.toolOutput                        │ │
│  │    - Displays interactive UI                               │ │
│  │    - Can call tools back via window.openai.callTool()      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               ↑
                               │ HTTP requests for JS/CSS
                               │
┌─────────────────────────────────────────────────────────────────┐
│                    Vite Dev Server                               │
│                   lead-finder-ui/                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Serves built React components                               │ │
│  │  - lead-finder.js                                           │ │
│  │  - lead-finder.css                                          │ │
│  │  - lead-dashboard.js/css                                    │ │
│  │  - crm-export.js/css                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Concepts

1. **MCP (Model Context Protocol)**: Standard protocol for connecting LLMs to external tools
2. **Widget**: React component that renders inside ChatGPT in an iframe
3. **Tool**: Server-side function that the model can call (like an API endpoint)
4. **Structured Content**: Data returned by tools that both the model and widget can use
5. **window.openai**: Global object that widgets use to communicate with ChatGPT

---

## MCP Server Deep Dive

### File Structure

```
lead-finder-server/
├── main.py              # Everything - MCP server, tools, widgets
├── requirements.txt     # Python dependencies
├── env.example         # Configuration template
└── README.md           # Documentation
```

### main.py Anatomy (695 lines)

#### Part 1: Widget Definitions (Lines 1-120)

```python
@dataclass(frozen=True)
class LeadFinderWidget:
    identifier: str        # Tool name: "find-business-leads"
    title: str            # Human-readable: "Find Business Leads"
    template_uri: str     # Resource URI: "ui://widget/lead-finder.html"
    invoking: str         # Status text while running
    invoked: str          # Status text when done
    html: str             # The actual HTML with JS/CSS references
    response_text: str    # Text for the model to read
```

**Why this exists**: Widgets are reusable UI templates. Each tool can reference a widget to display its results visually.

**The `html` field**: This is the key piece. It tells ChatGPT what to load:

```python
html=(
    '<div id="lead-finder-root"></div>\n'
    '<link rel="stylesheet" href="http://localhost:4444/lead-finder.css">\n'
    '<script type="module" src="http://localhost:4444/lead-finder.js"></script>'
)
```

This HTML gets injected into an iframe in ChatGPT. The React component mounts to `#lead-finder-root`.

#### Part 2: Input Schemas (Lines 120-180)

```python
class LeadSearchInput(BaseModel):
    search_terms: List[str] = Field(..., description="Keywords to search for")
    industry_focus: str | None = Field(None, description="Industry to focus on")
    # ... more fields
```

**Why Pydantic**: Type-safe validation. When ChatGPT calls a tool with arguments, Pydantic validates them automatically. If validation fails, we return a clear error.

#### Part 3: FastMCP Initialization (Lines 180-200)

```python
mcp = FastMCP(
    name="business-lead-finder",
    sse_path="/mcp",              # SSE endpoint
    message_path="/mcp/messages",  # POST endpoint for messages
    stateless_http=True,           # Don't maintain sessions
)
```

**FastMCP**: High-level wrapper around the MCP SDK. It handles:
- Protocol negotiation
- SSE (Server-Sent Events) transport
- Request routing
- Error handling

**Two endpoints**:
1. `/mcp` (GET): Establishes SSE connection
2. `/mcp/messages` (POST): Receives tool call requests

#### Part 4: Mock Data Generator (Lines 200-380)

```python
def generate_mock_leads(
    search_terms: List[str],
    industry_focus: str | None = None,
    max_leads: int = 50
) -> List[Dict[str, Any]]:
    """Generate mock lead data for demonstration."""
    mock_leads = [
        {
            "id": "lead-001",
            "prospect_name": "Sarah Johnson",
            "company": "TechCorp Solutions",
            # ... all the lead data
        },
        # ... more leads
    ]
    return mock_leads[:max_leads]
```

**Why mock data**: For development and testing. In production, you'd replace this with real API calls to Reddit, Twitter, Hunter.io, etc.

#### Part 5: MCP Protocol Handlers (Lines 380-695)

```python
@mcp._mcp_server.list_tools()
async def _list_tools() -> List[types.Tool]:
    """Tell ChatGPT what tools are available."""
    return [
        types.Tool(
            name="find-business-leads",
            title="Find Business Leads",
            description="Find high-quality business leads...",
            inputSchema={...},  # JSON Schema
            _meta=_tool_meta(widget),  # Widget reference
        ),
        # ... more tools
    ]
```

**Why `_meta`**: This is where we link the tool to its widget:

```python
"_meta": {
    "openai/outputTemplate": "ui://widget/lead-finder.html",
    "openai/widgetAccessible": True,
    # ... more metadata
}
```

ChatGPT reads this and knows to render the widget after the tool executes.

```python
async def _call_tool_request(req: types.CallToolRequest) -> types.ServerResult:
    """Handle tool calls from ChatGPT."""
    tool_name = req.params.name
    arguments = req.params.arguments or {}
    
    if tool_name == "find-business-leads":
        # 1. Validate input
        payload = LeadSearchInput.model_validate(arguments)
        
        # 2. Generate data
        leads = generate_mock_leads(payload.search_terms, ...)
        
        # 3. Calculate metrics
        metrics = {...}
        
        # 4. Return response
        return types.ServerResult(
            types.CallToolResult(
                content=[...],           # Text for the model
                structuredContent={...}, # Data for widget
                _meta={...},            # Widget HTML reference
            )
        )
```

**Three parts of the response**:

1. **`content`**: Text that the model reads and can talk about
2. **`structuredContent`**: Structured data (JSON) that both the model AND the widget can access
3. **`_meta`**: Contains the widget HTML and metadata (widget never sees this, ChatGPT uses it to render)

---

## React UI Deep Dive

### File Structure

```
lead-finder-ui/
├── src/
│   ├── shared/                    # Shared utilities
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── use-webplus-global.ts # Hook for window.openai globals
│   │   └── use-widget-props.ts   # Hook for tool output data
│   ├── lead-finder/              # Main component
│   │   └── index.tsx
│   ├── lead-dashboard/           # Analytics component
│   │   └── index.tsx
│   ├── crm-export/               # Export component
│   │   └── index.tsx
│   └── index.css                 # Global styles (Tailwind)
├── build-all.mts                 # Production build script
├── vite.config.mts               # Vite dev server config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── tailwind.config.ts            # Tailwind config
```

### Shared Utilities Explained

#### `types.ts` - Type Definitions

**Purpose**: Defines all TypeScript types for:
1. Window globals (`window.openai`, `window.webplus`)
2. OpenAI Apps SDK types (`DisplayMode`, `Theme`, etc.)
3. Lead Finder specific types (`Lead`, `Metrics`, etc.)

**Key types**:

```typescript
// Global API available to widgets
declare global {
  interface Window {
    webplus: API & WebplusGlobals;  // Old name (deprecated)
    openai: API & WebplusGlobals;   // New name
  }
}

// Layout and state globals
export type WebplusGlobals = {
  theme: "light" | "dark";          // Current theme
  displayMode: DisplayMode;          // inline | fullscreen | pip
  maxHeight: number;                 // Max height in pixels
  toolOutput: UnknownObject;         // Data from tool response
  widgetState: UnknownObject | null; // Persisted state
  // ... more
};

// API methods widgets can call
type API = {
  callTool: (name: string, args: Record<string, unknown>) => Promise<...>;
  requestDisplayMode: (args: { mode: DisplayMode }) => Promise<...>;
  setWidgetState: (state: WidgetState) => Promise<void>;
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;
  // ... more
};

// Lead Finder specific
export interface Lead {
  id: string;
  prospect_name: string;
  company: string;
  lead_score: number;
  // ... all fields
}
```

#### `use-webplus-global.ts` - Global State Hook

**Purpose**: React hook to access ChatGPT's global state (theme, layout, tool output).

**How it works**:

```typescript
export function useWebplusGlobal<K extends keyof WebplusGlobals>(
  key: K
): WebplusGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      // Subscribe to changes
      window.addEventListener('openai:set_globals', handleSetGlobal);
      return () => {
        // Unsubscribe
        window.removeEventListener('openai:set_globals', handleSetGlobal);
      };
    },
    () => window.openai[key],  // Get current value
    () => window.openai[key]   // Get server-side value (SSR)
  );
}
```

**Why `useSyncExternalStore`**: React 18 hook for subscribing to external state stores. ChatGPT can change globals (theme, layout) at any time, and this hook ensures React re-renders.

**Usage in components**:

```tsx
const theme = useWebplusGlobal('theme');           // "light" | "dark"
const displayMode = useWebplusGlobal('displayMode'); // "inline" | "fullscreen"
const maxHeight = useWebplusGlobal('maxHeight');     // number
```

**Fallback mechanism**: If `window.openai` doesn't exist (e.g., testing locally), creates a mock with default values.

#### `use-widget-props.ts` - Tool Output Hook

**Purpose**: Simplified hook to access tool output data.

```typescript
export function useWidgetProps<T extends Record<string, unknown>>(
  defaultState?: T | (() => T)
): T {
  const props = useWebplusGlobal("toolOutput") as T;
  
  const fallback = typeof defaultState === "function"
    ? (defaultState as () => T | null)()
    : defaultState ?? null;

  return props ?? fallback;
}
```

**Usage**:

```tsx
interface LeadFinderData {
  leads: Lead[];
  metrics: Metrics;
  search_parameters: SearchParams;
}

function LeadFinderApp() {
  const toolOutput = useWidgetProps<LeadFinderData>();
  const leads = toolOutput?.leads ?? [];
  // ...
}
```

This is just sugar for `useWebplusGlobal('toolOutput')` with type safety.

### Component Structure

#### `lead-finder/index.tsx` - Main Component

**Structure**:

```tsx
// 1. Imports
import { useWidgetProps } from '../shared/use-widget-props';
import { useWebplusGlobal } from '../shared/use-webplus-global';
import { Target, Star, MapPin, ... } from 'lucide-react';

// 2. Component function
function LeadFinderApp() {
  // Access tool output
  const toolOutput = useWidgetProps<LeadFinderData>();
  
  // Access globals
  const displayMode = useWebplusGlobal('displayMode');
  const maxHeight = useWebplusGlobal('maxHeight');
  const theme = useWebplusGlobal('theme');
  
  // Local state
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState<'all' | 'hot' | 'warm'>('all');
  
  // Event handlers
  const handleEnrichSelected = async () => {
    await window.openai?.callTool?.('enrich-prospect-data', {
      prospect_ids: selectedLeads,
      enrichment_level: 'standard'
    });
  };
  
  const handleGoFullscreen = async () => {
    await window.openai?.requestDisplayMode?.({ mode: 'fullscreen' });
  };
  
  // Render
  return (
    <div style={{ maxHeight }} className={theme === 'dark' ? 'dark' : ''}>
      {/* UI */}
    </div>
  );
}

// 3. Mount to DOM
const root = document.getElementById('lead-finder-root');
if (root) {
  createRoot(root).render(<LeadFinderApp />);
}
```

**Key patterns**:

1. **Optional chaining everywhere**: `window.openai?.callTool?.()` - because these APIs might not exist in all environments
2. **Respects maxHeight**: Inline mode has 480px limit, fullscreen uses full viewport
3. **Theme-aware**: Adds `dark` class when theme is dark
4. **Calls tools**: Can trigger other tools from the UI

### Build Pipeline Explained

#### `vite.config.mts` - Dev Server Config

```typescript
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 4444,           // Dev server port
    strictPort: true,     // Fail if port unavailable
    cors: true,           // Enable CORS
  },
  build: {
    target: "es2022",
    outDir: "assets",
    rollupOptions: {
      input: buildInputs(),  // Auto-discover all index.{tsx,jsx}
    },
  },
});
```

**Why port 4444**: Arbitrary choice. MCP server references this in widget HTML.

**Auto-discovery**: `buildInputs()` finds all `src/**/index.{tsx,jsx}` files and treats them as entry points.

#### `build-all.mts` - Production Build Script

**Purpose**: Build each component separately with versioned, self-contained output files.

**Process**:

```typescript
// 1. Find all components
const entries = fg.sync("src/**/index.{tsx,jsx}");
// → ["src/lead-finder/index.tsx", "src/lead-dashboard/index.tsx", ...]

// 2. For each component
for (const file of entries) {
  const name = path.basename(path.dirname(file));
  // name = "lead-finder"
  
  // 3. Collect CSS (global + component-specific)
  const globalCss = [path.resolve("src/index.css")];  // Tailwind
  const perEntryCss = fg.sync("**/*.css", { cwd: entryDir });
  const cssToInclude = [...globalCss, ...perEntryCss];
  
  // 4. Create virtual entry that imports all CSS
  const virtualId = `\0virtual-entry:${entryAbs}`;
  
  // 5. Build with Vite
  await build({
    plugins: [
      wrapEntryPlugin(virtualId, entryAbs, cssToInclude),
      tailwindcss(),
      react(),
    ],
    build: {
      outDir: "assets",
      rollupOptions: {
        input: virtualId,
        output: {
          entryFileNames: `${name}.js`,   // → lead-finder.js
          assetFileNames: `${name}.css`,  // → lead-finder.css
          inlineDynamicImports: true,     // Single file
        },
      },
    },
  });
}

// 6. Hash output files with version
const hash = crypto.createHash('sha256')
  .update(pkg.version, 'utf8')
  .digest('hex')
  .slice(0, 4);  // → "a1b2"

// Rename: lead-finder.js → lead-finder-a1b2.js
fs.renameSync("assets/lead-finder.js", "assets/lead-finder-a1b2.js");

// 7. Generate self-contained HTML
const html = `
<!doctype html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  <div id="lead-finder-root"></div>
  <script type="module">${js}</script>
</body>
</html>
`;
fs.writeFileSync("assets/lead-finder-a1b2.html", html);
```

**Why hash**: Cache busting. When you deploy a new version, the filename changes, forcing browsers to download the new file.

**Why self-contained HTML**: For production, you can host just the HTML file and it contains everything. No separate JS/CSS requests needed.

**Virtual entry plugin**: Tricks Vite into importing all CSS before the component code. This ensures CSS is bundled together.

---

## Communication Flow

### 1. Tool Call Flow

```
User: "Find leads for CRM software"
    ↓
ChatGPT Model: Selects tool "find-business-leads"
    ↓
POST /mcp/messages?sessionId=abc123
{
  "method": "tools/call",
  "params": {
    "name": "find-business-leads",
    "arguments": {
      "search_terms": ["CRM software"],
      "platforms": ["reddit", "twitter", "linkedin"]
    }
  }
}
    ↓
MCP Server: _call_tool_request()
    ↓
1. Validate input with Pydantic
2. Generate mock lead data
3. Calculate metrics
4. Build response
    ↓
Response:
{
  "content": [
    {"type": "text", "text": "Found 3 high-quality leads..."}
  ],
  "structuredContent": {
    "leads": [...],
    "metrics": {...},
    "search_parameters": {...}
  },
  "_meta": {
    "openai.com/widget": {
      "type": "resource",
      "resource": {
        "uri": "ui://widget/lead-finder.html",
        "text": "<div id='lead-finder-root'></div>..."
      }
    }
  }
}
    ↓
ChatGPT:
1. Shows text: "Found 3 high-quality leads..."
2. Creates iframe
3. Injects widget HTML
4. Sets window.openai.toolOutput = structuredContent
    ↓
Browser:
1. Loads http://localhost:4444/lead-finder.js
2. Loads http://localhost:4444/lead-finder.css
3. React mounts to #lead-finder-root
4. Component reads window.openai.toolOutput
5. Renders interactive UI
```

### 2. Widget → Tool Call Flow

```
User clicks "Enrich Selected" in widget
    ↓
React: handleEnrichSelected()
    ↓
await window.openai.callTool('enrich-prospect-data', {
  prospect_ids: ["lead-001", "lead-002"],
  enrichment_level: "standard"
})
    ↓
ChatGPT: Makes tool call to MCP server
    ↓
MCP Server: Handles "enrich-prospect-data" tool
    ↓
Response with enriched data
    ↓
ChatGPT: Updates window.openai.toolOutput
    ↓
React: useWebplusGlobal('toolOutput') triggers re-render
    ↓
UI updates with new data
```

### 3. Display Mode Change Flow

```
User clicks "Expand" button
    ↓
React: handleGoFullscreen()
    ↓
await window.openai.requestDisplayMode({ mode: 'fullscreen' })
    ↓
ChatGPT: Expands iframe to fullscreen
    ↓
ChatGPT: Dispatches 'openai:set_globals' event
window.dispatchEvent(new CustomEvent('openai:set_globals', {
  detail: { globals: { displayMode: 'fullscreen' } }
}))
    ↓
React: useWebplusGlobal('displayMode') listener fires
    ↓
Component re-renders with new layout
```

---

## Key Patterns & Conventions

### 1. Widget Naming Convention

- **Tool name**: `find-business-leads` (kebab-case)
- **Widget identifier**: Same as tool name
- **Template URI**: `ui://widget/lead-finder.html`
- **DOM root**: `#lead-finder-root` (matches folder name)
- **Component folder**: `src/lead-finder/`
- **Output files**: `lead-finder.js`, `lead-finder.css`

### 2. Data Flow Pattern

```
MCP Server → structuredContent → window.openai.toolOutput → useWidgetProps() → Component
```

Always read-only. Widgets never mutate `toolOutput` directly. To update data, call another tool.

### 3. State Persistence Pattern

```tsx
// Save state
await window.openai.setWidgetState({
  __v: 1,  // Version number
  selectedLeads: ["lead-001"],
  filters: {...}
});

// Read state on mount
const widgetState = useWebplusGlobal('widgetState');
const [selectedLeads, setSelectedLeads] = useState(
  widgetState?.selectedLeads ?? []
);
```

ChatGPT persists `widgetState` across page refreshes and conversations.

### 4. Tool Accessibility Pattern

Tools must be marked as widget-accessible to be called from components:

```python
"_meta": {
    "openai/widgetAccessible": True,  # Allow widget to call this tool
    "openai/outputTemplate": "ui://widget/lead-finder.html",
}
```

Without this, `window.openai.callTool()` will fail.

### 5. Error Handling Pattern

**Server-side**:
```python
try:
    payload = LeadSearchInput.model_validate(arguments)
    # ...
except ValidationError as exc:
    return types.ServerResult(
        types.CallToolResult(
            content=[types.TextContent(type="text", text=f"Error: {exc}")],
            isError=True,
        )
    )
```

**Client-side**:
```tsx
const handleAction = async () => {
  try {
    await window.openai?.callTool?.('tool-name', {...});
  } catch (error) {
    console.error('Tool call failed:', error);
    // Show error UI
  }
};
```

### 6. Development vs Production URLs

**Development** (`main.py`):
```python
html=(
    '<div id="lead-finder-root"></div>\n'
    '<link rel="stylesheet" href="http://localhost:4444/lead-finder.css">\n'
    '<script type="module" src="http://localhost:4444/lead-finder.js"></script>'
)
```

**Production** (after build):
```python
html=(
    '<div id="lead-finder-root"></div>\n'
    '<link rel="stylesheet" href="https://cdn.example.com/lead-finder-a1b2.css">\n'
    '<script type="module" src="https://cdn.example.com/lead-finder-a1b2.js"></script>'
)
```

Or use the self-contained HTML:
```python
html = open('assets/lead-finder-a1b2.html').read()
```

---

## Advanced Topics

### SSE (Server-Sent Events) Transport

FastMCP uses SSE for real-time communication:

```python
mcp = FastMCP(
    name="business-lead-finder",
    sse_path="/mcp",              # GET /mcp establishes SSE connection
    message_path="/mcp/messages",  # POST /mcp/messages sends requests
)
```

**How it works**:
1. ChatGPT: `GET /mcp` → Opens long-lived connection
2. ChatGPT: `POST /mcp/messages?sessionId=...` → Sends tool call
3. Server: Responds over SSE connection with results

**Why SSE**: Allows server to push updates to ChatGPT in real-time. Useful for long-running operations.

### Content Security Policy (CSP)

Widgets run in a sandboxed iframe with strict CSP. Can only:
- Load scripts/styles from declared domains
- Make network requests to declared domains
- No inline scripts (except in production build)

To declare allowed domains:
```python
"_meta": {
    "openai/widgetCSP": {
        "resource_domains": ["https://cdn.example.com"],
        "connect_domains": ["https://api.example.com"],
    }
}
```

### Widget State Versioning

Always version your widget state:
```tsx
await window.openai.setWidgetState({
  __v: 1,  // Version 1
  // ... state fields
});

// Later, if you change the schema:
const state = useWebplusGlobal('widgetState');
if (state.__v === 1) {
  // Migrate to v2
  const newState = migrateV1ToV2(state);
  await window.openai.setWidgetState({ __v: 2, ...newState });
}
```

This prevents breaking changes when you update the widget.

---

## Troubleshooting Guide

### Widget doesn't render

**Check**:
1. Is Vite dev server running on port 4444?
2. Do widget HTML URLs in `main.py` point to `http://localhost:4444`?
3. Check browser console for CORS errors
4. Verify widget HTML in tool `_meta` matches the template URI

### Tool calls fail

**Check**:
1. Is MCP server running?
2. Is tool marked as `"openai/widgetAccessible": True`?
3. Check server logs for validation errors
4. Verify input schema matches arguments

### Styling looks wrong

**Check**:
1. Is Tailwind CSS being included? (Check `src/index.css`)
2. Is theme being respected? (`className={theme === 'dark' ? 'dark' : ''}`)
3. Check if maxHeight is being applied
4. Verify no CSS conflicts with ChatGPT's styles

### Build fails

**Check**:
1. Are all dependencies installed? (`pnpm install`)
2. Is TypeScript happy? (`pnpm run tsc`)
3. Check for import errors
4. Verify all index files have proper exports

---

## Summary

**MCP Server** (`lead-finder-server/main.py`):
- FastMCP server exposing 3 tools
- Tools return structured data + widget HTML
- Mock data generator for testing
- Type-safe with Pydantic

**React UI** (`lead-finder-ui/src/`):
- 3 components (lead-finder, dashboard, crm-export)
- Shared utilities (hooks, types)
- Reads data from `window.openai.toolOutput`
- Can call tools via `window.openai.callTool()`
- Respects theme, layout, maxHeight

**Build Pipeline**:
- Vite dev server for development (port 4444)
- `build-all.mts` for production builds
- Auto-discovers components
- Generates versioned, self-contained outputs

**Communication**:
- MCP protocol over HTTP/SSE
- ChatGPT ↔ MCP Server ↔ Widgets
- Bidirectional: Server can push, widgets can call back
- Type-safe with TypeScript and Pydantic

This architecture follows OpenAI Apps SDK best practices and is production-ready!

