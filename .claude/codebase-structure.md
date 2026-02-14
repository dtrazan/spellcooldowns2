# Codebase Structure

## Directory Layout

```
spellcooldowns2/
├── .claude/                              # Context files for AI assistants
├── com.dt.spellcooldowns2.sdPlugin/      # Stream Deck plugin bundle
│   ├── bin/
│   │   ├── package.json
│   │   └── plugin.js                     # Compiled plugin code
│   ├── imgs/
│   │   ├── actions/counter/              # Action icons
│   │   └── plugin/                       # Plugin icons
│   ├── logs/                             # Runtime logs
│   ├── ui/
│   │   └── increment-counter.html        # Property Inspector UI
│   └── manifest.json                     # Plugin manifest (metadata)
├── docs/                                 # Comprehensive SDK documentation
│   ├── knowledge-base/                   # Markdown documentation
│   ├── doc-site/                         # Docusaurus website
│   └── rag-system/                       # RAG/AI query system
├── src/                                  # TypeScript source code
│   ├── actions/
│   │   └── increment-counter.ts          # Counter action implementation
│   └── plugin.ts                         # Plugin entry point
├── package.json                          # NPM dependencies and scripts
├── rollup.config.mjs                     # Build configuration
└── tsconfig.json                         # TypeScript configuration
```

## Key Files

### manifest.json
Defines plugin metadata, actions, and requirements:
- Plugin UUID: `com.dt.spellcooldowns2`
- Actions defined: Counter action
- Node.js version: 20
- Minimum Stream Deck version: 6.9

### src/plugin.ts
```typescript
import streamDeck from "@elgato/streamdeck";
import { IncrementCounter } from "./actions/increment-counter";

streamDeck.logger.setLevel("trace");
streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.connect();
```

### src/actions/increment-counter.ts
- Extends `SingletonAction<CounterSettings>`
- Handles `onWillAppear` and `onKeyDown` events
- Manages count state in settings

## Action Development Pattern

All actions follow this pattern:
1. Import from `@elgato/streamdeck`
2. Decorate with `@action({ UUID: "..." })`
3. Extend `SingletonAction<SettingsType>`
4. Override lifecycle methods:
   - `onWillAppear` - Initialize display
   - `onKeyDown` - Handle button press
   - `onKeyUp` - Handle button release
   - `onDidReceiveSettings` - Handle settings changes
   - `onWillDisappear` - Cleanup resources

## Build Process
1. TypeScript compiled to JavaScript via Rollup
2. Output placed in `com.dt.spellcooldowns2.sdPlugin/bin/`
3. Stream Deck loads from `.sdPlugin` directory
4. Watch mode auto-restarts plugin on changes

## Settings Persistence
- Settings stored per-action-instance by Stream Deck
- Access via `ev.payload.settings`
- Update via `ev.action.setSettings(newSettings)`
- Type-safe with TypeScript generics
