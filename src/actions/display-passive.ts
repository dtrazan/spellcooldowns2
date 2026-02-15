import streamDeck from "@elgato/streamdeck";
import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager, GlobalSettings } from "../global-settings";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";

/**
 * An action that displays the passive ability cooldown for the current champion.
 */
@action({ UUID: "com.dt.spellcooldowns2.displaypassive" })
export class DisplayPassive extends SingletonAction<DisplayPassiveSettings> {
	private settingsListener?: any;

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayPassiveSettings>): Promise<void> {
		await this.updatePassiveDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			this.updatePassiveDisplay(ev.action);
		});
	}

	/**
	 * The {@link SingletonAction.onWillDisappear} event is called when the action is removed from view.
	 */
	override async onWillDisappear(ev: WillDisappearEvent<DisplayPassiveSettings>): Promise<void> {
		// Clean up the listener when the action is removed
		if (this.settingsListener) {
			this.settingsListener.dispose?.();
			this.settingsListener = undefined;
		}
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Updates the passive cooldown display.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayPassiveSettings>): Promise<void> {
		await this.updatePassiveDisplay(ev.action);
	}

	/**
	 * Gets the current champion's passive ability and updates the display.
	 */
	private async updatePassiveDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentChampionId = manager.getCurrentChampion();

		if (!currentChampionId) {
			await action.setTitle("No\nChamp");
			await action.setImage(null);
			return;
		}

		// Find the champion data
		const champion = championData.find((c: any) => c.id === currentChampionId);
		
		if (!champion || !champion.passive) {
			await action.setTitle("No\nData");
			await action.setImage(null);
			return;
		}

		// Set the passive image
		await action.setImage(`imgs/passive/${champion.passive.img}`);
		
		// Display the passive name
		await action.setTitle(champion.passive.name || "");
	}
}

/**
 * Settings for {@link DisplayPassive}.
 */
type DisplayPassiveSettings = {
	// Settings can be added here if needed in the future
};
