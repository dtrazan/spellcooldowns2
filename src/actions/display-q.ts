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
	private currentAction?: any;

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayQSettings>): Promise<void> {
		// Store the action reference
		this.currentAction = ev.action;
		
		await this.updateQDisplay(ev.action);

		// Listen for global settings changes to update when champion changes
		this.settingsListener = streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((settingsEv) => {
			if (this.currentAction) {
				this.updateQDisplay(this.currentAction);
			}
		});
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
		
		// Clear the action reference
		this.currentAction = undefined;
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Updates the Q ability cooldown display.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayQSettings>): Promise<void> {
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
		
		// Get current Q level
		const qLevel = manager.getCurrentQLevel();
		
		// Display level and cooldown
		if (qLevel === 0) {
			await action.setTitle("Lvl 0");
		} else if (qLevel > 0 && qLevel <= champion.q.cd.length) {
			// Get cooldown for current level (level 1 = index 0)
			const cooldown = champion.q.cd[qLevel - 1];
			await action.setTitle(`Lvl ${qLevel}\n${cooldown}s`);
		} else {
			await action.setTitle(`Lvl ${qLevel}`);
		}
	}
}

/**
 * Settings for {@link DisplayQ}.
 */
type DisplayQSettings = {
	// Settings can be added here if needed in the future
};
