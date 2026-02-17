import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager } from "../global-settings";

/**
 * Settings for {@link SetDelay}.
 */
type SetDelaySettings = {
	/**
	 * The delay value to set.
	 */
	delayValue?: number;
};

/**
 * An action that sets a delay value.
 */
@action({ UUID: "com.dt.spellcooldowns2.setdelay" })
export class SetDelay extends SingletonAction<SetDelaySettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<SetDelaySettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const globalDelay = manager.getSetDelay();
		
		// Sync the property inspector with global settings if not set
		if (ev.payload.settings.delayValue === undefined) {
			await ev.action.setSettings({ delayValue: globalDelay });
		}
		
		// Display the current delay value
		await this.updateDisplay(ev.action);
	}

	/**
	 * Handle settings changes from the property inspector.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<SetDelaySettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const delayInput = ev.payload.settings.delayValue;
		
		// Parse delay as number (property inspector may send it as string)
		const delay = typeof delayInput === 'string' ? parseInt(delayInput, 10) : delayInput;
		
		if (delay !== undefined && !isNaN(delay) && delay >= 0) {
			// Update global settings when property inspector changes
			await manager.setSetDelay(delay);
		}
		
		// Update display
		await this.updateDisplay(ev.action);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Sets the delay value from the property inspector setting.
	 */
	override async onKeyDown(ev: KeyDownEvent<SetDelaySettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const delayInput = ev.payload.settings.delayValue;
		
		// Parse delay as number (property inspector may send it as string)
		const delay = typeof delayInput === 'string' ? parseInt(delayInput, 10) : delayInput;
		
		if (delay !== undefined && !isNaN(delay) && delay >= 0) {
			// Update global settings when key is pressed
			await manager.setSetDelay(delay);
			
			// Update display
			await this.updateDisplay(ev.action);
		}
	}

	/**
	 * Updates the display to show the current delay value.
	 */
	private async updateDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const delay = manager.getSetDelay();
		
		// Display the delay value
		await action.setTitle(`${delay}ms`);
	}
}
