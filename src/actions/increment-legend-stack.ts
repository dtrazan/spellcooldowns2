import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager, GlobalSettings } from "../global-settings";
import { DisplayHaste } from "./display-haste";

/**
 * An action that increments the legend stacks (max 15).
 */
@action({ UUID: "com.dt.spellcooldowns2.incrementlegendstack" })
export class IncrementLegendStack extends SingletonAction<IncrementLegendStackSettings> {
	private static readonly MAX_STACKS = 10;
	private static readonly HASTE_PER_STACK = 1.5; // Adjust this value based on game mechanics

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<IncrementLegendStackSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const globalStacks = manager.getCurrentLegendStack();
		
		// Sync the property inspector with global settings if not set
		if (ev.payload.settings.legendStacks === undefined) {
			await ev.action.setSettings({ legendStacks: globalStacks });
		}
		
		// Update total legend stack
		await this.updateTotalLegendStack();
		
		// Display the current legend stacks
		await this.updateStackDisplay(ev.action);
		
		// Listen for global settings changes to update display
		streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((globalEv) => {
			this.updateStackDisplay(ev.action);
		});
	}

	/**
	 * Handle settings changes from the property inspector.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<IncrementLegendStackSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const stacksInput = ev.payload.settings.legendStacks;
		
		// Parse stacks as number (property inspector may send it as string)
		const stacks = typeof stacksInput === 'string' ? parseInt(stacksInput, 10) : stacksInput;
		
		if (stacks !== undefined && !isNaN(stacks) && stacks >= 0 && stacks <= IncrementLegendStack.MAX_STACKS) {
			// Update global settings when property inspector changes
			await manager.setCurrentLegendStack(stacks);
			
			// Update cd_legend_bonus based on stacks
			await this.updateLegendBonus(stacks);
			
			// Update total legend stack
			await this.updateTotalLegendStack();
		}
		
		// Update display
		await this.updateStackDisplay(ev.action);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Increments the legend stack count (max 10, then wraps to 0).
	 */
	override async onKeyDown(ev: KeyDownEvent<IncrementLegendStackSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentStacks = manager.getCurrentLegendStack();
		
		// Increment legend stack count, wrapping from MAX_STACKS to 0
		const newStacks = currentStacks >= IncrementLegendStack.MAX_STACKS ? 0 : currentStacks + 1;
		await manager.setCurrentLegendStack(newStacks);
		
		// Update cd_legend_bonus based on stacks
		await this.updateLegendBonus(newStacks);
		
		// Update total legend stack
		await this.updateTotalLegendStack();
		
		// Recalculate haste values (calls DisplayHaste calculation)
		await DisplayHaste.calculateAndUpdateHaste();
		
		// Update the property inspector setting (as number)
		await ev.action.setSettings({ legendStacks: newStacks });
		
		// Update display
		await this.updateStackDisplay(ev.action);
	}

	/**
	 * Updates the cd_legend_bonus based on the number of stacks and recalculates mastery haste.
	 * @param stacks The number of legend stacks (0-15)
	 */
	private async updateLegendBonus(stacks: number): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		
		// Calculate the bonus haste from legend stacks
		const legendBonus = stacks * IncrementLegendStack.HASTE_PER_STACK;
		
		// Get the old legend bonus to calculate the difference
		const oldLegendBonus = manager.getCdLegendBonus();
		
		// Update the cd_legend_bonus
		await manager.setCdLegendBonus(legendBonus);
		
		// Recalculate current_mastery_haste
		let masteryHaste = 0;
		if (manager.getHasCdShard()) {
			masteryHaste += manager.getCdShardBonus();
		}
		if (manager.getHasLegendHaste()) {
			masteryHaste += legendBonus;
		}
		
		// Get old mastery haste
		const oldMasteryHaste = manager.getCurrentMasteryHaste();
		
		// Update current_mastery_haste
		await manager.setCurrentMasteryHaste(masteryHaste);
		
		// Update current_basic_haste and current_ultimate_haste by adjusting for mastery haste change
		const currentBasicHaste = manager.getCurrentBasicHaste();
		const currentUltimateHaste = manager.getCurrentUltimateHaste();
		await manager.setCurrentBasicHaste(currentBasicHaste - oldMasteryHaste + masteryHaste);
		await manager.setCurrentUltimateHaste(currentUltimateHaste - oldMasteryHaste + masteryHaste);
	}

	/**
	 * Updates the total legend stack (current_takedowns + current_legend_stack).
	 */
	private async updateTotalLegendStack(): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentTakedowns = manager.getCurrentTakedowns();
		const currentLegendStack = manager.getCurrentLegendStack();
		const totalLegendStack = currentTakedowns + currentLegendStack;
		await manager.setTotalLegendStack(totalLegendStack);
	}

	/**
	 * Updates the display to show the current legend stacks.
	 */
	private async updateStackDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const stacks = manager.getCurrentLegendStack();
		await action.setTitle(`${stacks}/${IncrementLegendStack.MAX_STACKS}`);
	}
}

/**
 * Settings for {@link IncrementLegendStack}.
 */
type IncrementLegendStackSettings = {
	legendStacks?: number | string; // Property inspector may send as string
};
