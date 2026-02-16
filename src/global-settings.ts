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
	ability_matrix?: number[][];
	current_basic_haste?: number;
	current_ultimate_haste?: number;
	current_mastery_haste?: number;
	has_cd_shard?: boolean;
	has_axiom_arcanist?: boolean;
	has_transcendence?: boolean;
	has_legend_haste?: boolean;
	cd_shard_bonus?: number;
	cd_legend_bonus?: number;
	cd_transcendence_bonus?: number;
	current_legend_stack?: number;
	total_legend_stack?: number;
	current_takedowns?: number;
	current_champion?: string;
	current_champion_level?: number;
	current_q_level?: number;
	current_w_level?: number;
	current_e_level?: number;
	current_r_level?: number;
	current_q_cooldown?: number;
	current_w_cooldown?: number;
	current_e_cooldown?: number;
	current_r_cooldown?: number;
	reduced_q_cooldown?: number;
	reduced_w_cooldown?: number;
	reduced_e_cooldown?: number;
	reduced_r_cooldown?: number;
	latest_ability_leveled?: string;
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

		// Initialize default ability matrix if not exists (4 rows x 18 columns)
		if (!this.settings.ability_matrix) {
			this.settings.ability_matrix = this.createEmptyAbilityMatrix(4, 18);
			await this.saveSettings();
		}

		// Initialize default haste values if not exists
		if (this.settings.current_basic_haste === undefined) {
			this.settings.current_basic_haste = 0;
		}
		if (this.settings.current_ultimate_haste === undefined) {
			this.settings.current_ultimate_haste = 0;
		}
		if (this.settings.current_mastery_haste === undefined) {
			this.settings.current_mastery_haste = 0;
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

		// Initialize default bonus values if not exists
		let bonusValuesNeedSave = false;
		if (this.settings.cd_shard_bonus === undefined) {
			this.settings.cd_shard_bonus = 8;
			bonusValuesNeedSave = true;
		}
		if (this.settings.cd_legend_bonus === undefined) {
			this.settings.cd_legend_bonus = 0;
			bonusValuesNeedSave = true;
		}
		if (this.settings.cd_transcendence_bonus === undefined) {
			this.settings.cd_transcendence_bonus = 0;
			bonusValuesNeedSave = true;
		}
		if (this.settings.current_legend_stacks === undefined) {
			this.settings.current_legend_stacks = 0;
			bonusValuesNeedSave = true;
		}
		if (this.settings.total_legend_stack === undefined) {
			this.settings.total_legend_stack = 0;
			bonusValuesNeedSave = true;
		}
		if (this.settings.current_takedowns === undefined) {
			this.settings.current_takedowns = 0;
			bonusValuesNeedSave = true;
		}

		// Save if any values were initialized
		if (bonusValuesNeedSave) {
			await this.saveSettings();
		}

		// Initialize default champion level if not exists
		if (this.settings.current_champion_level === undefined) {
			this.settings.current_champion_level = 1;
		}

		// Initialize default ability levels if not exists
		if (this.settings.current_q_level === undefined) {
			this.settings.current_q_level = 0;
		}
		if (this.settings.current_w_level === undefined) {
			this.settings.current_w_level = 0;
		}
		if (this.settings.current_e_level === undefined) {
			this.settings.current_e_level = 0;
		}
		if (this.settings.current_r_level === undefined) {
			this.settings.current_r_level = 0;
		}

		// Initialize default ability cooldowns if not exists
		if (this.settings.current_q_cooldown === undefined) {
			this.settings.current_q_cooldown = 0;
		}
		if (this.settings.current_w_cooldown === undefined) {
			this.settings.current_w_cooldown = 0;
		}
		if (this.settings.current_e_cooldown === undefined) {
			this.settings.current_e_cooldown = 0;
		}
		if (this.settings.current_r_cooldown === undefined) {
			this.settings.current_r_cooldown = 0;
		}

		// Initialize default reduced ability cooldowns if not exists
		if (this.settings.reduced_q_cooldown === undefined) {
			this.settings.reduced_q_cooldown = 0;
		}
		if (this.settings.reduced_w_cooldown === undefined) {
			this.settings.reduced_w_cooldown = 0;
		}
		if (this.settings.reduced_e_cooldown === undefined) {
			this.settings.reduced_e_cooldown = 0;
		}
		if (this.settings.reduced_r_cooldown === undefined) {
			this.settings.reduced_r_cooldown = 0;
		}

		// Initialize latest ability leveled if not exists
		if (this.settings.latest_ability_leveled === undefined) {
			this.settings.latest_ability_leveled = "";
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
	 * Creates an empty ability matrix (4 rows x 18 columns).
	 */
	private createEmptyAbilityMatrix(rows: number, columns: number): number[][] {
		return Array.from({ length: rows }, () => Array(columns).fill(0));
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
	 * Gets the ability matrix.
	 */
	getAbilityMatrix(): number[][] {
		return this.settings.ability_matrix || this.createEmptyAbilityMatrix(4, 18);
	}

	/**
	 * Sets the entire ability matrix.
	 * @param matrix A 4x18 matrix to set
	 */
	async setAbilityMatrix(matrix: number[][]): Promise<void> {
		if (matrix.length === 4 && matrix.every(row => row.length === 18)) {
			this.settings.ability_matrix = matrix;
			await this.saveSettings();
		} else {
			console.error('Invalid ability matrix dimensions. Expected 4x18.');
		}
	}

	/**
	 * Gets a value from the ability matrix at a specific position.
	 * @param row Row index (0-3): 0=Q, 1=W, 2=E, 3=R
	 * @param column Column index (0-17): champion level - 1
	 */
	getAbilityMatrixValue(row: number, column: number): number {
		const matrix = this.getAbilityMatrix();
		if (row >= 0 && row < matrix.length && column >= 0 && column < matrix[row].length) {
			return matrix[row][column];
		}
		return 0;
	}

	/**
	 * Sets a value in the ability matrix at a specific position.
	 * @param row Row index (0-3): 0=Q, 1=W, 2=E, 3=R
	 * @param column Column index (0-17): champion level - 1
	 * @param value Value to set (ability level)
	 */
	async setAbilityMatrixValue(row: number, column: number, value: number): Promise<void> {
		const matrix = this.getAbilityMatrix();
		
		if (row >= 0 && row < matrix.length && column >= 0 && column < matrix[row].length) {
			matrix[row][column] = value;
			this.settings.ability_matrix = matrix;
			await this.saveSettings();
		}
	}

	/**
	 * Clears a value in the ability matrix at a specific position.
	 * @param row Row index (0-3): 0=Q, 1=W, 2=E, 3=R
	 * @param column Column index (0-17): champion level - 1
	 */
	async clearAbilityMatrixValue(row: number, column: number): Promise<void> {
		await this.setAbilityMatrixValue(row, column, 0);
	}

	/**
	 * Resets the entire ability matrix to empty.
	 */
	async resetAbilityMatrix(): Promise<void> {
		this.settings.ability_matrix = this.createEmptyAbilityMatrix(4, 18);
		await this.saveSettings();
	}

	/**
	 * Saves the current settings to global settings and notifies all listeners.
	 */
	private async saveSettings(): Promise<void> {
		await streamDeck.settings.setGlobalSettings(this.settings);
		// Request settings to trigger onDidReceiveGlobalSettings for all listening actions
		await streamDeck.settings.getGlobalSettings();
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
	 * Gets the current mastery haste value.
	 */
	getCurrentMasteryHaste(): number {
		return this.settings.current_mastery_haste ?? 0;
	}

	/**
	 * Sets the current mastery haste value.
	 */
	async setCurrentMasteryHaste(value: number): Promise<void> {
		this.settings.current_mastery_haste = value;
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
	 * Gets the CD Shard bonus value.
	 */
	getCdShardBonus(): number {
		return this.settings.cd_shard_bonus ?? 8;
	}

	/**
	 * Sets the CD Shard bonus value.
	 */
	async setCdShardBonus(value: number): Promise<void> {
		this.settings.cd_shard_bonus = value;
		await this.saveSettings();
	}

	/**
	 * Gets the CD Legend bonus value.
	 */
	getCdLegendBonus(): number {
		return this.settings.cd_legend_bonus ?? 0;
	}

	/**
	 * Sets the CD Legend bonus value.
	 */
	async setCdLegendBonus(value: number): Promise<void> {
		this.settings.cd_legend_bonus = value;
		await this.saveSettings();
	}

	/**
	 * Gets the CD Transcendence bonus value.
	 */
	getCdTranscendenceBonus(): number {
		return this.settings.cd_transcendence_bonus ?? 0;
	}

	/**
	 * Sets the CD Transcendence bonus value.
	 */
	async setCdTranscendenceBonus(value: number): Promise<void> {
		this.settings.cd_transcendence_bonus = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current legend stacks value.
	 */
	getCurrentLegendStack(): number {
		return this.settings.current_legend_stack ?? 0;
	}

	/**
	 * Sets the current legend stacks value.
	 */
	async setCurrentLegendStack(value: number): Promise<void> {
		this.settings.current_legend_stack = value;
		await this.saveSettings();
	}

	/**
	 * Gets the total legend stacks value.
	 */
	getTotalLegendStack(): number {
		return this.settings.total_legend_stack ?? 0;
	}

	/**
	 * Sets the total legend stacks value.
	 */
	async setTotalLegendStack(value: number): Promise<void> {
		this.settings.total_legend_stack = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current takedowns value.
	 */
	getCurrentTakedowns(): number {
		return this.settings.current_takedowns ?? 0;
	}

	/**
	 * Sets the current takedowns value.
	 */
	async setCurrentTakedowns(value: number): Promise<void> {
		this.settings.current_takedowns = value;
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

	/**
	 * Gets the current champion level.
	 */
	getCurrentChampionLevel(): number {
		const level = this.settings.current_champion_level ?? 1;
		// Ensure it's a number (property inspector may store as string)
		return typeof level === 'string' ? parseInt(level, 10) : level;
	}

	/**
	 * Sets the current champion level.
	 */
	async setCurrentChampionLevel(value: number | string): Promise<void> {
		// Ensure it's stored as a number
		this.settings.current_champion_level = typeof value === 'string' ? parseInt(value, 10) : value;
		await this.saveSettings();
	}

	/**
	 * Gets the current Q ability level.
	 */
	getCurrentQLevel(): number {
		return this.settings.current_q_level ?? 0;
	}

	/**
	 * Sets the current Q ability level.
	 */
	async setCurrentQLevel(value: number): Promise<void> {
		this.settings.current_q_level = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current W ability level.
	 */
	getCurrentWLevel(): number {
		return this.settings.current_w_level ?? 0;
	}

	/**
	 * Sets the current W ability level.
	 */
	async setCurrentWLevel(value: number): Promise<void> {
		this.settings.current_w_level = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current E ability level.
	 */
	getCurrentELevel(): number {
		return this.settings.current_e_level ?? 0;
	}

	/**
	 * Sets the current E ability level.
	 */
	async setCurrentELevel(value: number): Promise<void> {
		this.settings.current_e_level = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current R ability level.
	 */
	getCurrentRLevel(): number {
		return this.settings.current_r_level ?? 0;
	}

	/**
	 * Sets the current R ability level.
	 */
	async setCurrentRLevel(value: number): Promise<void> {
		this.settings.current_r_level = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current Q ability cooldown.
	 */
	getCurrentQCooldown(): number {
		return this.settings.current_q_cooldown ?? 0;
	}

	/**
	 * Sets the current Q ability cooldown.
	 */
	async setCurrentQCooldown(value: number): Promise<void> {
		this.settings.current_q_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current W ability cooldown.
	 */
	getCurrentWCooldown(): number {
		return this.settings.current_w_cooldown ?? 0;
	}

	/**
	 * Sets the current W ability cooldown.
	 */
	async setCurrentWCooldown(value: number): Promise<void> {
		this.settings.current_w_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current E ability cooldown.
	 */
	getCurrentECooldown(): number {
		return this.settings.current_e_cooldown ?? 0;
	}

	/**
	 * Sets the current E ability cooldown.
	 */
	async setCurrentECooldown(value: number): Promise<void> {
		this.settings.current_e_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the current R ability cooldown.
	 */
	getCurrentRCooldown(): number {
		return this.settings.current_r_cooldown ?? 0;
	}

	/**
	 * Sets the current R ability cooldown.
	 */
	async setCurrentRCooldown(value: number): Promise<void> {
		this.settings.current_r_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the reduced Q ability cooldown.
	 */
	getReducedQCooldown(): number {
		return this.settings.reduced_q_cooldown ?? 0;
	}

	/**
	 * Sets the reduced Q ability cooldown.
	 */
	async setReducedQCooldown(value: number): Promise<void> {
		this.settings.reduced_q_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the reduced W ability cooldown.
	 */
	getReducedWCooldown(): number {
		return this.settings.reduced_w_cooldown ?? 0;
	}

	/**
	 * Sets the reduced W ability cooldown.
	 */
	async setReducedWCooldown(value: number): Promise<void> {
		this.settings.reduced_w_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the reduced E ability cooldown.
	 */
	getReducedECooldown(): number {
		return this.settings.reduced_e_cooldown ?? 0;
	}

	/**
	 * Sets the reduced E ability cooldown.
	 */
	async setReducedECooldown(value: number): Promise<void> {
		this.settings.reduced_e_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the reduced R ability cooldown.
	 */
	getReducedRCooldown(): number {
		return this.settings.reduced_r_cooldown ?? 0;
	}

	/**
	 * Sets the reduced R ability cooldown.
	 */
	async setReducedRCooldown(value: number): Promise<void> {
		this.settings.reduced_r_cooldown = value;
		await this.saveSettings();
	}

	/**
	 * Gets the latest ability that was leveled.
	 */
	getLatestAbilityLeveled(): string {
		return this.settings.latest_ability_leveled ?? "";
	}

	/**
	 * Sets the latest ability that was leveled.
	 */
	async setLatestAbilityLeveled(value: string): Promise<void> {
		this.settings.latest_ability_leveled = value;
		await this.saveSettings();
	}
}
