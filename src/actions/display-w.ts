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

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayWSettings>): Promise<void> {
		await this.updateWDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			this.updateWDisplay(ev.action);
		});
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
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Updates the W ability cooldown display.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayWSettings>): Promise<void> {
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

		// Set the W ability image
		await action.setImage(`imgs/spell/${champion.w.img}`);
		
		// Get current W level and cooldown from global settings
		const wLevel = manager.getCurrentWLevel();
		const wCooldown = manager.getCurrentWCooldown();
		
		// Display level and cooldown
		if (wLevel === 0) {
			await action.setTitle("Lvl 0");
		} else {
			await action.setTitle(`Lvl ${wLevel}\n${wCooldown}s`);
		}
	}
}

/**
 * Settings for {@link DisplayW}.
 */
type DisplayWSettings = {
	// Settings can be added here if needed in the future
};
