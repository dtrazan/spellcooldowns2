import streamDeck from "@elgato/streamdeck";
import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager, GlobalSettings } from "../global-settings";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";

/**
 * An action that displays the W ability cooldown for the current champion.
 */
@action({ UUID: "com.dt.spellcooldowns2.displayw" })
export class DisplayW extends SingletonAction<DisplayWSettings> {
	private settingsListener?: any;
	private updateInterval?: NodeJS.Timeout;

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayWSettings>): Promise<void> {
		await this.updateWDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			this.updateWDisplay(ev.action);
		});

		// Start interval to update timer display every 100ms
		this.updateInterval = setInterval(() => {
			this.updateWDisplay(ev.action);
		}, 100);
	}

	/**
	 * The {@link SingletonAction.onWillDisappear} event is called when the action is removed from view.
	 */
	override async onWillDisappear(ev: WillDisappearEvent<DisplayWSettings>): Promise<void> {
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
	 * Starts the cooldown timer for W ability, or resets it if already running.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayWSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Check if timer is already running
		const currentTimerEnd = manager.getTimerWEnd();
		const now = Date.now();
		
		if (currentTimerEnd > now) {
			// Timer is running - reset it to 0
			await manager.setTimerWEnd(0);
		} else {
			// Timer not running - start it
			const wCooldown = manager.getReducedWCooldown();
			const timerEnd = now + (wCooldown * 1000);
			await manager.setTimerWEnd(timerEnd);
		}
		
		// Update display immediately
		await this.updateWDisplay(ev.action);
	}

	/**
	 * Gets the current champion's W ability and updates the display.
	 */
	private async updateWDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentChampionId = manager.getCurrentChampion();

		if (!currentChampionId) {
			await action.setTitle("No\nChamp");
			await action.setImage(null);
			return;
		}

		// Find the champion data
		const champion = championData.find((c: any) => c.id === currentChampionId);
		
		if (!champion || !champion.w) {
			await action.setTitle("No\nData");
			await action.setImage(null);
			return;
		}

		// Get current W level and reduced cooldown from global settings
		const wLevel = manager.getCurrentWLevel();
		const wCooldown = manager.getReducedWCooldown();

		// Set the W ability image
		// Check if timer is active to determine which image to show
		const timerEnd = manager.getTimerWEnd();
		const now = Date.now();
		const isTimerActive = timerEnd > now;
		
		if (wLevel === 0) {
			// Level 0 - show off image
			await action.setImage(`imgs/off/${champion.w.img}`);
		} else if (isTimerActive) {
			// Timer active - show cooldown image
			await action.setImage(`imgs/cd/${champion.w.img}`);
		} else {
			// Timer not active - show normal image
			await action.setImage(`imgs/spell/${champion.w.img}`);
		}
		
		if (isTimerActive) {
			// Timer is active - show countdown
			const remainingSeconds = Math.ceil((timerEnd - now) / 1000);
			await action.setTitle(`${remainingSeconds}`);
		} else {
			// Timer expired or not started - show normal display
			if (wLevel === 0) {
				await action.setTitle("");
			} else {
				await action.setTitle(`${Math.ceil(wCooldown)}`);
			}
		}
	}
}

/**
 * Settings for {@link DisplayW}.
 */
type DisplayWSettings = {
	// Settings can be added here if needed in the future
};
