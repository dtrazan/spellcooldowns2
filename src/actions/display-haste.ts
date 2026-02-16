import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager } from "../global-settings";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";

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

		// Get mastery haste to include in calculations
		const masteryHaste = manager.getCurrentMasteryHaste();
		
		// Calculate current basic haste (ability haste + basic haste + mastery haste)
		const currentBasicHaste = totalAbilityHaste + totalBasicHaste + masteryHaste;
		
		// Calculate current ultimate haste (ability haste + ultimate haste + mastery haste)
		const currentUltimateHaste = totalAbilityHaste + totalUltimateHaste + masteryHaste;
		
		// Update global settings with calculated values
		await manager.setCurrentBasicHaste(currentBasicHaste);
		await manager.setCurrentUltimateHaste(currentUltimateHaste);

		// Recalculate reduced cooldowns with new haste values
		await this.updateReducedCooldowns();

		// Display basic haste and ultimate haste from global settings
		const basicHaste = manager.getCurrentBasicHaste();
		const ultimateHaste = manager.getCurrentUltimateHaste();
		await action.setTitle(`${basicHaste}\n${ultimateHaste}`);
	}

	/**
	 * Recalculates reduced cooldowns based on current haste and base cooldowns.
	 */
	private async updateReducedCooldowns(): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Get current champion
		const currentChampion = manager.getCurrentChampion();
		if (!currentChampion) return;
		
		// Get ability levels
		const qLevel = manager.getCurrentQLevel();
		const wLevel = manager.getCurrentWLevel();
		const eLevel = manager.getCurrentELevel();
		const rLevel = manager.getCurrentRLevel();
		
		// Find champion in data
		const champion = championData.find((champ: any) => champ.id === currentChampion);
		if (!champion) return;
		
		// Get base cooldowns from champion data
		const qCooldown = qLevel > 0 && champion.q?.cd ? champion.q.cd[qLevel - 1] : 0;
		const wCooldown = wLevel > 0 && champion.w?.cd ? champion.w.cd[wLevel - 1] : 0;
		const eCooldown = eLevel > 0 && champion.e?.cd ? champion.e.cd[eLevel - 1] : 0;
		const rCooldown = rLevel > 0 && champion.r?.cd ? champion.r.cd[rLevel - 1] : 0;
		
		// Get current haste values
		const currentBasicHaste = manager.getCurrentBasicHaste();
		const currentUltimateHaste = manager.getCurrentUltimateHaste();
		
		// Calculate reduced cooldowns using ability haste formula
		const reducedQCooldown = qCooldown * (100 / (100 + currentBasicHaste));
		const reducedWCooldown = wCooldown * (100 / (100 + currentBasicHaste));
		const reducedECooldown = eCooldown * (100 / (100 + currentBasicHaste));
		const reducedRCooldown = rCooldown * (100 / (100 + currentUltimateHaste));
		
		// Update global settings with reduced cooldowns
		await manager.setReducedQCooldown(reducedQCooldown);
		await manager.setReducedWCooldown(reducedWCooldown);
		await manager.setReducedECooldown(reducedECooldown);
		await manager.setReducedRCooldown(reducedRCooldown);
	}
}

/**
 * Settings for {@link DisplayHaste}.
 */
type DisplayHasteSettings = {
	// Settings can be added here if needed in the future
};
