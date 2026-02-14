# SpellCooldowns2 - Project Context

## Project Overview
- **Name**: spellcooldowns2
- **Type**: Stream Deck Plugin
- **SDK Version**: @elgato/streamdeck v2.0.0
- **Node.js Version**: 20
- **Current Status**: Basic counter implementation, needs timer/cooldown functionality

## Current Implementation

### Existing Files
- `src/plugin.ts` - Main plugin entry point, registers actions
- `src/actions/increment-counter.ts` - Basic counter action (increments on key press)
- `com.dt.spellcooldowns2.sdPlugin/manifest.json` - Plugin manifest
- `com.dt.spellcooldowns2.sdPlugin/ui/increment-counter.html` - Property Inspector UI

### Current Action: IncrementCounter
- **UUID**: `com.dt.spellcooldowns2.increment`
- **Functionality**: Simple counter that increments on key press
- **Settings**: 
  - `count` (number) - Current count value
  - `incrementBy` (number) - Amount to increment by

## Project Goals
Based on the project name "spellcooldowns2", the intended functionality appears to be:
- Spell/ability cooldown tracking
- Countdown timer display on Stream Deck buttons
- Visual feedback for cooldown completion
- Configurable cooldown durations

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
