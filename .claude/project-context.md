# SpellCooldowns2 - Project Context

## Project Overview
- **Name**: spellcooldowns2
- **Type**: Stream Deck Plugin for League of Legends
- **Purpose**: Track and display League of Legends champion ability cooldowns with item and rune haste calculations
- **SDK Version**: @elgato/streamdeck v2.0.0
- **Node.js Version**: 20
- **Current Status**: Fully functional with 11 actions for champion abilities, items, and stat tracking

## Project Purpose
This is a comprehensive League of Legends companion plugin for Stream Deck that:
- Displays champion ability cooldowns (Passive, Q, W, E, R)
- Manages item selection and activation states (for ability haste calculation)
- Tracks champion levels and ability levels
- Manages mastery and rune settings (cooldown reduction effects)
- Calculates real-time cooldowns based on ability haste
- Provides visual feedback with champion/ability/item icons

## Current Implementation

### Existing Files
**Core Files:**
- `src/plugin.ts` - Main plugin entry point, registers all 11 actions
- `src/global-settings.ts` - Global settings manager for cross-action state sharing
- `com.dt.spellcooldowns2.sdPlugin/manifest.json` - Plugin manifest with all 11 actions

**Action Files (11 total):**
- `src/actions/champion-rotator.ts` - Select and switch between champions
- `src/actions/display-passive.ts` - Display passive ability cooldown
- `src/actions/display-q.ts` - Display Q ability cooldown
- `src/actions/display-w.ts` - Display W ability cooldown
- `src/actions/display-e.ts` - Display E ability cooldown
- `src/actions/display-r.ts` - Display R ability cooldown
- `src/actions/toggle-item.ts` - Toggle item activation (affects haste)
- `src/actions/display-haste.ts` - Display total ability haste
- `src/actions/set-mastery.ts` - Set mastery level for cooldown bonuses
- `src/actions/increment-level.ts` - Increment champion level (1-18)
- `src/actions/increment-legend-stack.ts` - Increment Legend: Haste stacks (max 15)

**Data Files:**
- `com.dt.spellcooldowns2.sdPlugin/champion/champion.json` - Champion data with abilities and base cooldowns
- `com.dt.spellcooldowns2.sdPlugin/champion/champion_ability_order.json` - Champion ability leveling priorities
- `com.dt.spellcooldowns2.sdPlugin/champion/mastery.json` - Mastery data
- `com.dt.spellcooldowns2.sdPlugin/items.json` - Item data with haste values

**UI Files:**
- `com.dt.spellcooldowns2.sdPlugin/ui/champion-rotator.html` - Champion selection UI
- `com.dt.spellcooldowns2.sdPlugin/ui/toggle-item.html` - Item selection UI
- `com.dt.spellcooldowns2.sdPlugin/ui/set-mastery.html` - Mastery configuration UI
- `com.dt.spellcooldowns2.sdPlugin/ui/increment-level.html` - Level tracking UI
- `com.dt.spellcooldowns2.sdPlugin/ui/increment-legend-stack.html` - Legend: Haste UI

## Complete Action List

| Action UUID | Name | Functionality |
|-------------|------|---------------|
| `com.dt.spellcooldowns2.championrotator` | Champion Rotator | Select/switch champions, populate ability matrix |
| `com.dt.spellcooldowns2.displaypassive` | Display Passive | Show passive ability cooldown and icon |
| `com.dt.spellcooldowns2.displayq` | Display Q | Show Q ability cooldown, level, and icon |
| `com.dt.spellcooldowns2.displayw` | Display W | Show W ability cooldown, level, and icon |
| `com.dt.spellcooldowns2.displaye` | Display E | Show E ability cooldown, level, and icon |
| `com.dt.spellcooldowns2.displayr` | Display R | Show R ability cooldown, level, and icon |
| `com.dt.spellcooldowns2.toggleitem` | Toggle Item | Select and activate/deactivate items, track haste |
| `com.dt.spellcooldowns2.displayhaste` | Display Haste | Show total ability haste from all sources |
| `com.dt.spellcooldowns2.setmastery` | Set Mastery | Set mastery level for cooldown bonuses |
| `com.dt.spellcooldowns2.incrementlevel` | Increment Level | Increment champion level (1-18) |
| `com.dt.spellcooldowns2.incrementlegendstack` | Increment Legend Stack | Increment Legend: Haste stacks (max 15) |

## Technical Architecture

### Stream Deck Plugin Structure
- **Node.js Backend**: Handles business logic, state management, cooldown calculations
- **Chromium-based UI**: Property Inspector for configuration
- **WebSocket Communication**: Between backend and UI for real-time updates
- **Global Settings**: Shared state across all actions (champion, items, levels, haste)
- **Per-Action Settings**: Instance-specific settings (e.g., item grid position)

### Global Settings Manager (`GlobalSettingsManager`)
Singleton class that manages:
- **Items Grid**: 2D array tracking activated items at specific positions
- **Champion State**: Current champion, level, ability levels
- **Ability Matrix**: 2D array tracking ability level-up order
- **Haste Tracking**: Basic haste, ultimate haste, mastery haste
- **Rune/Item Bonuses**: CD shard, Axiom Arcanist, Transcendence, Legend: Haste

### Key Design Patterns
1. **Singleton Pattern**: GlobalSettingsManager for shared state
2. **Event Listeners**: Actions listen for global settings changes
3. **Settings Persistence**: Both global and per-action settings saved by Stream Deck
4. **Grid-based Layout**: Items mapped to physical Stream Deck positions
5. **Reactive Updates**: Settings changes trigger visual updates across all actions

## Documentation Available
Comprehensive Stream Deck SDK documentation located in `docs/` folder:
- Real-world examples and patterns (`docs/knowledge-base/examples/`)
- RAG system for documentation queries (`docs/rag-system/`)
- Interactive documentation site (`docs/doc-site/`)
- Best practices for resource management and state persistence
- API reference and troubleshooting guides

## Dependencies
```json
{
  "dependencies": {
    "@elgato/streamdeck": "^2.0.0"
  },
  "devDependencies": {
    "@elgato/cli": "^1.7.0",
    "@rollup/plugin-commonjs": "^28.0.0",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^15.2.2",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^12.1.0",
    "@tsconfig/node20": "^20.1.2",
    "@types/node": "~20.15.0",
    "rollup": "^4.0.2",
    "tslib": "^2.6.2",
    "typescript": "^5.2.2"
  }
}
```

## Build Commands
- `npm run build` - Build plugin once
- `npm run watch` - Watch mode with auto-restart (uses `streamdeck restart com.dt.spellcooldowns2`)


## Technical Architecture

### Stream Deck Plugin Structure
- **Node.js Backend**: Handles business logic, timers, state management
- **Chromium-based UI**: Property Inspector for configuration
- **WebSocket Communication**: Between backend and UI
- **Persistent Settings**: Stored by Stream Deck

### Key Patterns for Timer Implementation
1. Use `setInterval` for periodic updates (countdown tick)
2. Store timers in `Map<string, NodeJS.Timeout>` for cleanup
3. Clean up timers in `onWillDisappear` event
4. Handle multiple action instances independently

## Documentation Available
Comprehensive Stream Deck SDK documentation located in `docs/` folder:
- Real-world examples with timer patterns (`docs/knowledge-base/examples/`)
- Best practices for resource management
- API reference and troubleshooting guides

## Next Development Steps
1. Create cooldown timer action (or enhance existing counter)
2. Implement countdown logic with `setInterval`
3. Add timer state management (running/stopped/complete)
4. Create Property Inspector for cooldown configuration
5. Add visual feedback (title updates, alerts on completion)
6. Implement proper cleanup on action removal

## Dependencies
```json
{
  "dependencies": {
    "@elgato/streamdeck": "^2.0.0"
  },
  "devDependencies": {
    "@elgato/cli": "^1.7.0",
    "rollup": "^4.0.2",
    "typescript": "^5.2.2"
  }
}
```

## Build Commands
- `npm run build` - Build plugin once
- `npm run watch` - Watch mode with auto-restart
