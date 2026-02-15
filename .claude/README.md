# .claude Context Files - Index

This directory contains context information for AI assistants working on the SpellCooldowns2 Stream Deck plugin.

## Files Overview

### 📋 [project-context.md](project-context.md)
**Purpose**: High-level project overview  
**Contains**:
- Project goals and current status
- Complete action list (11 actions)
- Technical architecture overview
- Global Settings Manager explanation
- Key design patterns
- Build commands and dependencies

**Read this first** for general project understanding.

---

### 🗂️ [codebase-structure.md](codebase-structure.md)
**Purpose**: Directory layout and file organization  
**Contains**:
- Complete directory tree with all files
- Key file descriptions
- Action development patterns
- Build process explanation
- Settings persistence patterns (global + per-action)
- Data files structure (champion.json, items.json)

**Use this** to understand where files are located and how they're organized.

---

### 💻 [current-code-state.md](current-code-state.md)
**Purpose**: Current state of all source code files  
**Contains**:
- Complete listing of src/plugin.ts
- GlobalSettingsManager interface and methods
- Summary of all 11 actions with code examples
- Manifest.json structure
- Implementation status checklist
- Potential enhancements

**Use this** to understand the current codebase without reading files.

---

### 📚 [documentation-summary.md](documentation-summary.md)
**Purpose**: Overview of available documentation resources  
**Contains**:
- Documentation structure (knowledge-base, doc-site, rag-system)
- Key examples with line numbers
- Relevant patterns for implementation
- Commands to access documentation

**Use this** to find specific documentation or examples.

---

### ⏱️ [timer-implementation-guide.md](timer-implementation-guide.md)
**Purpose**: Specific guidance for implementing cooldown timers  
**Contains**:
- Recommended timer patterns from documentation
- Code examples for countdown logic
- Timer cleanup best practices
- Settings type definitions
- Feature implementation checklist

**Use this** when implementing real-time countdown timer functionality (future enhancement).

---

## Quick Reference

### Project Type
Stream Deck Plugin for **League of Legends** using @elgato/streamdeck SDK v2.0.0

### Current Status
✅ Fully functional plugin with 11 actions  
✅ Champion, ability, and item tracking implemented  
✅ Global settings manager for shared state  
✅ Haste calculation system  
🔄 Real-time countdown timers not yet implemented (shows base cooldowns)

### Main Functionality
The plugin provides:
1. **Champion Selection** - Choose from multiple League champions
2. **Ability Display** - Show Passive, Q, W, E, R abilities with icons and cooldowns
3. **Item Management** - Toggle item activation for haste calculations
4. **Stat Tracking** - Champion level, ability levels, mastery, rune stacks
5. **Haste Calculation** - Total ability haste from items and runes

### Complete Action List (11 total)
1. **Champion Rotator** - Select/switch champions
2. **Display Passive** - Show passive ability
3. **Display Q** - Show Q ability
4. **Display W** - Show W ability
5. **Display E** - Show E ability
6. **Display R** - Show R ability
7. **Toggle Item** - Manage items and activation
8. **Display Haste** - Show total ability haste
9. **Set Mastery** - Configure mastery level
10. **Increment Level** - Track champion level (1-18)
11. **Increment Legend Stack** - Track Legend: Haste stacks (0-15)

### Key Technologies
- TypeScript 5.2.2
- Node.js 20
- Rollup (bundler with JSON plugin)
- Stream Deck SDK 2.0.0
- Global Settings (Singleton pattern)

### Build Commands
```bash
npm run build   # Build once
npm run watch   # Watch mode with auto-restart
```

### Documentation Access
```bash
cd docs
npm run ingest      # Build RAG vector database
npm run test:query  # Test documentation queries
npm run docs:start  # Start Docusaurus site (localhost:3000)
```

---

## Implementation Patterns

### Global State Management
Use `GlobalSettingsManager.getInstance()` to access shared state:
```typescript
const manager = GlobalSettingsManager.getInstance();
const champion = manager.getCurrentChampion();
const level = manager.getCurrentChampionLevel();
```

### Listening for Global Changes
```typescript
this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings(() => {
	// Update action display
});
```

### Cleanup on Disappear
```typescript
override async onWillDisappear(ev: WillDisappearEvent): Promise<void> {
	if (this.settingsListener) {
		this.settingsListener.dispose?.();
	}
}
```

---

## Data Files Location
- **Champions**: `com.dt.spellcooldowns2.sdPlugin/champion/champion.json`
- **Ability Orders**: `com.dt.spellcooldowns2.sdPlugin/champion/champion_ability_order.json`
- **Masteries**: `com.dt.spellcooldowns2.sdPlugin/champion/mastery.json`
- **Items**: `com.dt.spellcooldowns2.sdPlugin/items.json`

---

## Future Enhancements
- Real-time countdown timers with `setInterval`
- Cooldown reduction formula application (based on ability haste)
- Timer start/stop/reset controls
- Visual/audio alerts on cooldown completion
- Advanced per-instance timer management

```bash
npm run docs:start  # Start Docusaurus site (port 3000)
npm run ingest      # Build RAG vector database
npm run test:query  # Query documentation with AI
```

---

## Context File Maintenance

These files should be updated when:
- ✅ **project-context.md**: Project goals change, new features planned
- ✅ **codebase-structure.md**: New files/directories added
- ✅ **timer-implementation-guide.md**: Implementation patterns change
- ✅ **documentation-summary.md**: New documentation added
- ✅ **current-code-state.md**: Source code is modified

## Last Updated
February 13, 2026

## Version
0.1.0 - Initial context creation
