# Current Code State

## src/plugin.ts
```typescript
import streamDeck from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());

// Finally, connect to the Stream Deck.
streamDeck.connect();
```

**Status**: Basic setup, only registers IncrementCounter action

---

## src/actions/increment-counter.ts
```typescript
import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.dt.spellcooldowns2.increment" })
export class IncrementCounter extends SingletonAction<CounterSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible. This could be due to the Stream Deck first
	 * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
	 * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
	 */
	override onWillAppear(ev: WillAppearEvent<CounterSettings>): void | Promise<void> {
		return ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
	 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
	 * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
	 * settings using `setSettings` and `getSettings`.
	 */
	override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
		// Update the count from the settings.
		const { settings } = ev.payload;
		settings.incrementBy ??= 1;
		settings.count = (settings.count ?? 0) + settings.incrementBy;

		// Update the current count in the action's settings, and change the title.
		await ev.action.setSettings(settings);
		await ev.action.setTitle(`${settings.count}`);
	}
}

/**
 * Settings for {@link IncrementCounter}.
 */
type CounterSettings = {
	count?: number;
	incrementBy?: number;
};
```

**Status**: Working counter implementation with:
- Displays count on button
- Increments on key press
- Persists count in settings
- Type-safe settings

**Missing for Cooldown Functionality**:
- Timer management (setInterval/setTimeout)
- Countdown logic
- Timer cleanup in onWillDisappear
- Time-based state (endTime)
- Completion alerts

---

## manifest.json
```json
{
	"Name": "spellcooldowns2",
	"Version": "0.1.0.0",
	"Author": "DT",
	"Actions": [
		{
			"Name": "Counter",
			"UUID": "com.dt.spellcooldowns2.increment",
			"Icon": "imgs/actions/counter/icon",
			"Tooltip": "Displays a count, which increments by one on press.",
			"PropertyInspectorPath": "ui/increment-counter.html",
			"Controllers": ["Keypad"],
			"States": [
				{
					"Image": "imgs/actions/counter/key",
					"TitleAlignment": "middle"
				}
			]
		}
	],
	"Category": "spellcooldowns2",
	"CategoryIcon": "imgs/plugin/category-icon",
	"CodePath": "bin/plugin.js",
	"Description": "spellcooldowns2",
	"Icon": "imgs/plugin/marketplace",
	"SDKVersion": 3,
	"Software": {
		"MinimumVersion": "6.9"
	},
	"OS": [
		{
			"Platform": "mac",
			"MinimumVersion": "12"
		},
		{
			"Platform": "windows",
			"MinimumVersion": "10"
		}
	],
	"Nodejs": {
		"Version": "20",
		"Debug": "enabled"
	},
	"UUID": "com.dt.spellcooldowns2"
}
```

**Status**: Single action registered, ready to add more actions

---

## ui/increment-counter.html
Property Inspector UI for counter configuration (uses SDPI Components)

**Status**: Basic UI setup, can be enhanced for cooldown duration settings

---

## Next Implementation Tasks

1. **Create CooldownTimer action** (new file: `src/actions/cooldown-timer.ts`)
2. **Add timer state management** (Map of NodeJS.Timeout)
3. **Implement countdown logic** (setInterval, endTime calculation)
4. **Add cleanup** (onWillDisappear handler)
5. **Update manifest** (add new action definition)
6. **Register new action** (in plugin.ts)
7. **Create Property Inspector** (UI for duration/label settings)
8. **Add visual feedback** (showOk on completion)

## Git Status
- Last command: `git push -u origin main`
- Branch: main
- Status: Clean, pushed to remote
