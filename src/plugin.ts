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
import { IncrementTakedown } from "./actions/increment-takedown";
import { SetDelay } from "./actions/set-delay";
import { GlobalSettingsManager } from "./global-settings";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the toggle item action.
streamDeck.actions.registerAction(new ToggleItem());

// Register the display haste action.
streamDeck.actions.registerAction(new DisplayHaste());

// Register the set mastery action.
streamDeck.actions.registerAction(new SetMastery());

// Register the rotate champion action.
streamDeck.actions.registerAction(new RotateChampion());

// Register the display passive action.
streamDeck.actions.registerAction(new DisplayPassive());

// Register the display Q action.
streamDeck.actions.registerAction(new DisplayQ());

// Register the display W action.
streamDeck.actions.registerAction(new DisplayW());

// Register the display E action.
streamDeck.actions.registerAction(new DisplayE());

// Register the display R action.
streamDeck.actions.registerAction(new DisplayR());

// Register the increment level action.
streamDeck.actions.registerAction(new IncrementLevel());

// Register the increment legend stack action.
streamDeck.actions.registerAction(new IncrementLegendStack());

// Register the increment takedown action.
streamDeck.actions.registerAction(new IncrementTakedown());

// Register the set delay action.
streamDeck.actions.registerAction(new SetDelay());

// Initialize global settings manager
GlobalSettingsManager.getInstance().initialize();

// Register deep-link handler
streamDeck.system.onDidReceiveDeepLink((ev) => {
	const { path, query, fragment } = ev.url;
	
	streamDeck.logger.info(`Received deep-link: path=${path}, query=${query}, fragment=${fragment}`);
	
	const manager = GlobalSettingsManager.getInstance();
	
	// Parse query string manually
	const parseQuery = (queryStr: string | undefined): Map<string, string> => {
		const params = new Map<string, string>();
		if (!queryStr) return params;
		const pairs = queryStr.split('&');
		for (const pair of pairs) {
			const [key, value] = pair.split('=');
			if (key) {
				params.set(key, decodeURIComponent(value || ''));
			}
		}
		return params;
	};
	
	const params = parseQuery(query);
	
	// Handle different deep-link paths
	if (path === "/timer/start") {
		// Toggle timer for a specific ability (start if stopped, cancel if running)
		// Example: streamdeck://plugins/message/com.dt.spellcooldowns2/timer/start?ability=q
		const ability = params.get("ability")?.toLowerCase();
		const now = Date.now();
		
		if (ability === "q") {
			const currentTimerEnd = manager.getTimerQEnd();
			if (currentTimerEnd > now) {
				// Timer is running - reset it to 0
				manager.setTimerQEnd(0);
				streamDeck.logger.info("Cancelled Q timer");
			} else {
				// Timer not running - start it
				const cooldown = manager.getReducedQCooldown();
				manager.setTimerQEnd(now + cooldown * 1000);
				streamDeck.logger.info(`Started Q timer: ${cooldown}s`);
			}
		} else if (ability === "w") {
			const currentTimerEnd = manager.getTimerWEnd();
			if (currentTimerEnd > now) {
				// Timer is running - reset it to 0
				manager.setTimerWEnd(0);
				streamDeck.logger.info("Cancelled W timer");
			} else {
				// Timer not running - start it
				const cooldown = manager.getReducedWCooldown();
				manager.setTimerWEnd(now + cooldown * 1000);
				streamDeck.logger.info(`Started W timer: ${cooldown}s`);
			}
		} else if (ability === "e") {
			const currentTimerEnd = manager.getTimerEEnd();
			if (currentTimerEnd > now) {
				// Timer is running - reset it to 0
				manager.setTimerEEnd(0);
				streamDeck.logger.info("Cancelled E timer");
			} else {
				// Timer not running - start it
				const cooldown = manager.getReducedECooldown();
				manager.setTimerEEnd(now + cooldown * 1000);
				streamDeck.logger.info(`Started E timer: ${cooldown}s`);
			}
		} else if (ability === "r") {
			const currentTimerEnd = manager.getTimerREnd();
			if (currentTimerEnd > now) {
				// Timer is running - reset it to 0
				manager.setTimerREnd(0);
				streamDeck.logger.info("Cancelled R timer");
			} else {
				// Timer not running - start it
				const cooldown = manager.getReducedRCooldown();
				manager.setTimerREnd(now + cooldown * 1000);
				streamDeck.logger.info(`Started R timer: ${cooldown}s`);
			}
		}
	} else if (path === "/timer/stop") {
		// Stop a timer for a specific ability
		// Example: streamdeck://plugins/message/com.dt.spellcooldowns2/timer/stop?ability=q
		const ability = params.get("ability")?.toLowerCase();
		
		if (ability === "q") {
			manager.setTimerQEnd(0);
			streamDeck.logger.info("Stopped Q timer");
		} else if (ability === "w") {
			manager.setTimerWEnd(0);
			streamDeck.logger.info("Stopped W timer");
		} else if (ability === "e") {
			manager.setTimerEEnd(0);
			streamDeck.logger.info("Stopped E timer");
		} else if (ability === "r") {
			manager.setTimerREnd(0);
			streamDeck.logger.info("Stopped R timer");
		} else if (ability === "all") {
			manager.setTimerQEnd(0);
			manager.setTimerWEnd(0);
			manager.setTimerEEnd(0);
			manager.setTimerREnd(0);
			streamDeck.logger.info("Stopped all timers");
		}
	} else if (path === "/champion/set") {
		// Set current champion
		// Example: streamdeck://plugins/message/com.dt.spellcooldowns2/champion/set?id=Aatrox
		const championId = params.get("id");
		if (championId) {
			manager.setCurrentChampion(championId);
			streamDeck.logger.info(`Set champion to: ${championId}`);
		}
	} else if (path === "/level/set") {
		// Set champion level
		// Example: streamdeck://plugins/message/com.dt.spellcooldowns2/level/set?level=18
		const levelStr = params.get("level");
		if (levelStr) {
			const level = parseInt(levelStr, 10);
			if (level >= 1 && level <= 18) {
				manager.setCurrentChampionLevel(level);
				streamDeck.logger.info(`Set champion level to: ${level}`);
			}
		}
	} else if (path === "/ability/level") {
		// Set ability level
		// Example: streamdeck://plugins/message/com.dt.spellcooldowns2/ability/level?ability=q&level=5
		const ability = params.get("ability")?.toLowerCase();
		const levelStr = params.get("level");
		
		if (ability && levelStr) {
			const level = parseInt(levelStr, 10);
			if (level >= 0 && level <= 5) {
				if (ability === "q") manager.setCurrentQLevel(level);
				else if (ability === "w") manager.setCurrentWLevel(level);
				else if (ability === "e") manager.setCurrentELevel(level);
				else if (ability === "r" && level <= 3) manager.setCurrentRLevel(level);
				streamDeck.logger.info(`Set ${ability.toUpperCase()} level to: ${level}`);
			}
		}
	} else if (path === "/reset") {
		// Reset all timers and optionally other states
		// Example: streamdeck://plugins/message/com.dt.spellcooldowns2/reset?timers=true
		const resetTimers = params.get("timers") === "true";
		
		if (resetTimers) {
			manager.setTimerQEnd(0);
			manager.setTimerWEnd(0);
			manager.setTimerEEnd(0);
			manager.setTimerREnd(0);
			streamDeck.logger.info("Reset all timers");
		}
	} else {
		streamDeck.logger.warn(`Unknown deep-link path: ${path}`);
	}
});

// Finally, connect to the Stream Deck.
streamDeck.connect();
