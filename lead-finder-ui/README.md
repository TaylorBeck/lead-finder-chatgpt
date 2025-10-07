# Business Lead Finder UI Components

React components for the Business Lead Finder, built with the OpenAI Apps SDK pattern.

## Components

### `lead-finder`
Main lead search and display component with filtering, selection, and bulk actions.

### `lead-dashboard`
Analytics dashboard showing lead metrics, distribution, and trends.

### `crm-export`
CRM export interface for sending leads to Salesforce, HubSpot, or Pipedrive.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Development Mode

```bash
pnpm run dev
```

This starts the Vite dev server at `http://localhost:4444` with hot reload.

You can test individual components by visiting:
- `http://localhost:4444/lead-finder.html`
- `http://localhost:4444/lead-dashboard.html`
- `http://localhost:4444/crm-export.html`

### 3. Build for Production

```bash
pnpm run build
```

This generates hashed bundles in the `assets/` folder:
- `lead-finder-HASH.js`
- `lead-finder-HASH.css`
- `lead-finder-HASH.html`
- (and similar for other components)

### 4. Serve Built Assets

```bash
pnpm run serve
```

Serves the `assets/` folder at `http://localhost:4444` with CORS enabled.

## Architecture

### Component Structure

Each component follows the Apps SDK pattern:

```tsx
import { useWidgetProps } from '../shared/use-widget-props';
import { useWebplusGlobal } from '../shared/use-webplus-global';

function MyComponent() {
  // Access tool output from MCP server
  const toolOutput = useWidgetProps<MyDataType>();
  
  // Access layout/theme globals
  const displayMode = useWebplusGlobal('displayMode');
  const maxHeight = useWebplusGlobal('maxHeight');
  const theme = useWebplusGlobal('theme');
  
  // Component logic...
}
```

### Key Hooks

- **`useWidgetProps()`**: Access structured data from MCP tool response
- **`useWebplusGlobal(key)`**: Access layout, theme, and state globals
- **`window.openai.callTool()`**: Call MCP tools from the component
- **`window.openai.setWidgetState()`**: Persist component state
- **`window.openai.requestDisplayMode()`**: Request fullscreen/inline/pip

### Styling

- **Tailwind CSS**: Utility-first styling
- **System Fonts**: Uses platform-native fonts
- **Dark Mode**: Respects `theme` global (light/dark)
- **Responsive**: Adapts to inline (480px) and fullscreen modes

## Integration with MCP Server

The MCP server (in `lead-finder-server/`) references these components in widget HTML:

```python
html=(
    '<div id="lead-finder-root"></div>\n'
    '<link rel="stylesheet" href="http://localhost:4444/lead-finder.css">\n'
    '<script type="module" src="http://localhost:4444/lead-finder.js"></script>'
)
```

For production, update URLs to point to your CDN:

```python
html=(
    '<div id="lead-finder-root"></div>\n'
    '<link rel="stylesheet" href="https://your-cdn.com/assets/lead-finder-HASH.css">\n'
    '<script type="module" src="https://your-cdn.com/assets/lead-finder-HASH.js"></script>'
)
```

## Build Process

The build pipeline follows the Apps SDK examples:

1. **Entry Points**: Auto-discovered from `src/**/index.{tsx,jsx}`
2. **CSS Bundling**: Global CSS + per-component CSS bundled together
3. **Hashing**: Files are hashed with package version for cache busting
4. **HTML Generation**: Self-contained HTML files with inlined CSS/JS

## Development Tips

### Testing Locally

1. Start the MCP server: `cd ../lead-finder-server && python main.py`
2. Start the UI dev server: `pnpm run dev`
3. Test with MCP Inspector or ChatGPT (via ngrok)

### Adding New Components

1. Create folder: `src/my-component/`
2. Create entry point: `src/my-component/index.tsx`
3. Component will auto-build on next `pnpm run build`
4. Register in MCP server's `widgets` list

### Hot Reload

In development mode, changes to components are reflected immediately without rebuilding.

## Type Safety

All components use TypeScript with strict mode enabled. Shared types are in `src/shared/types.ts`.

## Browser Support

Built for modern browsers with ES2022 support (Chrome 94+, Safari 15+, Firefox 93+).

