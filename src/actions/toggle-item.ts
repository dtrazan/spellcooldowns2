import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettingsManager, ItemData } from "../global-settings";
import itemsData from "../../com.dt.spellcooldowns2.sdPlugin/items.json";

// Cache for items loaded from items.json
const itemsCache: ItemData[] = itemsData as ItemData[];

/**
 * Load items from items.json file
 */
function loadItemsFromJson(): ItemData[] {
	return itemsCache;
}

/**
 * An action that allows toggling between League of Legends items.
 * Displays the selected item's image and cycles through available items on press.
 */
@action({ UUID: "com.dt.spellcooldowns2.toggleitem" })
export class ToggleItem extends SingletonAction<ToggleItemSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible.
	 * We set the item image based on the currently selected item.
	 */
	override async onWillAppear(ev: WillAppearEvent<ToggleItemSettings>): Promise<void> {
		const settings = ev.payload.settings;
		const manager = GlobalSettingsManager.getInstance();
		
		// Use the actual coordinates from the Stream Deck device
		if (settings.currentRow === undefined || settings.currentColumn === undefined) {
			const coordinates = 'coordinates' in ev.payload ? ev.payload.coordinates : undefined;
			settings.currentRow = coordinates?.row ?? 0;
			settings.currentColumn = coordinates?.column ?? 0;
		}

		// Get item from global settings at this row/column
		const itemFromGrid = manager.getItemAt(settings.currentRow ?? 0, settings.currentColumn ?? 0);
		
		// Update settings with item from grid
		if (itemFromGrid) {
			// If item is missing haste properties, load them from items.json
			if (!itemFromGrid.ability_haste || !itemFromGrid.basic_haste || !itemFromGrid.ultimate_haste) {
				const allItems = loadItemsFromJson();
				const fullItem = allItems.find(item => item.id === itemFromGrid.id);
				if (fullItem) {
					// Update the grid with the complete item data
					await manager.setItemAt(settings.currentRow ?? 0, settings.currentColumn ?? 0, {
						...itemFromGrid,
						ability_haste: fullItem.ability_haste,
						basic_haste: fullItem.basic_haste,
						ultimate_haste: fullItem.ultimate_haste,
						type: fullItem.type
					});
				}
			}
			
			settings.selectedItemId = itemFromGrid.id;
			settings.selectedItemImg = itemFromGrid.img;
			settings.selectedItemName = itemFromGrid.name;
			settings.isActive = itemFromGrid.activated || false;
		} else if (!settings.selectedItemId) {
			// Set default item if no item in grid and none selected
			settings.selectedItemId = "abyssal_mask";
			settings.selectedItemImg = "8020";
			settings.selectedItemName = "Abyssal Mask";
			settings.isActive = false;
		}

		// Set default for showName if not set
		if (settings.showName === undefined) {
			settings.showName = true;
		}

		// Save updated settings
		await ev.action.setSettings(settings);

		// Set the image for the selected item based on activated state
		if (settings.selectedItemImg) {
			const imageFolder = settings.isActive ? 'item' : 'deactivated';
			await ev.action.setImage(`imgs/${imageFolder}/${settings.selectedItemImg}.png`);
		}

		// Set title to show row and column position
		await ev.action.setTitle(`${settings.currentRow},${settings.currentColumn}`);

		// Set the visual state based on activated status
		if ('setState' in ev.action) {
			await ev.action.setState(settings.isActive ? 1 : 0);
		}
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Toggles the activated state of the current item.
	 */
	override async onKeyDown(ev: KeyDownEvent<ToggleItemSettings>): Promise<void> {
		const settings = ev.payload.settings;
		const manager = GlobalSettingsManager.getInstance();
		
		// Check if we have a current row/column position
		if (settings.currentRow === undefined || settings.currentColumn === undefined) {
			return;
		}

		// Get the current item from the grid
		const currentItem = manager.getItemAt(settings.currentRow, settings.currentColumn);
		
		if (!currentItem) {
			// No item at this position, nothing to toggle
			return;
		}

		// Toggle the activated state
		currentItem.activated = !currentItem.activated;
		
		// Save back to the grid
		await manager.setItemAt(settings.currentRow, settings.currentColumn, currentItem);
		
		// Update local settings
		settings.isActive = currentItem.activated;
		await ev.action.setSettings(settings);
		
		// Update the image based on activated state
		if (settings.selectedItemImg) {
			const imageFolder = currentItem.activated ? 'item' : 'deactivated';
			await ev.action.setImage(`imgs/${imageFolder}/${settings.selectedItemImg}.png`);
		}
		
		// Update the visual state (0 = off, 1 = on)
		if ('setState' in ev.action) {
			await ev.action.setState(currentItem.activated ? 1 : 0);
		}
	}

	/**
	 * Listens for settings changes from the Property Inspector and updates the display accordingly.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ToggleItemSettings>): Promise<void> {
		const settings = ev.payload.settings;
		const manager = GlobalSettingsManager.getInstance();

		// Handle selectedItem change from Property Inspector (stored as JSON string)
		if (settings.selectedItem) {
			try {
				const item = typeof settings.selectedItem === 'string' 
					? JSON.parse(settings.selectedItem) 
					: settings.selectedItem;
				
				settings.selectedItemId = item.id;
				settings.selectedItemImg = item.img;
				settings.selectedItemName = item.name;
				
				// Save to global grid if row/column are set
				if (settings.currentRow !== undefined && settings.currentColumn !== undefined) {
					// Get current item to preserve activated state
					const currentItem = manager.getItemAt(settings.currentRow, settings.currentColumn);
					const activated = currentItem?.activated || false;
					
					// Load full item data from items.json to get haste values
					const allItems = loadItemsFromJson();
					const fullItem = allItems.find(i => i.id === item.id);
					
					await manager.setItemAt(settings.currentRow, settings.currentColumn, {
						id: item.id,
						name: item.name,
						img: item.img,
						ability_haste: fullItem?.ability_haste,
						basic_haste: fullItem?.basic_haste,
						ultimate_haste: fullItem?.ultimate_haste,
						type: fullItem?.type,
						activated: activated
					});
					
					settings.isActive = activated;
					
					// Update the image based on activated state
					const imageFolder = activated ? 'item' : 'deactivated';
					await ev.action.setImage(`imgs/${imageFolder}/${item.img}.png`);
				} else {
					// If no row/column, just update the image normally
					await ev.action.setImage(`imgs/item/${item.img}.png`);
				}
				
				// Save the parsed values
				await ev.action.setSettings(settings);
			} catch (error) {
				console.error('Failed to parse selectedItem:', error);
			}
		}

		// Update the image if selectedItemImg exists
		if (settings.selectedItemImg) {
			const imageFolder = settings.isActive ? 'item' : 'deactivated';
			await ev.action.setImage(`imgs/${imageFolder}/${settings.selectedItemImg}.png`);
		}

		// Update title to show row and column position
		if (settings.currentRow !== undefined && settings.currentColumn !== undefined) {
			await ev.action.setTitle(`${settings.currentRow},${settings.currentColumn}`);
		}
	}
}

/**
 * Settings for {@link ToggleItem}.
 */
type ToggleItemSettings = {
	currentRow?: number;
	currentColumn?: number;
	selectedItemId?: string;
	selectedItemImg?: string;
	selectedItemName?: string;
	selectedItem?: string | { id: string; name: string; img: string };
	itemsList?: Array<{
		id: string;
		name: string;
		img: string;
	}>;
	isActive?: boolean;
	showName?: boolean;
};
