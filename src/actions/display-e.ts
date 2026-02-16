import streamDeck from "@elgato/streamdeck";
import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager, GlobalSettings } from "../global-settings";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";

/**
 * An action that displays the E ability cooldown for the current champion.
 */
@action({ UUID: "com.dt.spellcooldowns2.displaye" })
export class DisplayE extends SingletonAction<DisplayESettings> {
	private settingsListener?: any;
	private updateInterval?: NodeJS.Timeout;

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayESettings>): Promise<void> {
		await this.updateEDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			this.updateEDisplay(ev.action);
		});

		// Start interval to update timer display every 100ms
		this.updateInterval = setInterval(() => {
			this.updateEDisplay(ev.action);
		}, 100);
	}

	/**
	 * The {@link SingletonAction.onWillDisappear} event is called when the action is removed from view.
	 */
	override async onWillDisappear(ev: WillDisappearEvent<DisplayESettings>): Promise<void> {
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
	 * Starts the cooldown timer for E ability, or resets it if already running.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayESettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Check if timer is already running
		const currentTimerEnd = manager.getTimerEEnd();
		const now = Date.now();
		
		if (currentTimerEnd > now) {
			// Timer is running - reset it to 0
			await manager.setTimerEEnd(0);
		} else {
			// Timer not running - start it
			const eCooldown = manager.getReducedECooldown();
			const timerEnd = now + (eCooldown * 1000);
			await manager.setTimerEEnd(timerEnd);
		}
		
		// Update display immediately
		await this.updateEDisplay(ev.action);
	}

	/**
	 * Gets the current champion's E ability and updates the display.
	 */
	private async updateEDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentChampionId = manager.getCurrentChampion();

		if (!currentChampionId) {
			await action.setTitle("No\nChamp");
			await action.setImage(null);
			return;
		}

		// Find the champion data
		const champion = championData.find((c: any) => c.id === currentChampionId);
		
		if (!champion || !champion.e) {
			await action.setTitle("No\nData");
			await action.setImage(null);
			return;
		}

		// Set the E ability image
		await action.setImage(`imgs/spell/${champion.e.img}`);
		
		// Get current E level and reduced cooldown from global settings
		const eLevel = manager.getCurrentELevel();
		const eCooldown = manager.getReducedECooldown();
		
		// Check if timer is active
		const timerEnd = manager.getTimerEEnd();
		const now = Date.now();
		
		if (timerEnd > now) {
			// Timer is active - show countdown
			const remainingSeconds = (timerEnd - now) / 1000;
			await action.setTitle(`${remainingSeconds.toFixed(1)}s`);
		} else {
			// Timer expired or not started - show normal display
			if (eLevel === 0) {
				await action.setTitle("Lvl 0");
			} else {
				await action.setTitle(`Lvl ${eLevel}\n${eCooldown.toFixed(1)}s`);
			}
		}
	}
}

/**
 * Settings for {@link DisplayE}.
 */
type DisplayESettings = {
	// Settings can be added here if needed in the future
};
