import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

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
		
		// Set default item if none selected
		if (!settings.selectedItemId) {
			settings.selectedItemId = "abyssal_mask";
			settings.selectedItemImg = "8020";
			await ev.action.setSettings(settings);
		}

		// Set the image for the selected item
		if (settings.selectedItemImg) {
			await ev.action.setImage(`imgs/items/${settings.selectedItemImg}.png`);
		}
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed.
	 * Toggles to the next item in the configured list.
	 */
	override async onKeyDown(ev: KeyDownEvent<ToggleItemSettings>): Promise<void> {
		const settings = ev.payload.settings;
		
		// If no items list is configured, just toggle the active state
		if (!settings.itemsList || settings.itemsList.length === 0) {
			settings.isActive = !settings.isActive;
			await ev.action.setSettings(settings);
			await ev.action.setState(settings.isActive ? 1 : 0);
			return;
		}

		// Find current item index and cycle to next
		const currentIndex = settings.itemsList.findIndex(
			item => item.id === settings.selectedItemId
		);
		
		const nextIndex = (currentIndex + 1) % settings.itemsList.length;
		const nextItem = settings.itemsList[nextIndex];

		// Update settings with new item
		settings.selectedItemId = nextItem.id;
		settings.selectedItemImg = nextItem.img;
		settings.selectedItemName = nextItem.name;

		await ev.action.setSettings(settings);
		await ev.action.setImage(`imgs/items/${nextItem.img}.png`);
		await ev.action.setTitle(nextItem.name);
	}
}

/**
 * Settings for {@link ToggleItem}.
 */
type ToggleItemSettings = {
	selectedItemId?: string;
	selectedItemImg?: string;
	selectedItemName?: string;
	itemsList?: Array<{
		id: string;
		name: string;
		img: string;
	}>;
	isActive?: boolean;
};
