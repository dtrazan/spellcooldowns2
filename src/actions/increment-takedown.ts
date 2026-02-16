import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager } from "../global-settings";

/**
 * An action that increments the takedown count.
 * Template only - functionality to be implemented.
 */
@action({ UUID: "com.dt.spellcooldowns2.incrementtakedown" })
export class IncrementTakedown extends SingletonAction<IncrementTakedownSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<IncrementTakedownSettings>): Promise<void> {
		// TODO: Implement initialization logic
		await this.updateDisplay(ev.action);
	}

	/**
	 * Handle settings changes from the property inspector.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<IncrementTakedownSettings>): Promise<void> {
		// TODO: Implement settings change logic
		await this.updateDisplay(ev.action);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 */
	override async onKeyDown(ev: KeyDownEvent<IncrementTakedownSettings>): Promise<void> {
		// TODO: Implement increment logic
		await this.updateDisplay(ev.action);
	}

	/**
	 * Updates the display.
	 */
	private async updateDisplay(action: any): Promise<void> {
		// TODO: Implement display update logic
		await action.setTitle("TD");
	}
}

/**
 * Settings for {@link IncrementTakedown}.
 */
type IncrementTakedownSettings = {
	// TODO: Add settings properties as needed
};
