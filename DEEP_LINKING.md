# Deep-Linking Guide

The Spell Cooldowns plugin supports deep-linking, allowing you to control the plugin remotely via URLs. This is useful for integrating with other applications, automation tools, or game overlays.

## Base URL

```
streamdeck://plugins/message/com.dt.spellcooldowns2
```

## Available Commands

### 1. Start Timer

Toggle a cooldown timer for a specific ability. If the timer is not running, it will start. If it's already running, it will be cancelled (reset to 0).

**URL Format:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=<ability>
```

**Parameters:**
- `ability`: The ability to toggle timer for (`q`, `w`, `e`, or `r`)

**Examples:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=q
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=w
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=e
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=r
```

**Note:** This behaves like pressing the ability button on your Stream Deck - it toggles between starting and cancelling the timer.

### 2. Stop Timer

Stop a cooldown timer for a specific ability or all abilities.

**URL Format:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/stop?ability=<ability>
```

**Parameters:**
- `ability`: The ability to stop timer for (`q`, `w`, `e`, `r`, or `all`)

**Examples:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/stop?ability=q
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/stop?ability=all
```

### 3. Set Champion

Change the current champion.

**URL Format:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/champion/set?id=<championId>
```

**Parameters:**
- `id`: The champion ID (e.g., `Aatrox`, `Ahri`, `Yasuo`)

**Example:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/champion/set?id=Aatrox
```

### 4. Set Champion Level

Set the champion's level (1-18).

**URL Format:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/level/set?level=<level>
```

**Parameters:**
- `level`: Champion level (1-18)

**Example:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/level/set?level=18
```

### 5. Set Ability Level

Set the level of a specific ability.

**URL Format:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/ability/level?ability=<ability>&level=<level>
```

**Parameters:**
- `ability`: The ability (`q`, `w`, `e`, or `r`)
- `level`: Ability level (0-5 for Q/W/E, 0-3 for R)

**Examples:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/ability/level?ability=q&level=5
streamdeck://plugins/message/com.dt.spellcooldowns2/ability/level?ability=r&level=3
```

### 6. Reset

Reset all timers.

**URL Format:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/reset?timers=true
```

**Parameters:**
- `timers`: Set to `true` to reset all ability timers

**Example:**
```
streamdeck://plugins/message/com.dt.spellcooldowns2/reset?timers=true
```

## Testing Deep-Links

### Windows
1. Press `Win + R` to open the Run dialog
2. Paste the deep-link URL
3. Press Enter

### Browser
1. Copy the deep-link URL
2. Paste it into your browser's address bar
3. Press Enter
4. Confirm the prompt to open Stream Deck

## Use Cases

### 1. Game Overlay Integration
Trigger cooldown timers automatically when you cast abilities in-game by integrating with game overlay software.

### 2. Automation Scripts
Use PowerShell, Python, or other scripting languages to control the plugin:

**PowerShell Example:**
```powershell
Start-Process "streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=q"
```

**Python Example:**
```python
import webbrowser
webbrowser.open("streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=q")
```

### 3. External Applications
Build companion apps that communicate with the Stream Deck plugin to update champion stats, start timers, or reset states.

## Passive Deep-Links (Stream Deck 7.0+)

To send deep-links without bringing Stream Deck to the foreground, add `streamdeck=hidden` to the query string:

```
streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=q&streamdeck=hidden
```

This is useful for automation that shouldn't interrupt your workflow.

## Limitations

- Deep-links work only locally (not from remote sources)
- Keep URLs under 2,000 characters
- Some characters in parameter values must be URL-encoded

## Logging

All deep-link messages are logged in the Stream Deck logs. To view logs, check the Stream Deck console output.
