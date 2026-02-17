import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager } from "../global-settings";

/**
 * An action that increments the takedown count.
 */
@action({ UUID: "com.dt.spellcooldowns2.incrementtakedown" })
export class IncrementTakedown extends SingletonAction<IncrementTakedownSettings> {
	private static readonly MAX_TAKEDOWNS = 10;

	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 */
	override async onWillAppear(ev: WillAppearEvent<IncrementTakedownSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const globalTakedowns = manager.getCurrentTakedowns();
		
		// Sync the property inspector with global settings if not set
		if (ev.payload.settings.takedownCount === undefined) {
			await ev.action.setSettings({ takedownCount: globalTakedowns });
		}
		
		// Update total legend stack
		await this.updateTotalLegendStack();
		
		// Display the current takedown count
		await this.updateDisplay(ev.action);
	}

	/**
	 * Handle settings changes from the property inspector.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<IncrementTakedownSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const countInput = ev.payload.settings.takedownCount;
		
		// Parse count as number (property inspector may send it as string)
		const count = typeof countInput === 'string' ? parseInt(countInput, 10) : countInput;
		
		if (count !== undefined && !isNaN(count) && count >= 0 && count <= IncrementTakedown.MAX_TAKEDOWNS) {
			// Update global settings when property inspector changes
			await manager.setCurrentTakedowns(count);
			
			// Update total legend stack
			await this.updateTotalLegendStack();
		}
		
		// Update display
		await this.updateDisplay(ev.action);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Increments the takedown count (max 28, then wraps to 0).
	 */
	override async onKeyDown(ev: KeyDownEvent<IncrementTakedownSettings>): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentCount = manager.getCurrentTakedowns();
		
		// Increment takedown count, wrapping from MAX_TAKEDOWNS to 0
		const newCount = currentCount >= IncrementTakedown.MAX_TAKEDOWNS ? 0 : currentCount + 1;
		await manager.setCurrentTakedowns(newCount);
		
		// Update total legend stack
		await this.updateTotalLegendStack();
		
		// Refund ultimate cooldown if Axiom Arcanist is active
		if (manager.getHasAxiomArcanist()) {
			await this.refundUltimateCooldown();
		}
		
		// Refund basic cooldown if Transcendence is active and level 11+
		if (manager.getHasTranscendence() && manager.getCurrentChampionLevel() >= 11) {
			await this.refundBasicCooldown();
		}
		
		// Update the property inspector setting (as number)
		await ev.action.setSettings({ takedownCount: newCount });
		
		// Update display
		await this.updateDisplay(ev.action);
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
	 * Updates the display to show the current takedown count.
	 */
	private async updateDisplay(action: any): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const count = manager.getCurrentTakedowns();
		await action.setTitle(`TD\n${count}`);
	}

	/**
	 * Refunds ultimate cooldown on takedown.
	 */
	private async refundUltimateCooldown(): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const timerREnd = manager.getTimerREnd();
		const currentTime = Date.now();
		
		// Check if ultimate timer is running
		if (timerREnd > currentTime) {
			// Calculate remaining time
			const remainingTime = timerREnd - currentTime;
			
			// Reduce remaining time by 7%
			const refundAmount = remainingTime * 0.07;
			const newRemainingTime = remainingTime - refundAmount;
			
			// Update the timer end timestamp
			const newTimerREnd = currentTime + newRemainingTime;
			await manager.setTimerREnd(newTimerREnd);
		}
	}

	/**
	 * Refunds basic cooldown on takedown.
	 */
	private async refundBasicCooldown(): Promise<void> {
		const manager = GlobalSettingsManager.getInstance();
		const currentTime = Date.now();
		
		// Check Q timer
		const timerQEnd = manager.getTimerQEnd();
		if (timerQEnd > currentTime) {
			const remainingTime = timerQEnd - currentTime;
			const refundAmount = remainingTime * 0.20;
			const newRemainingTime = remainingTime - refundAmount;
			const newTimerQEnd = currentTime + newRemainingTime;
			await manager.setTimerQEnd(newTimerQEnd);
		}
		
		// Check W timer
		const timerWEnd = manager.getTimerWEnd();
		if (timerWEnd > currentTime) {
			const remainingTime = timerWEnd - currentTime;
			const refundAmount = remainingTime * 0.20;
			const newRemainingTime = remainingTime - refundAmount;
			const newTimerWEnd = currentTime + newRemainingTime;
			await manager.setTimerWEnd(newTimerWEnd);
		}
		
		// Check E timer
		const timerEEnd = manager.getTimerEEnd();
		if (timerEEnd > currentTime) {
			const remainingTime = timerEEnd - currentTime;
			const refundAmount = remainingTime * 0.20;
			const newRemainingTime = remainingTime - refundAmount;
			const newTimerEEnd = currentTime + newRemainingTime;
			await manager.setTimerEEnd(newTimerEEnd);
		}
	}
}

/**
 * Settings for {@link IncrementTakedown}.
 */
type IncrementTakedownSettings = {
	takedownCount?: number | string; // Property inspector may send as string
};
