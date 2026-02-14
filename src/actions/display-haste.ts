import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager } from "../global-settings";

/**
 * An action that displays the total ability haste from all activated items in the grid.
 */
@action({ UUID: "com.dt.spellcooldowns2.displayhaste" })
export class DisplayHaste extends SingletonAction<DisplayHasteSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<DisplayHasteSettings>): Promise<void> {
		// Calculate and display the current total haste
		await this.updateHasteDisplay(ev.action);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Calculates and displays the total ability haste from activated items.
	 */
	override async onKeyDown(ev: KeyDownEvent<DisplayHasteSettings>): Promise<void> {
		// Calculate and display the current total haste
		await this.updateHasteDisplay(ev.action);
	}

	/**
	 * Calculates total ability haste and updates the display.
	 */
	private async updateHasteDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const grid = manager.getItemsGrid();
		
		let totalAbilityHaste = 0;
		let totalBasicHaste = 0;
		let totalUltimateHaste = 0;

		// Iterate through the entire grid
		for (let row = 0; row < grid.length; row++) {
			for (let col = 0; col < grid[row].length; col++) {
				const item = grid[row][col];
				
				// Only count activated items
				if (item && item.activated) {
					// Parse and add ability haste
					if (item.ability_haste) {
						const abilityHaste = parseInt(item.ability_haste, 10);
						if (!isNaN(abilityHaste)) {
							totalAbilityHaste += abilityHaste;
						}
					}
					
					// Parse and add basic haste
					if (item.basic_haste) {
						const basicHaste = parseInt(item.basic_haste, 10);
						if (!isNaN(basicHaste)) {
							totalBasicHaste += basicHaste;
						}
					}
					
					// Parse and add ultimate haste
					if (item.ultimate_haste) {
						const ultimateHaste = parseInt(item.ultimate_haste, 10);
						if (!isNaN(ultimateHaste)) {
							totalUltimateHaste += ultimateHaste;
						}
					}
				}
			}
		}

		// Display the total ability haste as the title
		await action.setTitle(`${totalAbilityHaste}`);
	}
}

/**
 * Settings for {@link DisplayHaste}.
 */
type DisplayHasteSettings = {
	// Settings can be added here if needed in the future
};
