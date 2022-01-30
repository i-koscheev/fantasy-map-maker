import { DrawingWorkplace } from "./DrawingWorkplace.js";

import { Toolkit } from "./Toolkit.js";

/**
 * Класс для редактирования карты
 */
export class Editor
{
	/**
	 * Пространство для рисования
	 * @type {DrawingWorkplace}
	 */
	#workplace;

	/**
	 * Инструменты
	 * 
	 */
	#toolkit;

	/**
	 * Редактор карты
	 * 
	 * @param {HTMLCanvasElement} canvas Холст для рисования
	 * @param {HTMLElement} tools Панель инструментов
	 * @param {HTMLSelectElement} zoom Элемент масштабирования
	 */
	constructor( canvas, tools, zoom )
	{		
		this.#toolkit = new Toolkit();

		this.#workplace = new DrawingWorkplace(	canvas, zoom );
	}

	/** Завершение работы */
	shutdown()
	{
		this.#workplace.shutdown();
		this.#toolkit.shutdown();
	}

	/** 
	 * Новая карта
	 * 
	 * @param {number} width Ширина
	 * @param {number} height Высота
	 */
	newMap( width, height )
	{
		this.#workplace.init( width, height );
		this.#toolkit.init();
	}
}