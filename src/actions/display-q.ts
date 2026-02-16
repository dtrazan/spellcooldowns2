import streamDeck from "@elgato/streamdeck";
import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager, GlobalSettings } from "../global-settings";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";

/**
 * An action that displays the Q ability cooldown for the current champion.
 */
@action({ UUID: "com.dt.spellcooldowns2.displayq" })
export class DisplayQ extends SingletonAction<DisplayQSettings> {
	private settingsListener?: any;
	private updateInterval?: NodeJS.Timeout;

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayQSettings>): Promise<void> {
		await this.updateQDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			this.updateQDisplay(ev.action);
		});

		// Start interval to update timer display every 100ms
		this.updateInterval = setInterval(() => {
			this.updateQDisplay(ev.action);
		}, 100);
	}

	/**
	 * The {@link SingletonAction.onWillDisappear} event is called when the action is removed from view.
	 */
	override async onWillDisappear(ev: WillDisappearEvent<DisplayQSettings>): Promise<void> {
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
	 * Starts the cooldown timer for Q ability, or resets it if already running.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayQSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Check if timer is already running
		const currentTimerEnd = manager.getTimerQEnd();
		const now = Date.now();
		
		if (currentTimerEnd > now) {
			// Timer is running - reset it to 0
			await manager.setTimerQEnd(0);
		} else {
			// Timer not running - start it
			const qCooldown = manager.getReducedQCooldown();
			const timerEnd = now + (qCooldown * 1000);
			await manager.setTimerQEnd(timerEnd);
		}
		
		// Update display immediately
		await this.updateQDisplay(ev.action);
	}

	/**
	 * Gets the current champion's Q ability and updates the display.
	 */
	private async updateQDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentChampionId = manager.getCurrentChampion();

		if (!currentChampionId) {
			await action.setTitle("No\nChamp");
			await action.setImage(null);
			return;
		}

		// Find the champion data
		const champion = championData.find((c: any) => c.id === currentChampionId);
		
		if (!champion || !champion.q) {
			await action.setTitle("No\nData");
			await action.setImage(null);
			return;
		}

		// Set the Q ability image
		await action.setImage(`imgs/spell/${champion.q.img}`);
		
		// Get current Q level and reduced cooldown from global settings
		const qLevel = manager.getCurrentQLevel();
		const qCooldown = manager.getReducedQCooldown();
		
		// Check if timer is active
		const timerEnd = manager.getTimerQEnd();
		const now = Date.now();
		
		if (timerEnd > now) {
			// Timer is active - show countdown
			const remainingSeconds = (timerEnd - now) / 1000;
			await action.setTitle(`${remainingSeconds.toFixed(1)}s`);
		} else {
			// Timer expired or not started - show normal display
			if (qLevel === 0) {
				await action.setTitle("Lvl 0");
			} else {
				await action.setTitle(`Lvl ${qLevel}\n${qCooldown.toFixed(1)}s`);
			}
		}
	}
}

/**
 * Settings for {@link DisplayQ}.
 */
type DisplayQSettings = {
	// Settings can be added here if needed in the future
};
