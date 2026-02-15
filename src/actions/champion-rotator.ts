import { action, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";
import abilityOrderData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion_ability_order.json";
import { GlobalSettingsManager } from "../global-settings";

// Cache for champions loaded from champion.json
const championCache: ChampionData[] = championData.map(champion => ({
	id: champion.id,
	name: champion.name,
	image: champion.img
}));

/**
 * Represents a champion item.
 */
interface ChampionData {
	id: string;
	name: string;
	image: string;
}

/**
 * Represents champion ability order data.
 */
interface AbilityOrderData {
	id: string;
	name: string;
	start1: string;
	start2: string;
	start3: string;
	start4: string;
	start5: string;
	first: string;
	second: string;
	last: string;
}

/**
 * Load champions from champion.json file
 */
function loadChampionsFromJson(): ChampionData[] {
	return championCache;
}

/**
 * An action that allows rotating through champions.
 */
@action({ UUID: "com.dt.spellcooldowns2.championrotator" })
export class RotateChampion extends SingletonAction<RotateChampionSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<RotateChampionSettings>): Promise<void> {
		const settings = ev.payload.settings;
		const champions = loadChampionsFromJson();
		const manager = GlobalSettingsManager.getInstance();
		
		// Get the current champion from global settings
		let currentChampionId = manager.getCurrentChampion();
		
		// If no champion is set or current champion doesn't exist, default to first champion
		if (!currentChampionId || !champions.find(c => c.id === currentChampionId)) {
			if (champions.length > 0) {
				currentChampionId = champions[0].id;
				await manager.setCurrentChampion(currentChampionId);
			}
		}
		
		// Check if the ability matrix is empty (all zeros)
		if (currentChampionId) {
			const matrix = manager.getAbilityMatrix();
			const isMatrixEmpty = matrix.every(row => row.every(val => val === 0));
			
			// If champion is set but matrix is empty, populate it
			if (isMatrixEmpty) {
				await this.fillMatrix(currentChampionId);
			}
		}
		
		// Find the current champion data
		const currentChampion = champions.find(c => c.id === currentChampionId);
		
		if (currentChampion) {
			// Set the image for the current champion
			await ev.action.setImage(`imgs/champion/${currentChampion.image}`);
			
			// Display the champion name
			await ev.action.setTitle(currentChampion.name || "");
		}
	}

	/**
	 * Handle settings changes from property inspector
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<RotateChampionSettings>): Promise<void> {
		const settings = ev.payload.settings;
		const manager = GlobalSettingsManager.getInstance();
		
		// Parse selected champion from property inspector
		if (settings.selectedChampion) {
			try {
				const championData = JSON.parse(settings.selectedChampion);
				
				// Update global current_champion setting
				await manager.setCurrentChampion(championData.id);
				
				// Fill the ability matrix for this champion
				await this.fillMatrix(championData.id);
				
				// Handle both 'img' (from property inspector) and 'image' (legacy) fields
				const imageFile = championData.img || championData.image;
				
				// Update the display with the selected champion
				await ev.action.setImage(`imgs/champion/${imageFile}`);
				await ev.action.setTitle(championData.name || "");
			} catch (e) {
				console.error('Failed to parse selected champion:', e);
			}
		}
	}

	/**
	 * Fill Matrix - Populates the ability matrix based on champion's ability order and updates global settings.
	 * @param championId The champion ID to generate the ability matrix for
	 */
	private async fillMatrix(championId: string): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Initialize empty 4x18 matrix (Q, W, E, R) x (levels 1-18)
		const matrix: number[][] = Array.from({ length: 4 }, () => Array(18).fill(0));
		
		// Find the ability order for this champion
		const abilityOrder = abilityOrderData.find((ao: any) => ao.id === championId) as AbilityOrderData | undefined;
		
		if (!abilityOrder) {
			console.error(`No ability order found for champion: ${championId}`);
			// Reset matrix to empty in global settings
			await manager.resetAbilityMatrix();
			return;
		}

		// Helper to convert ability letter to row index
		const abilityToRow = (ability: string): number => {
			switch (ability.toLowerCase()) {
				case 'q': return 0;
				case 'w': return 1;
				case 'e': return 2;
				case 'r': return 3;
				default: return -1;
			}
		};

		// Track current level of each ability
		const abilityLevels = [0, 0, 0, 0]; // [Q, W, E, R]
		let lastLeveledAbility = -1; // Track the last ability that was leveled

		// Level 1-5: Use specific start abilities
		const startAbilities = [
			abilityOrder.start1,
			abilityOrder.start2,
			abilityOrder.start3,
			abilityOrder.start4,
			abilityOrder.start5
		];

		for (let level = 0; level < 5; level++) {
			const abilityRow = abilityToRow(startAbilities[level]);
			if (abilityRow !== -1) {
				abilityLevels[abilityRow]++;
				lastLeveledAbility = abilityRow;
			}
			// Fill all ability levels for this champion level (carry forward current values)
			for (let row = 0; row < 4; row++) {
				matrix[row][level] = abilityLevels[row];
			}
		}

		// Level 6: Always R
		abilityLevels[3]++;
		lastLeveledAbility = 3;
		for (let row = 0; row < 4; row++) {
			matrix[row][5] = abilityLevels[row];
		}

		// Levels 7-18: Follow first -> second -> last priority with R at 11 and 16
		const firstRow = abilityToRow(abilityOrder.first);
		const secondRow = abilityToRow(abilityOrder.second);
		const lastRow = abilityToRow(abilityOrder.last);

		for (let level = 6; level < 18; level++) {
			let abilityToLevel = -1;
			
			// R levels at 11 and 16 (indices 10 and 15)
			if (level === 10 || level === 15) {
				// Check if R was just leveled (shouldn't happen at these specific levels)
				if (lastLeveledAbility === 3) {
					// Level the highest priority non-R ability instead
					if (firstRow !== -1 && abilityLevels[firstRow] < 5) {
						abilityToLevel = firstRow;
					} else if (secondRow !== -1 && abilityLevels[secondRow] < 5) {
						abilityToLevel = secondRow;
					} else if (lastRow !== -1 && abilityLevels[lastRow] < 5) {
						abilityToLevel = lastRow;
					}
				} else {
					abilityToLevel = 3;
				}
			}
			// Max first ability (but not if it was just leveled)
			else if (firstRow !== -1 && abilityLevels[firstRow] < 5 && firstRow !== lastLeveledAbility) {
				abilityToLevel = firstRow;
			}
			// Max second ability (but not if it was just leveled)
			else if (secondRow !== -1 && abilityLevels[secondRow] < 5 && secondRow !== lastLeveledAbility) {
				abilityToLevel = secondRow;
			}
			// Max last ability (but not if it was just leveled)
			else if (lastRow !== -1 && abilityLevels[lastRow] < 5 && lastRow !== lastLeveledAbility) {
				abilityToLevel = lastRow;
			}
			// Fallback: if all abilities were just leveled, level first priority regardless
			else if (firstRow !== -1 && abilityLevels[firstRow] < 5) {
				abilityToLevel = firstRow;
			}
			else if (secondRow !== -1 && abilityLevels[secondRow] < 5) {
				abilityToLevel = secondRow;
			}
			else if (lastRow !== -1 && abilityLevels[lastRow] < 5) {
				abilityToLevel = lastRow;
			}
			
			// Level the chosen ability
			if (abilityToLevel !== -1) {
				abilityLevels[abilityToLevel]++;
				lastLeveledAbility = abilityToLevel;
			}
			
			// Fill all ability levels for this champion level (carry forward current values)
			for (let row = 0; row < 4; row++) {
				matrix[row][level] = abilityLevels[row];
			}
		}

		// Update global ability matrix with the entire matrix at once
		await manager.setAbilityMatrix(matrix);
		
		// Update individual ability levels based on current champion level
		const currentLevel = manager.getCurrentChampionLevel();
		const columnIndex = currentLevel - 1; // Convert level 1-18 to column 0-17
		
		// Read ability levels from the matrix for the current champion level
		const qLevel = matrix[0][columnIndex];
		const wLevel = matrix[1][columnIndex];
		const eLevel = matrix[2][columnIndex];
		const rLevel = matrix[3][columnIndex];
		
		// Update global settings with the ability levels
		await manager.setCurrentQLevel(qLevel);
		await manager.setCurrentWLevel(wLevel);
		await manager.setCurrentELevel(eLevel);
		await manager.setCurrentRLevel(rLevel);
	}
}

/**
 * Settings for {@link RotateChampion}.
 */
type RotateChampionSettings = {
	selectedChampion?: string;
};
