import streamDeck from "@elgato/streamdeck";

/**
 * Represents an item in the grid.
 */
export interface ItemData {
	id: string;
	name: string;
	img: string;
	ability_haste?: string;
	basic_haste?: string;
	ultimate_haste?: string;
	type?: string;
	activated?: boolean;
}

/**
 * Global settings for the plugin, including the 2D array of items.
 */
export interface GlobalSettings extends Record<string, any> {
	itemsGrid?: (ItemData | null)[][];
	gridRows?: number;
	gridColumns?: number;
	current_basic_haste?: number;
	current_ultimate_haste?: number;
	has_cd_shard?: boolean;
	has_axiom_arcanist?: boolean;
	has_transcendence?: boolean;
	has_legend_haste?: boolean;
	current_champion?: string;
}

/**
 * Manager class for handling global settings and the items grid.
 */
export class GlobalSettingsManager {
	private static instance: GlobalSettingsManager;
	private settings: GlobalSettings = {};

	private constructor() {}

	/**
	 * Gets the singleton instance of the GlobalSettingsManager.
	 */
	static getInstance(): GlobalSettingsManager {
		if (!GlobalSettingsManager.instance) {
			GlobalSettingsManager.instance = new GlobalSettingsManager();
		}
		return GlobalSettingsManager.instance;
	}

	/**
	 * Initialize the settings manager and load current global settings.
	 */
	async initialize(): Promise<void> {
		this.settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
		
		// Initialize default grid if not exists
		if (!this.settings.itemsGrid) {
			this.settings.gridRows = 4;
			this.settings.gridColumns = 4;
			this.settings.itemsGrid = this.createEmptyGrid(4, 4);
			await this.saveSettings();
		}

		// Initialize default haste values if not exists
		if (this.settings.current_basic_haste === undefined) {
			this.settings.current_basic_haste = 0;
		}
		if (this.settings.current_ultimate_haste === undefined) {
			this.settings.current_ultimate_haste = 0;
		}

		// Initialize default mastery flags if not exists
		if (this.settings.has_cd_shard === undefined) {
			this.settings.has_cd_shard = false;
		}
		if (this.settings.has_axiom_arcanist === undefined) {
			this.settings.has_axiom_arcanist = false;
		}
		if (this.settings.has_transcendence === undefined) {
			this.settings.has_transcendence = false;
		}
		if (this.settings.has_legend_haste === undefined) {
			this.settings.has_legend_haste = false;
		}

		// Listen for global settings changes
		streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((ev) => {
			this.settings = ev.settings;
		});
	}

	/**
	 * Creates an empty 2D array grid.
	 */
	private createEmptyGrid(rows: number, columns: number): (ItemData | null)[][] {
		return Array.from({ length: rows }, () => Array(columns).fill(null));
	}

	/**
	 * Gets the current items grid.
	 */
	getItemsGrid(): (ItemData | null)[][] {
		return this.settings.itemsGrid || this.createEmptyGrid(4, 4);
	}

	/**
	 * Gets an item at a specific position in the grid.
	 */
	getItemAt(row: number, column: number): ItemData | null {
		const grid = this.getItemsGrid();
		if (row >= 0 && row < grid.length && column >= 0 && column < grid[row].length) {
			return grid[row][column];
		}
		return null;
	}

	/**
	 * Sets an item at a specific position in the grid.
	 */
	async setItemAt(row: number, column: number, item: ItemData | null): Promise<void> {
		const grid = this.getItemsGrid();
		
		// Ensure grid is large enough
		while (grid.length <= row) {
			grid.push(Array(this.settings.gridColumns || 4).fill(null));
		}
		while (grid[row].length <= column) {
			grid[row].push(null);
		}

		grid[row][column] = item;
		this.settings.itemsGrid = grid;
		await this.saveSettings();
	}

	/**
	 * Clears an item at a specific position in the grid.
	 */
	async clearItemAt(row: number, column: number): Promise<void> {
		await this.setItemAt(row, column, null);
	}

	/**
	 * Resizes the grid to new dimensions.
	 */
	async resizeGrid(rows: number, columns: number): Promise<void> {
		const currentGrid = this.getItemsGrid();
		const newGrid = this.createEmptyGrid(rows, columns);

		// Copy existing items to new grid
		for (let r = 0; r < Math.min(currentGrid.length, rows); r++) {
			for (let c = 0; c < Math.min(currentGrid[r].length, columns); c++) {
				newGrid[r][c] = currentGrid[r][c];
			}
		}

		this.settings.gridRows = rows;
		this.settings.gridColumns = columns;
		this.settings.itemsGrid = newGrid;
		await this.saveSettings();
	}

	/**
	 * Gets the grid dimensions.
	 */
	getGridDimensions(): { rows: number; columns: number } {
		return {
			rows: this.settings.gridRows || 4,
			columns: this.settings.gridColumns || 4
		};
	}

	/**
	 * Saves the current settings to global settings.
	 */
	private async saveSettings(): Promise<void> {
		await streamDeck.settings.setGlobalSettings(this.settings);
	}

	/**
	 * Gets all settings.
	 */
	getSettings(): GlobalSettings {
		return { ...this.settings };
	}

	/**
	 * Gets the current basic haste value.
	 */
	getCurrentBasicHaste(): number {
		return this.settings.current_basic_haste ?? 0;
	}

	/**
	 * Sets the current basic haste value.
	 */
	async setCurrentBasicHaste(value: number): Promise<void> {
		this.settings.current_basic_haste = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current ultimate haste value.
	 */
	getCurrentUltimateHaste(): number {
		return this.settings.current_ultimate_haste ?? 0;
	}

	/**
	 * Sets the current ultimate haste value.
	 */
	async setCurrentUltimateHaste(value: number): Promise<void> {
		this.settings.current_ultimate_haste = value;
		await this.saveSettings();
	}

	/**
	 * Gets whether CD Shard mastery is active.
	 */
	getHasCdShard(): boolean {
		return this.settings.has_cd_shard ?? false;
	}

	/**
	 * Sets whether CD Shard mastery is active.
	 */
	async setHasCdShard(value: boolean): Promise<void> {
		this.settings.has_cd_shard = value;
		await this.saveSettings();
	}

	/**
	 * Gets whether Axiom Arcanist mastery is active.
	 */
	getHasAxiomArcanist(): boolean {
		return this.settings.has_axiom_arcanist ?? false;
	}

	/**
	 * Sets whether Axiom Arcanist mastery is active.
	 */
	async setHasAxiomArcanist(value: boolean): Promise<void> {
		this.settings.has_axiom_arcanist = value;
		await this.saveSettings();
	}

	/**
	 * Gets whether Transcendence mastery is active.
	 */
	getHasTranscendence(): boolean {
		return this.settings.has_transcendence ?? false;
	}

	/**
	 * Sets whether Transcendence mastery is active.
	 */
	async setHasTranscendence(value: boolean): Promise<void> {
		this.settings.has_transcendence = value;
		await this.saveSettings();
	}

	/**
	 * Gets whether Legend: Haste mastery is active.
	 */
	getHasLegendHaste(): boolean {
		return this.settings.has_legend_haste ?? false;
	}

	/**
	 * Sets whether Legend: Haste mastery is active.
	 */
	async setHasLegendHaste(value: boolean): Promise<void> {
		this.settings.has_legend_haste = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current champion.
	 */
	getCurrentChampion(): string | undefined {
		return this.settings.current_champion;
	}

	/**
	 * Sets the current champion.
	 */
	async setCurrentChampion(value: string): Promise<void> {
		this.settings.current_champion = value;
		await this.saveSettings();
	}
}
