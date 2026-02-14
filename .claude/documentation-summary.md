# Documentation Summary

## Available Documentation

The `docs/` folder contains comprehensive Stream Deck SDK documentation with 3 main sections:

### 1. knowledge-base/ (Raw Markdown)

**Core Concepts**
- `architecture-overview.md` - Node.js runtime, WebSocket communication
- `action-development.md` - Creating actions, event handlers
- `settings-persistence.md` - Data storage patterns
- `communication-protocol.md` - Plugin ↔ UI messaging

**Development Workflow**
- `environment-setup.md` - Setup and installation
- `build-and-deploy.md` - Build process, packaging
- `debugging-guide.md` - VS Code debugging, Chrome DevTools
- `testing-strategies.md` - Unit tests, mocking

**Code Templates**
- `action-templates.md` - Reusable action patterns
- `common-patterns.md` - Best practices
- `manifest-templates.md` - Manifest examples
- `property-inspector-templates.md` - UI examples

**Examples**
- `basic-counter-plugin.md` - Complete counter example
- `real-world-plugin-examples.md` - Advanced patterns including:
  - Cat Keys (network requests, auto-update with setInterval)
  - Hello World (internationalization)
  - Data Sources (dynamic UI)
  - Layouts (Stream Deck Plus)
  - Lights Out (multi-action coordination)

**UI Components**
- `property-inspector-basics.md` - SDPI Components
- `form-components.md` - Input elements, validation

**Reference**
- `api-reference.md` - Complete API docs
- `stream-deck-plus-deep-dive.md` - Dial and touchscreen features

**Troubleshooting**
- `common-issues.md` - Solutions to frequent problems
- `diagnostic-flowcharts.md` - Debug workflows

### 2. doc-site/ (Docusaurus Website)

Interactive documentation site with:
- Search functionality
- API documentation (TypeDoc generated)
- Versioned docs
- Blog posts

**Commands:**
- `npm run docs:start` - Development server (http://localhost:3000)
- `npm run docs:build` - Production build

### 3. rag-system/ (AI Query System)

LlamaIndex-based RAG system for intelligent documentation queries:
- Vector database in `storage/`
- Query scripts for testing
- MCP server for LLM integration

**Commands:**
- `npm run ingest` - Build vector database
- `npm run test:query` - Test queries

## Relevant Examples for Timer Implementation

### Cat Keys Example (real-world-plugin-examples.md)
**Lines 40-130** show:
```typescript
private intervals = new Map<string, NodeJS.Timeout>();

override onWillAppear(ev: WillAppearEvent): void {
    const interval = setInterval(() => {
        this.updateCatImage(ev.action);
    }, FIFTEEN_MINUTES);
    this.intervals.set(ev.action.id, interval);
}

override onWillDisappear(ev: WillDisappearEvent): void {
    const interval = this.intervals.get(ev.action.id);
    if (interval) {
        clearInterval(interval);
        this.intervals.delete(ev.action.id);
    }
}
```

### Basic Counter Extensions (basic-counter-plugin.md)
**Lines 248-270** show long-press timer pattern:
```typescript
private longPressTimer?: NodeJS.Timeout;

override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    this.longPressTimer = setTimeout(async () => {
        // Reset on long press
        await ev.action.setSettings({ count: 0 });
    }, 2000);
}
```

## Key Patterns for SpellCooldowns2

1. **Timer Management**: Map of timers keyed by action.id
2. **Cleanup**: Always clear intervals in onWillDisappear
3. **State Persistence**: Store endTime in settings for restart recovery
4. **Update Frequency**: setInterval every 1 second for countdown
5. **User Feedback**: setTitle for display, showOk/showAlert for completion
