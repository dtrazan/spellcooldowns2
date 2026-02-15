# Current Code State

## Overview
The spellcooldowns2 plugin is a **fully functional** League of Legends companion plugin with 11 actions that track champion abilities, items, and stats for cooldown calculations.

## src/plugin.ts
```typescript
import streamDeck from "@elgato/streamdeck";

import { ToggleItem } from "./actions/toggle-item";
import { DisplayHaste } from "./actions/display-haste";
import { SetMastery } from "./actions/set-mastery";
import { RotateChampion } from "./actions/champion-rotator";
import { DisplayPassive } from "./actions/display-passive";
import { DisplayQ } from "./actions/display-q";
import { DisplayW } from "./actions/display-w";
import { DisplayE } from "./actions/display-e";
import { DisplayR } from "./actions/display-r";
import { IncrementLevel } from "./actions/increment-level";
import { IncrementLegendStack } from "./actions/increment-legend-stack";
import { GlobalSettingsManager } from "./global-settings";

streamDeck.logger.setLevel("trace");

// Register all 11 actions
streamDeck.actions.registerAction(new ToggleItem());
streamDeck.actions.registerAction(new DisplayHaste());
streamDeck.actions.registerAction(new SetMastery());
streamDeck.actions.registerAction(new RotateChampion());
streamDeck.actions.registerAction(new DisplayPassive());
streamDeck.actions.registerAction(new DisplayQ());
streamDeck.actions.registerAction(new DisplayW());
streamDeck.actions.registerAction(new DisplayE());
streamDeck.actions.registerAction(new DisplayR());
streamDeck.actions.registerAction(new IncrementLevel());
streamDeck.actions.registerAction(new IncrementLegendStack());

streamDeck.connect();
```

**Status**: Complete, registers all 11 actions and connects to Stream Deck.

---

## src/global-settings.ts
**Purpose**: Singleton manager for shared state across all actions

**Key Interfaces**:
```typescript
export interface ItemData {
	id: string;
	name: string;
	img: string;
	ability_haste?: string;
	basic_haste?: string;
	ultimate_haste?: string;
	type?: string;
	activated?: boolean;
}

export interface GlobalSettings {
	itemsGrid?: (ItemData | null)[][];  // 2D grid of items
	gridRows?: number;
	gridColumns?: number;
	ability_matrix?: number[][];  // Ability level-up tracking
	current_basic_haste?: number;
	current_ultimate_haste?: number;
	current_mastery_haste?: number;
	has_cd_shard?: boolean;
	has_axiom_arcanist?: boolean;
	has_transcendence?: boolean;
	has_legend_haste?: boolean;
	cd_shard_bonus?: number;
	cd_legend_bonus?: number;
	current_legend_stack?: number;
	current_champion?: string;
	current_champion_level?: number;
	current_q_level?: number;
	current_w_level?: number;
	current_e_level?: number;
	current_r_level?: number;
	latest_ability_leveled?: string;
}
```

**Key Methods**:
- `getInstance()` - Get singleton instance
- `getItemAt(row, col)` / `setItemAt(row, col, item)` - Grid management
- `getCurrentChampion()` / `setCurrentChampion(id)` - Champion tracking
- `getCurrentChampionLevel()` / `setCurrentChampionLevel(level)` - Level tracking
- `getCurrentQLevel()`, `getCurrentWLevel()`, etc. - Ability level tracking
- `getAbilityMatrix()` / `setAbilityMatrix(matrix)` - Ability leveling order
- `calculateTotalHaste()` - Calculate total ability haste from items

**Status**: Comprehensive state management implemented, 586 lines total.

---

## Action Files (11 total)

### 1. src/actions/champion-rotator.ts
**UUID**: `com.dt.spellcooldowns2.championrotator`  
**Purpose**: Select and switch between League of Legends champions

**Key Features**:
- Loads champion data from `champion.json`
- Displays champion image and name
- Populates ability matrix based on champion ability order
- Syncs with Property Inspector for champion selection
- Updates global settings with current champion

**Status**: ✅ Fully implemented (271 lines)

---

### 2-6. Display Ability Actions
**Display Passive** (`display-passive.ts`)  
**Display Q** (`display-q.ts`)  
**Display W** (`display-w.ts`)  
**Display E** (`display-e.ts`)  
**Display R** (`display-r.ts`)

**UUIDs**: 
- `com.dt.spellcooldowns2.displaypassive`
- `com.dt.spellcooldowns2.displayq`
- `com.dt.spellcooldowns2.displayw` 
- `com.dt.spellcooldowns2.displaye`
- `com.dt.spellcooldowns2.displayr`

**Purpose**: Display ability icons and cooldowns for current champion

**Key Features**:
- Fetches champion data from global settings
- Displays ability image (from `imgs/spell/` or `imgs/passive/`)
- Shows ability level and cooldown (e.g., "Lvl 3\n8s")
- Listens for global settings changes to update dynamically
- Cleans up listeners on `onWillDisappear`

**Example Pattern** (display-q.ts):
```typescript
@action({ UUID: "com.dt.spellcooldowns2.displayq" })
export class DisplayQ extends SingletonAction<DisplayQSettings> {
	private settingsListener?: any;

	override async onWillAppear(ev: WillAppearEvent<DisplayQSettings>): Promise<void> {
		await this.updateQDisplay(ev.action);
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings(() => {
			this.updateQDisplay(ev.action);
		});
	}

	override async onWillDisappear(ev: WillDisappearEvent<DisplayQSettings>): Promise<void> {
		if (this.settingsListener) {
			this.settingsListener.dispose?.();
		}
	}

	private async updateQDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const championId = manager.getCurrentChampion();
		const champion = championData.find(c => c.id === championId);
		const qLevel = manager.getCurrentQLevel();
		
		await action.setImage(`imgs/spell/${champion.q.img}`);
		await action.setTitle(`Lvl ${qLevel}\n${champion.q.cd[qLevel-1]}s`);
	}
}
```

**Status**: ✅ All 5 ability display actions fully implemented

---

### 7. src/actions/toggle-item.ts
**UUID**: `com.dt.spellcooldowns2.toggleitem`  
**Purpose**: Manage League of Legends items and their activation states

**Key Features**:
- Loads items from `items.json`
- Displays item image (active/deactivated states)
- Toggles item activation on key press
- Tracks item position in grid (row, column)
- Updates global settings with item data (for haste calculation)
- Shows item name or coordinates based on settings

**Status**: ✅ Fully implemented (222 lines)

---

### 8. src/actions/display-haste.ts
**UUID**: `com.dt.spellcooldowns2.displayhaste`  
**Purpose**: Display total ability haste from all active items

**Key Features**:
- Calculates total haste from activated items
- Displays basic haste, ultimate haste, or both
- Updates dynamically when items are activated/deactivated
- Listens for global settings changes

**Status**: ✅ Fully implemented

---

### 9. src/actions/set-mastery.ts
**UUID**: `com.dt.spellcooldowns2.setmastery`  
**Purpose**: Set mastery level for cooldown bonuses

**Key Features**:
- Cycles through mastery levels on key press
- Displays mastery image and level
- Stores mastery data in global settings
- Affects cooldown calculations

**Status**: ✅ Fully implemented

---

### 10. src/actions/increment-level.ts
**UUID**: `com.dt.spellcooldowns2.incrementlevel`  
**Purpose**: Track champion level (1-18)

**Key Features**:
- Increments champion level on key press (max 18)
- Updates ability levels based on ability matrix
- Displays current level
- Stores level in global settings

**Status**: ✅ Fully implemented

---

### 11. src/actions/increment-legend-stack.ts
**UUID**: `com.dt.spellcooldowns2.incrementlegendstack`  
**Purpose**: Track Legend: Haste rune stacks (max 15)

**Key Features**:
- Increments stack count on key press (max 15)
- Displays current stack count
- Stores in global settings for haste calculation

**Status**: ✅ Fully implemented

---

## manifest.json
**Status**: Complete with all 11 actions defined

```json
{
	"Name": "spellcooldowns2",
	"Version": "0.1.0.0",
	"Author": "DT",
	"Actions": [
		{
			"Name": "Toggle Item",
			"UUID": "com.dt.spellcooldowns2.toggleitem",
			"PropertyInspectorPath": "ui/toggle-item.html",
			"States": [
				{ "Image": "imgs/actions/toggle-item/key" },
				{ "Image": "imgs/actions/toggle-item/key-active" }
			]
		},
		{
			"Name": "Display Haste",
			"UUID": "com.dt.spellcooldowns2.displayhaste"
		},
		{
			"Name": "Set Mastery",
			"UUID": "com.dt.spellcooldowns2.setmastery",
			"PropertyInspectorPath": "ui/set-mastery.html"
		},
		{
			"Name": "Champion Rotator",
			"UUID": "com.dt.spellcooldowns2.championrotator",
			"PropertyInspectorPath": "ui/champion-rotator.html"
		},
		{
			"Name": "Display Passive",
			"UUID": "com.dt.spellcooldowns2.displaypassive"
		},
		{
			"Name": "Display Q",
			"UUID": "com.dt.spellcooldowns2.displayq"
		},
		{
			"Name": "Display W",
			"UUID": "com.dt.spellcooldowns2.displayw"
		},
		{
			"Name": "Display E",
			"UUID": "com.dt.spellcooldowns2.displaye"
		},
		{
			"Name": "Display R",
			"UUID": "com.dt.spellcooldowns2.displayr"
		},
		{
			"Name": "Increment Level",
			"UUID": "com.dt.spellcooldowns2.incrementlevel",
			"PropertyInspectorPath": "ui/increment-level.html"
		},
		{
			"Name": "Increment Legend Stack",
			"UUID": "com.dt.spellcooldowns2.incrementlegendstack",
			"PropertyInspectorPath": "ui/increment-legend-stack.html"
		}
	],
	"Category": "spellcooldowns2",
	"CodePath": "bin/plugin.js",
	"SDKVersion": 3,
	"Nodejs": { "Version": "20", "Debug": "enabled" },
	"UUID": "com.dt.spellcooldowns2"
}
```

---

## UI Files
Property Inspector HTML files for configuration:
1. `ui/champion-rotator.html` - Champion selection
2. `ui/toggle-item.html` - Item selection
3. `ui/set-mastery.html` - Mastery configuration
4. `ui/increment-level.html` - Level tracking settings
5. `ui/increment-legend-stack.html` - Legend: Haste settings

**Status**: ✅ All UI files present and functional

---

## Data Files

### champion/champion.json
Contains champion data with abilities and cooldowns:
```json
[
  {
    "id": "champion_id",
    "name": "Champion Name",
    "img": "image.png",
    "passive": { "img": "passive.png", "cd": [cooldowns] },
    "q": { "img": "ability.png", "cd": [cooldowns per level] },
    "w": { "img": "ability.png", "cd": [cooldowns per level] },
    "e": { "img": "ability.png", "cd": [cooldowns per level] },
    "r": { "img": "ability.png", "cd": [cooldowns per level] }
  }
]
```

### items.json
Contains item data with haste values:
```json
[
  {
    "id": "item_id",
    "name": "Item Name",
    "img": "image_id",
    "ability_haste": "value",
    "basic_haste": "value",
    "ultimate_haste": "value",
    "type": "legendary"
  }
]
```

**Status**: ✅ Data files present and loaded by actions

---

## Implementation Status

### ✅ Completed Features
- [x] 11 actions fully implemented
- [x] Global settings manager (Singleton pattern)
- [x] Champion selection and tracking
- [x] Ability display with cooldowns and levels
- [x] Item management with activation states
- [x] Haste calculation and display
- [x] Level tracking (champion + abilities)
- [x] Mastery and rune tracking
- [x] Grid-based item layout
- [x] Dynamic updates via event listeners
- [x] Resource cleanup (listeners disposed on disappear)
- [x] Property Inspector UIs
- [x] Data loading from JSON files
- [x] Image management (champion/ability/item icons)

### 🔄 Potential Enhancements
- [ ] Real-time countdown timers (currently shows base cooldowns)
- [ ] Cooldown reduction calculations (haste formula application)
- [ ] Timer start/reset buttons
- [ ] Audio/visual alerts on cooldown completion
- [ ] Advanced cooldown tracking (per-instance timers)
- [ ] Cloud Dragon and other temporary haste bonuses

---

## Build Status
- **Working**: `npm run build` compiles successfully
- **Watch Mode**: `npm run watch` enables auto-restart on changes
- **Output**: Compiled to `com.dt.spellcooldowns2.sdPlugin/bin/plugin.js`
- **Plugins JSON**: `@rollup/plugin-json` enables JSON imports

---

## Git Status
- Repository initialized
- All files tracked
- Last command: `git status` (Exit Code: 0)

---

## Summary
This is a **production-ready** League of Legends plugin with comprehensive state management, multiple actions, and data-driven design. The plugin successfully tracks champions, abilities, items, and stats to support cooldown calculations. All 11 actions are functional and communicate via global settings.
