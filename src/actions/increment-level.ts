import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager } from "../global-settings";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";

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
		
		// Ensure Transcendence bonus is correct for current level
		await this.updateTranscendenceBonus(globalLevel);
		
		// Update ability levels based on current champion level
		await this.updateAbilityLevels(globalLevel);
		
		// Update cooldowns based on ability levels
		await this.updateCurrentCooldowns();
		
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
			
			// Update Transcendence bonus based on level
			await this.updateTranscendenceBonus(level);
			
			// Update ability levels based on ability matrix
			await this.updateAbilityLevels(level);
			
			// Update cooldowns based on ability levels
			await this.updateCurrentCooldowns();
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
		
		// Update Transcendence bonus based on level
		await this.updateTranscendenceBonus(newLevel);
		
		// Update ability levels based on ability matrix
		await this.updateAbilityLevels(newLevel);
		
		// Update cooldowns based on ability levels
		await this.updateCurrentCooldowns();
		
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
	 * Updates the Transcendence bonus based on champion level.
	 * Levels 1-4: 0, Levels 5-7: 5, Levels 8-18: 10
	 * @param level The champion level (1-18)
	 */
	private async updateTranscendenceBonus(level: number): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		let bonus = 0;
		if (level >= 1 && level <= 4) {
			bonus = 0;
		} else if (level >= 5 && level <= 7) {
			bonus = 5;
		} else if (level >= 8 && level <= 18) {
			bonus = 10;
		}
		
		await manager.setCdTranscendenceBonus(bonus);
		
		// Update mastery haste display after Transcendence bonus changes
		await this.updateHasteDisplay();
	}

	/**
	 * Updates the mastery haste calculation based on all active masteries.
	 * This recalculates current_mastery_haste, current_basic_haste, and current_ultimate_haste.
	 * Note: This might be unnecessary?
	 */
	private async updateHasteDisplay(): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		const oldMasteryHaste = manager.getCurrentMasteryHaste();
		let masteryHaste = 0;
		
		if (manager.getHasCdShard()) {
			masteryHaste += manager.getCdShardBonus();
		}
		if (manager.getHasTranscendence()) {
			masteryHaste += manager.getCdTranscendenceBonus();
		}
		if (manager.getHasLegendHaste()) {
			masteryHaste += manager.getCdLegendBonus();
		}
		
		await manager.setCurrentMasteryHaste(masteryHaste);
		
		// Update current_basic_haste and current_ultimate_haste by adjusting for mastery haste change
		const currentBasicHaste = manager.getCurrentBasicHaste();
		const currentUltimateHaste = manager.getCurrentUltimateHaste();
		await manager.setCurrentBasicHaste(currentBasicHaste - oldMasteryHaste + masteryHaste);
		await manager.setCurrentUltimateHaste(currentUltimateHaste - oldMasteryHaste + masteryHaste);
	}

	/**
	 * Updates current ability cooldowns based on champion data and ability levels.
	 * Reads champion.json to get base cooldowns for Q, W, E, R at their respective levels.
	 */
	private async updateCurrentCooldowns(): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Get current champion and ability levels
		const currentChampion = manager.getCurrentChampion();
		if (!currentChampion) return;
		
		const qLevel = manager.getCurrentQLevel();
		const wLevel = manager.getCurrentWLevel();
		const eLevel = manager.getCurrentELevel();
		const rLevel = manager.getCurrentRLevel();
		
		// Find champion in data
		const champion = championData.find((champ: any) => champ.id === currentChampion);
		if (!champion) return;
		
		// Get cooldowns from champion data (cd arrays are 0-indexed)
		// Q/W/E have 5 levels (index 0-4), R has 3 levels (index 0-2)
		const qCooldown = qLevel > 0 && champion.q?.cd ? champion.q.cd[qLevel - 1] : 0;
		const wCooldown = wLevel > 0 && champion.w?.cd ? champion.w.cd[wLevel - 1] : 0;
		const eCooldown = eLevel > 0 && champion.e?.cd ? champion.e.cd[eLevel - 1] : 0;
		const rCooldown = rLevel > 0 && champion.r?.cd ? champion.r.cd[rLevel - 1] : 0;
		
		// Update global settings with cooldowns
		await manager.setCurrentQCooldown(qCooldown);
		await manager.setCurrentWCooldown(wCooldown);
		await manager.setCurrentECooldown(eCooldown);
		await manager.setCurrentRCooldown(rCooldown);
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
