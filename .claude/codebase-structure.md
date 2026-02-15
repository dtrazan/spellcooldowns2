# Codebase Structure

## Directory Layout

```
spellcooldowns2/
├── .claude/                              # Context files for AI assistants
│   ├── README.md
│   ├── project-context.md
│   ├── codebase-structure.md
│   ├── current-code-state.md
│   ├── documentation-summary.md
│   └── timer-implementation-guide.md
├── com.dt.spellcooldowns2.sdPlugin/      # Stream Deck plugin bundle
│   ├── bin/
│   │   ├── package.json
│   │   └── plugin.js                     # Compiled plugin code
│   ├── champion/
│   │   ├── champion.json                  # Champion data (abilities, cooldowns)
│   │   ├── champion_ability_order.json    # Ability leveling priorities
│   │   └── mastery.json                   # Mastery data
│   ├── imgs/
│   │   ├── actions/                       # Action icons for all 11 actions
│   │   │   ├── champion-rotator/
│   │   │   ├── display-e/
│   │   │   ├── display-haste/
│   │   │   ├── display-passive/
│   │   │   ├── display-q/
│   │   │   ├── display-r/
│   │   │   ├── display-w/
│   │   │   ├── increment-legend-stack/
│   │   │   ├── increment-level/
│   │   │   ├── set-mastery/
│   │   │   └── toggle-item/
│   │   ├── champion/                     # Champion images
│   │   ├── deactivated/                  # Inactive item images
│   │   ├── item/                         # Active item images
│   │   ├── mastery/                      # Mastery images
│   │   ├── off/                          # Off-state images
│   │   ├── passive/                      # Passive ability images
│   │   ├── plugin/                       # Plugin icons
│   │   └── spell/                        # Ability images (Q/W/E/R)
│   ├── items.json                        # Item data with haste values
│   ├── logs/                             # Runtime logs
│   ├── ui/
│   │   ├── champion-rotator.html         # Champion selection UI
│   │   ├── increment-legend-stack.html   # Legend: Haste UI
│   │   ├── increment-level.html          # Level tracking UI
│   │   ├── set-mastery.html              # Mastery configuration UI
│   │   └── toggle-item.html              # Item selection UI
│   └── manifest.json                     # Plugin manifest (11 actions)
├── docs/                                 # Comprehensive SDK documentation
│   ├── knowledge-base/                   # Markdown documentation
│   ├── doc-site/                         # Docusaurus website
│   └── rag-system/                       # RAG/AI query system
├── src/                                  # TypeScript source code
│   ├── actions/
│   │   ├── champion-rotator.ts           # Champion selection/switching
│   │   ├── display-e.ts                  # E ability display
│   │   ├── display-haste.ts              # Total haste display
│   │   ├── display-passive.ts            # Passive ability display
│   │   ├── display-q.ts                  # Q ability display
│   │   ├── display-r.ts                  # R ability display
│   │   ├── display-w.ts                  # W ability display
│   │   ├── increment-legend-stack.ts     # Legend: Haste tracking
│   │   ├── increment-level.ts            # Champion level tracking
│   │   ├── set-mastery.ts                # Mastery configuration
│   │   └── toggle-item.ts                # Item activation/deactivation
│   ├── global-settings.ts                # Global settings manager (Singleton)
│   └── plugin.ts                         # Plugin entry point
├── package.json                          # NPM dependencies and scripts
├── rollup.config.mjs                     # Build configuration
└── tsconfig.json                         # TypeScript configuration
```

## Key Files

### manifest.json
Defines plugin metadata and all 11 actions:
- Plugin UUID: `com.dt.spellcooldowns2`
- Actions: Champion Rotator, Display abilities (Passive/Q/W/E/R), Toggle Item, Display Haste, Set Mastery, Increment Level, Increment Legend Stack
- Node.js version: 20
- Minimum Stream Deck version: 6.9
- SDK Version: 3

### src/plugin.ts
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

### src/global-settings.ts
Singleton class managing shared state across all actions:
- **ItemsGrid**: 2D array of items at specific positions
- **Champion State**: Current champion, level, ability levels
- **Ability Matrix**: Ability level-up tracking
- **Haste Tracking**: Basic, ultimate, and mastery haste
- **Rune/Item Bonuses**: CD shard, Axiom Arcanist, Transcendence, Legend: Haste

Key properties:
- `itemsGrid: (ItemData | null)[][]` - Grid of items
- `current_champion: string` - Current champion ID
- `current_champion_level: number` - Champion level (1-18)
- `current_q_level / current_w_level / current_e_level / current_r_level` - Ability levels
- `current_basic_haste / current_ultimate_haste / current_mastery_haste` - Haste values
- `has_cd_shard / has_axiom_arcanist / has_transcendence / has_legend_haste` - Boolean flags
- `current_legend_stack: number` - Legend: Haste stacks (0-15)

## Action Development Pattern

All actions follow this pattern:
1. Import from `@elgato/streamdeck`
2. Decorate with `@action({ UUID: "..." })`
3. Extend `SingletonAction<SettingsType>`
4. Override lifecycle methods:
   - `onWillAppear` - Initialize display, set images/titles
   - `onKeyDown` - Handle button press
   - `onDidReceiveSettings` - Handle settings changes from Property Inspector
   - `onWillDisappear` - Cleanup resources (listeners, timers)

### Example: Display Action Pattern
```typescript
@action({ UUID: "com.dt.spellcooldowns2.displayq" })
export class DisplayQ extends SingletonAction<DisplayQSettings> {
	private settingsListener?: any;

	override async onWillAppear(ev: WillAppearEvent<DisplayQSettings>): Promise<void> {
		await this.updateQDisplay(ev.action);
		
		// Listen for global settings changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings(() => {
			this.updateQDisplay(ev.action);
		});
	}

	override async onWillDisappear(ev: WillDisappearEvent<DisplayQSettings>): Promise<void> {
		// Clean up listener
		if (this.settingsListener) {
			this.settingsListener.dispose?.();
		}
	}

	private async updateQDisplay(action: any): Promise<void> {
		// Get champion data, set image and title
	}
}
```

## Build Process
1. TypeScript compiled to JavaScript via Rollup
2. JSON files imported using `@rollup/plugin-json`
3. Output placed in `com.dt.spellcooldowns2.sdPlugin/bin/`
4. Stream Deck loads from `.sdPlugin` directory
5. Watch mode auto-restarts plugin on changes

## Settings Persistence

### Global Settings
Managed by `GlobalSettingsManager` singleton:
- Shared across all action instances
- Accessed via `GlobalSettingsManager.getInstance()`
- Updated via `setGlobalSettings()` method
- Persisted by Stream Deck

### Per-Action Settings
- Settings stored per-action-instance by Stream Deck
- Access via `ev.payload.settings`
- Update via `ev.action.setSettings(newSettings)`
- Type-safe with TypeScript generics

## Data Files Structure

### champion.json
```json
[
  {
    "id": "champion_name",
    "name": "Display Name",
    "img": "image_file.png",
    "passive": { "img": "ability.png", "cd": [numbers] },
    "q": { "img": "ability.png", "cd": [numbers] },
    "w": { "img": "ability.png", "cd": [numbers] },
    "e": { "img": "ability.png", "cd": [numbers] },
    "r": { "img": "ability.png", "cd": [numbers] }
  }
]
```

### items.json
```json
[
  {
    "id": "item_id",
    "name": "Item Name",
    "img": "image_id",
    "ability_haste": "value",
    "basic_haste": "value",
    "ultimate_haste": "value",
    "type": "legendary|mythic|etc"
  }
]
```

