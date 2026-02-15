import { action, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import championData from "../../com.dt.spellcooldowns2.sdPlugin/champion/champion.json";
import { GlobalSettingsManager } from "../global-settings";

// Cache for champions loaded from champion.json
const championCache: ChampionData[] = Object.keys(championData.data).map(key => {
	const champion = championData.data[key as keyof typeof championData.data];
	return {
		id: champion.id,
		name: champion.name,
		title: champion.title,
		image: champion.image.full
	};
});

/**
 * Represents a champion item.
 */
interface ChampionData {
	id: string;
	name: string;
	title: string;
	image: string;
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
				
				// Update the display with the selected champion
				await ev.action.setImage(`imgs/champion/${championData.image}`);
				await ev.action.setTitle(championData.name || "");
			} catch (e) {
				console.error('Failed to parse selected champion:', e);
			}
		}
	}
}

/**
 * Settings for {@link RotateChampion}.
 */
type RotateChampionSettings = {
	selectedChampion?: string;
};
