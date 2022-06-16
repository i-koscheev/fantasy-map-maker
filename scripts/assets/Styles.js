import { Biomes, BiomeView, Palette } from "./Biomes.js";

import { Color } from "../types/Color.js";

/** Пространство имён SVG */
export const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Стандартная цветовая схема
 * @type {BiomeView[]}
 */
const default_palette = [
	{
		biome: Biomes.NONE,
		color: new Color( 196, 196, 196 ), 
		hasPattern: true,
	},
	{
		biome: Biomes.WATER,
		color: new Color( 76, 179, 253 ), 
		hasPattern: true,
	},
	{
		biome: Biomes.LAND,
		color: new Color( 186, 236, 155 ),
		hasPattern: true,
	},
	{
		biome: Biomes.MOUNTAINS,
		color: new Color( 206, 178, 125 ),
		hasPattern: true,
	},
	{
		biome: Biomes.FOREST,
		color: new Color( 127, 211, 113 ),
		hasPattern: true,
	},
	{
		biome: Biomes.SWAMP,
		color: new Color( 112, 170, 128 ),
		hasPattern: true,
	},
	{
		biome: Biomes.DESERT,
		color: new Color( 255, 240, 159 ),
		hasPattern: true,
	},
	{
		biome: Biomes.SNOW,
		color: new Color( 250, 254, 255 ),
		hasPattern: true,
	},
	{
		biome: Biomes.HILLS,
		color: new Color( 231, 227, 133 ),
		hasPattern: true,
	},
]

const without_icons = [
	{
		biome: Biomes.NONE,
		color: new Color( 196, 196, 196 ), 
		hasPattern: false,
	},
	{
		biome: Biomes.WATER,
		color: new Color( 76, 179, 253 ), 
		hasPattern: false,
	},
	{
		biome: Biomes.LAND,
		color: new Color( 186, 236, 155 ),
		hasPattern: false,
	},
	{
		biome: Biomes.MOUNTAINS,
		color: new Color( 206, 178, 125 ),
		hasPattern: false,
	},
	{
		biome: Biomes.FOREST,
		color: new Color( 127, 211, 113 ),
		hasPattern: false,
	},
	{
		biome: Biomes.SWAMP,
		color: new Color( 112, 170, 128 ),
		hasPattern: false,
	},
	{
		biome: Biomes.DESERT,
		color: new Color( 255, 240, 159 ),
		hasPattern: false,
	},
	{
		biome: Biomes.SNOW,
		color: new Color( 250, 254, 255 ),
		hasPattern: false,
	},
	{
		biome: Biomes.HILLS,
		color: new Color( 231, 227, 133 ),
		hasPattern: false,
	},
]


const parchment = [
	{
		biome: Biomes.NONE,
		color: new Color( 198, 181, 138 ),
		hasPattern: false,
	},
	{
		biome: Biomes.WATER,
		color: new Color( 151, 138, 111 ),

		hasPattern: true,
	},
	{
		biome: Biomes.LAND,
		color: new Color( 225, 199, 114 ),

		hasPattern: true,
	},
	{
		biome: Biomes.MOUNTAINS,
		color: new Color( 185, 148, 60 ),

		hasPattern: true,
	},
	{
		biome: Biomes.FOREST,
		color: new Color( 209, 181, 94 ),

		hasPattern: true,
	},
	{
		biome: Biomes.SWAMP,
		color: new Color( 168, 125, 44 ),

		hasPattern: true,
	},
	{
		biome: Biomes.DESERT,
		color: new Color( 231, 205, 117 ),

		hasPattern: true,
	},
	{
		biome: Biomes.SNOW,
		color: new Color( 237, 225, 200 ),
		hasPattern: true,
	},
	{
		biome: Biomes.HILLS,
		color: new Color( 194, 162, 83 ),

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
		default_palette,
	),
	new Palette(
		"parchment",
		"пергамент",
		parchment,
	),
	new Palette(
		"without",
		"без значков",
		without_icons,
	),
]
