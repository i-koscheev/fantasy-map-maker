import { Color } from "./Color.js";

/** Количество непустых биомов */
export const BIOMES_COUNT = 8;

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

	/** Лес */
	FOREST: 4,

	/** Болото */
	SWAMP: 5,

	/** Пустыня */
	DESERT: 6,

	/** Снега */
	SNOW: 7,

	/** Холмы */
	HILLS: 8,
};

/**
 * Строковое обозначение территории по её коду
 * @param {number} code Код территории
 * @returns {string}
 */
export function biomeName( code )
{
	switch ( code )
	{
		case Biomes.NONE:
			return "none";
		
		case Biomes.WATER:
			return "water";
		
		case Biomes.LAND:
			return "land";
		
		case Biomes.MOUNTAINS:
			return "mountains";
		
		case Biomes.FOREST:
			return "forest";
		
		case Biomes.SWAMP:
			return "swamp";
		
		case Biomes.DESERT:
			return "desert";
		
		case Biomes.SNOW:
			return "snow";
		
		case Biomes.HILLS:
			return "hills";
		
		default:
			return "";
	}
}

/**
 * Русское название территории по её коду
 * @param {number} code Код территории
 * @returns {string}
 */
export function rusName( code )
{
	switch ( code )
	{
		case Biomes.NONE:
			return "пусто";
		
		case Biomes.WATER:
			return "вода";
		
		case Biomes.LAND:
			return "земля";
		
		case Biomes.MOUNTAINS:
			return "горы";
		
		case Biomes.FOREST:
			return "лес";
		
		case Biomes.SWAMP:
			return "болото";
		
		case Biomes.DESERT:
			return "пустыня";
		
		case Biomes.SNOW:
			return "снега";
		
		case Biomes.HILLS:
			return "холмы";
		
		default:
			return "";
	}
}


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
	 * Имеется ли узор на карте
	 * @type {boolean}
	 * */
	hasPattern = false;
}


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
	 * Русское название
	 * @type {string}
	 */
	#rusName;
	
	/**
	 * Массив элементов палитры
	 * @type {BiomeView[]}
	 * */
	#data;

	/** 
	 * @param {string} name
	 * @param {string} rus
	 * @param {BiomeView[]} array
	 */
	constructor( name, rus, array )
	{
		this.#name = name;
		this.#rusName = rus;
		this.#data = array;
	}

	/**
	 * Название палитры / SVG-файл с узорами
	 */
	get name()
	{
		return this.#name;
	}

	/**
	 * Название палитры на русском
	 */
	get rusName()
	{
		return this.#rusName;
	}

	/**
	 * Массив элементов палитры
	 */
	get data()
	{
		return this.#data;
	}

	/**
	 * Отображение данного биома
	 * @param {Biomes} code код биома
	 * @returns {BiomeView}
	 */
	biome( code )
	{
		if ( this.#data[code].biome === code)
			return ( this.#data[code] );
		else
		{
			for ( let i = 0; i < this.#data.length; i++ )
			{
				if ( this.#data[i].biome === code)
				{
					return ( this.#data[i] );
				}
			}
			return null;
		}
	}
	
}
