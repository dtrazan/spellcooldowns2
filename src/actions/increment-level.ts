import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager } from "../global-settings";

/**
 * An action that increments the champion level (max 18).
 */
@action({ UUID: "com.dt.spellcooldowns2.incrementlevel" })
export class IncrementLevel extends SingletonAction<IncrementLevelSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<IncrementLevelSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const globalLevel = manager.getCurrentChampionLevel();
		
		// Sync the property inspector with global settings if not set
		if (!ev.payload.settings.championLevel) {
			await ev.action.setSettings({ championLevel: globalLevel });
		}
		
		// Update ability levels based on current champion level
		await this.updateAbilityLevels(globalLevel);
		
		// Display the current champion level
		await this.updateLevelDisplay(ev.action);
	}

	/**
	 * Handle settings changes from the property inspector.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<IncrementLevelSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const levelInput = ev.payload.settings.championLevel;
		
		// Parse level as number (property inspector may send it as string)
		const level = typeof levelInput === 'string' ? parseInt(levelInput, 10) : levelInput;
		
		if (level !== undefined && !isNaN(level) && level >= 1 && level <= 18) {
			// Update global settings when property inspector changes
			await manager.setCurrentChampionLevel(level);
			
			// Update ability levels based on ability matrix
			await this.updateAbilityLevels(level);
		}
		
		// Update display
		await this.updateLevelDisplay(ev.action);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Increments the champion level (max 18, then wraps to 1).
	 */
	override async onKeyDown(ev: KeyDownEvent<IncrementLevelSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentLevel = manager.getCurrentChampionLevel();
		
		// Increment level, wrapping from 18 to 1
		const newLevel = currentLevel >= 18 ? 1 : currentLevel + 1;
		await manager.setCurrentChampionLevel(newLevel);
		
		// Update ability levels based on ability matrix
		await this.updateAbilityLevels(newLevel);
		
		// Update the property inspector setting (as number)
		await ev.action.setSettings({ championLevel: newLevel });
		
		// Update display
		await this.updateLevelDisplay(ev.action);
	}

	/**
	 * Updates ability levels based on the ability matrix and current champion level.
	 * @param level The champion level (1-18)
	 */
	private async updateAbilityLevels(level: number): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Convert level to column index (level 1 = column 0, level 18 = column 17)
		const columnIndex = level - 1;
		
		// Get ability levels from the matrix for this champion level
		const qLevel = manager.getAbilityMatrixValue(0, columnIndex);
		const wLevel = manager.getAbilityMatrixValue(1, columnIndex);
		const eLevel = manager.getAbilityMatrixValue(2, columnIndex);
		const rLevel = manager.getAbilityMatrixValue(3, columnIndex);
		
		// Update global settings with the ability levels
		await manager.setCurrentQLevel(qLevel);
		await manager.setCurrentWLevel(wLevel);
		await manager.setCurrentELevel(eLevel);
		await manager.setCurrentRLevel(rLevel);
	}

	/**
	 * Updates the display to show the current champion level.
	 */
	private async updateLevelDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const level = manager.getCurrentChampionLevel();
		await action.setTitle(`Lvl ${level}`);
	}
}

/**
 * Settings for {@link IncrementLevel}.
 */
type IncrementLevelSettings = {
	championLevel?: number | string; // Property inspector may send as string
};
