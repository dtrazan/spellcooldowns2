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

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayRSettings>): Promise<void> {
		await this.updateRDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			this.updateRDisplay(ev.action);
		});
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
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Updates the R ability cooldown display.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayRSettings>): Promise<void> {
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

		// Set the R ability image
		await action.setImage(`imgs/spell/${champion.r.img}`);
		
		// Get current R level and cooldown from global settings
		const rLevel = manager.getCurrentRLevel();
		const rCooldown = manager.getCurrentRCooldown();
		
		// Display level and cooldown
		if (rLevel === 0) {
			await action.setTitle("Lvl 0");
		} else {
			await action.setTitle(`Lvl ${rLevel}\n${rCooldown}s`);
		}
	}
}

/**
 * Settings for {@link DisplayR}.
 */
type DisplayRSettings = {
	// Settings can be added here if needed in the future
};
