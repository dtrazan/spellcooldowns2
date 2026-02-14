import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import masteryData from "../../com.dt.spellcooldowns2.sdPlugin/champion/mastery.json";
import { GlobalSettingsManager } from "../global-settings";

// Cache for masteries loaded from mastery.json
const masteryCache: MasteryData[] = masteryData as MasteryData[];

/**
 * Represents a mastery item.
 */
interface MasteryData {
	id: string;
	name: string;
	ability_haste: string;
	basic_haste: string;
	ultimate_haste: string;
	img: string;
}

/**
 * Load masteries from mastery.json file
 */
function loadMasteriesFromJson(): MasteryData[] {
	return masteryCache;
}

/**
 * An action that allows cycling through and setting mastery values.
 */
@action({ UUID: "com.dt.spellcooldowns2.setmastery" })
export class SetMastery extends SingletonAction<SetMasterySettings> {
	/**
	 * Helper method to get the current state of a mastery from global settings.
	 */
	private getMasteryState(masteryId: string): boolean {
		const manager = GlobalSettingsManager.getInstance();
		switch (masteryId) {
			case 'cd_shard':
				return manager.getHasCdShard();
			case 'axiom_arcanist':
				return manager.getHasAxiomArcanist();
			case 'transcendence':
				return manager.getHasTranscendence();
			case 'legend_haste':
				return manager.getHasLegendHaste();
			default:
				return false;
		}
	}

	/**
	 * Helper method to update the action image based on mastery state.
	 */
	private async updateMasteryImage(action: any, masteryId: string, masteryImg: string): Promise<void> {
		const isActive = this.getMasteryState(masteryId);
		const imageFolder = isActive ? 'mastery' : 'off';
		await action.setImage(`imgs/${imageFolder}/${masteryImg}`);
	}

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<SetMasterySettings>): Promise<void> {
		const settings = ev.payload.settings;
		const masteries = loadMasteriesFromJson();
		
		// Parse selected mastery if set from property inspector
		if (settings.selectedMastery) {
			try {
				const masteryData = JSON.parse(settings.selectedMastery);
				
				settings.selectedMasteryId = masteryData.id;
				settings.selectedMasteryName = masteryData.name;
				settings.selectedMasteryImg = masteryData.img;
			} catch (e) {
				console.error('Failed to parse selected mastery:', e);
			}
		}
		
		// Set default mastery if not set
		if (!settings.selectedMasteryId && masteries.length > 0) {
			settings.currentIndex = 0;
			settings.selectedMasteryId = masteries[0].id;
			settings.selectedMasteryName = masteries[0].name;
			settings.selectedMasteryImg = masteries[0].img;
		}

		// Save updated settings
		await ev.action.setSettings(settings);

		// Set the image for the selected mastery based on global state
		if (settings.selectedMasteryImg && settings.selectedMasteryId) {
			await this.updateMasteryImage(ev.action, settings.selectedMasteryId, settings.selectedMasteryImg);
		}

		// Display the mastery name
		await ev.action.setTitle(settings.selectedMasteryName || "");
	}

	/**
	 * Handle settings changes from property inspector
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<SetMasterySettings>): Promise<void> {
		const settings = ev.payload.settings;
		
		// Parse selected mastery from property inspector
		if (settings.selectedMastery) {
			try {
				const masteryData = JSON.parse(settings.selectedMastery);
				
				settings.selectedMasteryId = masteryData.id;
				settings.selectedMasteryName = masteryData.name;
				settings.selectedMasteryImg = masteryData.img;
				
				// Find the index of this mastery
				const masteries = loadMasteriesFromJson();
				settings.currentIndex = masteries.findIndex(m => m.id === masteryData.id);
			} catch (e) {
				console.error('Failed to parse selected mastery:', e);
			}
		}

		// Save updated settings
		await ev.action.setSettings(settings);

		// Update the display with image based on global state
		if (settings.selectedMasteryImg && settings.selectedMasteryId) {
			await this.updateMasteryImage(ev.action, settings.selectedMasteryId, settings.selectedMasteryImg);
		}
		await ev.action.setTitle(settings.selectedMasteryName || "");
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Toggles the global setting for the currently displayed mastery.
	 */
	override async onKeyDown(ev: KeyDownEvent<SetMasterySettings>): Promise<void> {
		const settings = ev.payload.settings;
		const manager = GlobalSettingsManager.getInstance();
		
		// Toggle the appropriate global setting based on the selected mastery
		if (settings.selectedMasteryId) {
			switch (settings.selectedMasteryId) {
				case 'cd_shard':
					const currentCdShard = manager.getHasCdShard();
					await manager.setHasCdShard(!currentCdShard);
					break;
				case 'axiom_arcanist':
					const currentAxiom = manager.getHasAxiomArcanist();
					await manager.setHasAxiomArcanist(!currentAxiom);
					break;
				case 'transcendence':
					const currentTranscendence = manager.getHasTranscendence();
					await manager.setHasTranscendence(!currentTranscendence);
					break;
				case 'legend_haste':
					const currentLegend = manager.getHasLegendHaste();
					await manager.setHasLegendHaste(!currentLegend);
					break;
			}
			
			// Update the image to reflect the new state
			if (settings.selectedMasteryImg) {
				await this.updateMasteryImage(ev.action, settings.selectedMasteryId, settings.selectedMasteryImg);
			}
		}
	}
}

/**
 * Settings for {@link SetMastery}.
 */
type SetMasterySettings = {
	selectedMastery?: string;
	selectedMasteryId?: string;
	selectedMasteryName?: string;
	selectedMasteryImg?: string;
	currentIndex?: number;
};
