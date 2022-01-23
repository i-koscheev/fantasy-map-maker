import { Color } from "./Color.js";

/**
 * Биомы – типы территорий на карте
 * @enum {number}
 */
export const Biomes = {
	/** Пусто */
	NONE: 0,

	/** Вода */
	WATER: 1,

	/** Земля */
	LAND: 2,

	/** Горы */
	MOUNTAINS: 3,

	/** Леса */
	FOREST: 4,

	/** Болота */
	SWAMP: 5,

	/** Пустыни */
	DESERT: 6,

	/** Снега */
	SNOW: 7,

	/** Холмы */
	HILLS: 8,

	/** Лава */
	LAVA: 9,

	/** Мёртвые земли */
	DEAD: 10,
};

/**
 * Задаёт отображение для конкретного типа территории
 */
export class BiomeView
{
	/**
	 * Код территории
	 * @type {number}
	 * */
	biome;

	/**
	 * Цвет территории на карте
	 * @type {Color}
	 * */
	color;

	/**
	 * Цвет при рисовании (если отличается от обычного)
	 * @type {Color | null}
	 * */
	drawingСolor = null;

	/**
	 * Цвет для границы (если отличается от обычного)
	 * @type {Color | null}
	 * */
	borderСolor = null;

	/**
	 * Узор на карте, если такой имеется
	 * @type {string | null}
	 * */
	pattern = null;
}

/**
 * Стандартная цветовая схема
 * @type {BiomeView[]}
 * */
const DEFAULT_PALETTE = [
	{
		biome: Biomes.NONE,
		color = new Color( 235, 235, 235 ),
		pattern = null,
	},
	{
		biome: Biomes.WATER,
		color = new Color( 142, 194, 255 ),
		pattern = null,
	},
	{
		biome: Biomes.LAND,
		color = new Color( 191, 246, 147 ),
		pattern = null,
	},
	{
		biome: Biomes.MOUNTAINS,
		color = new Color( 206, 178, 125 ),
		pattern = "../images/sets/default/mountains.svg",
	},
	{
		biome: Biomes.FOREST,
		color = new Color( 137, 238, 120 ),
		pattern = "../images/sets/default/forest.svg",
	},
	{
		biome: Biomes.SWAMP,
		color = new Color( 140, 227, 186 ),
		pattern = "../images/sets/default/swamp.svg",
	},
	{
		biome: Biomes.DESERT,
		color = new Color( 255, 239, 155 ),
		pattern = null,
	},
	{
		biome: Biomes.SNOW,
		color = new Color( 255, 255, 255 ),
		pattern = null,
	},
	{
		biome: Biomes.HILLS,
		color = new Color( 231, 227, 133 ),
		pattern = "../images/sets/default/hills.svg",
	},
	{
		biome: Biomes.LAVA,
		color = new Color( 248, 112, 54 ),
		pattern = null,
	},
	{
		biome: Biomes.DEAD,
		color = new Color( 149, 140, 138 ),
		pattern = null,
	},
]

/**
 * Палитра цветов и изображений для отображения территорий
 */
export class Palette
{
	/**
	 * Название палитры
	 * @type {string}
	 */
	#name;
	
	/**
	 * Массив элементов палитры
	 * @type {BiomeView[]}
	 * */
	#data = DEFAULT_PALETTE;

	/**
	 * @param {string} name
	 * @param {BiomeView[]} [array]
	 */
	constructor( name, array )
	{
		this.#name = name;
		if ( array )
		{
			this.#data = array;
		}
	}

	/**
	 * Возвращает название палитры
	 */
	get name()
	{
		return this.#name;
	}

	/**
	 * Возвращает массив элементов палитры
	 */
	get data()
	{
		return this.#data;
	}
	 
}
