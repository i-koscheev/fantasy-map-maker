import { Biomes, BiomeView, Palette } from "./Biomes.js";

import { STYLES } from "./Styles.js";

/**
 * Инструменты
 * @enum {number}
 */
 const Tools = {
	CURSOR: 0,
	BRUSH: 1,
	ERASER: 2,
	STYLE: 3,
};

/**
 * Панель инструментов
 */
export class Toolkit
{
	/**
	 * Выбранный инструмент
	 * @type {number}
	 */
	#checked;

	/**
	 * Кисть
	 * @type {HTMLInputElement}
	 */
	#brush;

	/**
	 * Размер кисти
	 * @type {number}
	 */
	#brushSize;

	/**
	 * Элемент с названием кисти
	 * @type {HTMLElement}
	 */
	#brushTitle;

	/**
	 * Выбранный тип территории
	 * @type {number}
	 */
	#biome;

	/**
	 * Ластик
	 * @type {HTMLInputElement}
	 */
	#eraser;

	/**
	 * Размер ластика
	 * @type {number}
	 */
	#eraserSize;

	/**
	 * Инструмент изменения стиля
	 * @type {HTMLInputElement}
	 */
	#style;
	
	/**
	 * "Индекс выбранного стиль"
	 * @type {number}
	 */
	#paletteIndex;

	/**
	 * Элемент с названием стиля
	 * @type {HTMLElement}
	 */
	#styleTitle;


	/**
	 * Контроллер прерываний
	 * @type {AbortController}
	 */
	#controller;

	#tools;

	/**
	 * Панель инструментов
	 * 
	 */
	constructor( )
	{
		this.#tools = document.getElementsByName( "tool" );

		// .getElementsByClassName("setting");
	}
	
	/** Ининциализация */
	init()
	{	
		this.#controller = new AbortController();

		for ( let tool of this.#tools )
		{
			tool.addEventListener(
				"change",
				( event ) => { this.#handleChange( event ); },
				{
					signal: this.#controller.signal,
				},
			);
		}
	}

	/** Завершение работы */
	shutdown()
	{
		this.#controller.abort();
	}

	/**
	 * Выбирает инструмент
	 * @param {string} value
	 */
	#selectTool( name )
	{
		switch ( name )
		{
			case "brush":
				this.#checked = Tools.BRUSH;
				break;
			
			case "eraser":
				this.#checked = Tools.ERASER;
				break;

			case "style":
				this.#checked = Tools.STYLE;
				break;
				
			case "cursor":
				this.#checked = Tools.CURSOR;
				break;
			
			default:
				throw new Error( `Unknown tool "${name}"` );
		}

	}
	
	
	/**
	 * Обработчик выбора инструмента
	 * 
	 * @param {Event} event
	 */
	#handleChange( event )
	{
		const target = event.currentTarget;
		if ( target.name !== "tool" )
		{
			return;
		}
		this.#selectTool( target.value );
	}
	
}
