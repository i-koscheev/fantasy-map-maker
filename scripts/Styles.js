import { Biomes, BiomeView, Palette } from "./Biomes.js";

import { Color } from "./Color.js";

/**
 * Стандартная цветовая схема
 * @type {BiomeView[]}
 */
const DEFAULT_PALETTE = [
	{
		biome: Biomes.NONE,
		color: new Color( 235, 235, 235 ),
	},
	{
		biome: Biomes.WATER,
		color: new Color( 142, 194, 255 ),
	},
	{
		biome: Biomes.LAND,
		color: new Color( 191, 246, 147 ),
	},
	{
		biome: Biomes.MOUNTAINS,
		color: new Color( 206, 178, 125 ),
		hasPattern: true,
	},
	{
		biome: Biomes.FOREST,
		color: new Color( 137, 238, 120 ),
		hasPattern: true,
	},
	{
		biome: Biomes.SWAMP,
		color: new Color( 140, 227, 186 ),
		hasPattern: true,
	},
	{
		biome: Biomes.DESERT,
		color: new Color( 255, 239, 155 ),
	},
	{
		biome: Biomes.SNOW,
		color: new Color( 255, 255, 255 ),
	},
	{
		biome: Biomes.HILLS,
		color: new Color( 231, 227, 133 ),
		hasPattern: true,
	},
]

/**
 * Доступные стили
 * @type {Palette[]}
 */
export const STYLES = [
	new Palette(
		"default",
		"стандартный",
		DEFAULT_PALETTE,
	),
]