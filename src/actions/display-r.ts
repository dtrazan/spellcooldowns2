import streamDeck from "@elgato/streamdeck";
import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager, GlobalSettings } from "../global-settings";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";

/**
 * An action that displays the R ability cooldown for the current champion.
 */
@action({ UUID: "com.dt.spellcooldowns2.displayr" })
export class DisplayR extends SingletonAction<DisplayRSettings> {
	private settingsListener?: any;
	private updateInterval?: NodeJS.Timeout;

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayRSettings>): Promise<void> {
		await this.updateRDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			this.updateRDisplay(ev.action);
		});

		// Start interval to update timer display every 100ms
		this.updateInterval = setInterval(() => {
			this.updateRDisplay(ev.action);
		}, 100);
	}

	/**
	 * The {@link SingletonAction.onWillDisappear} event is called when the action is removed from view.
	 */
	override async onWillDisappear(ev: WillDisappearEvent<DisplayRSettings>): Promise<void> {
		// Clean up the listener when the action is removed
		if (this.settingsListener) {
			this.settingsListener.dispose?.();
			this.settingsListener = undefined;
		}

		// Clear the update interval
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = undefined;
		}
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Starts the cooldown timer for R ability, or resets it if already running.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayRSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Check if timer is already running
		const currentTimerEnd = manager.getTimerREnd();
		const now = Date.now();
		
		if (currentTimerEnd > now) {
			// Timer is running - reset it to 0
			await manager.setTimerREnd(0);
		} else {
			// Timer not running - start it
			const rCooldown = manager.getReducedRCooldown();
			const timerEnd = now + (rCooldown * 1000);
			await manager.setTimerREnd(timerEnd);
		}
		
		// Update display immediately
		await this.updateRDisplay(ev.action);
	}

	/**
	 * Gets the current champion's R ability and updates the display.
	 */
	private async updateRDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentChampionId = manager.getCurrentChampion();

		if (!currentChampionId) {
			await action.setTitle("No\nChamp");
			await action.setImage(null);
			return;
		}

		// Find the champion data
		const champion = championData.find((c: any) => c.id === currentChampionId);
		
		if (!champion || !champion.r) {
			await action.setTitle("No\nData");
			await action.setImage(null);
			return;
		}

		// Get current R level and reduced cooldown from global settings
		const rLevel = manager.getCurrentRLevel();
		const rCooldown = manager.getReducedRCooldown();

		// Set the R ability image
		// Check if timer is active to determine which image to show
		const timerEnd = manager.getTimerREnd();
		const now = Date.now();
		const isTimerActive = timerEnd > now;
		
		if (rLevel === 0) {
			// Level 0 - show off image
			await action.setImage(`imgs/off/${champion.r.img}`);
		} else if (isTimerActive) {
			// Timer active - show cooldown image
			await action.setImage(`imgs/cd/${champion.r.img}`);
		} else {
			// Timer not active - show normal image
			await action.setImage(`imgs/spell/${champion.r.img}`);
		}
		
		if (isTimerActive) {
			// Timer is active - show countdown
			const remainingSeconds = Math.ceil((timerEnd - now) / 1000);
			await action.setTitle(`${remainingSeconds}`);
		} else {
			// Timer expired or not started - show normal display
			if (rLevel === 0) {
				await action.setTitle("");
			} else {
				await action.setTitle(`${Math.ceil(rCooldown)}`);
			}
		}
	}
}

/**
 * Settings for {@link DisplayR}.
 */
type DisplayRSettings = {
	// Settings can be added here if needed in the future
};
