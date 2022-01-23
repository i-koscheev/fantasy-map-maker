/**
 * Растровое представление карты (аналог ImageData)
 */
export class MapData
{
	/**
	 * Одномерный массив с цифровыми кодами каждого пикселя
	 * @type {Uint8Array}
	 */
	#data;

	/**
	 * Ширина карты
	 * @type {number}
	 */
	#width;

	/**
	 * Высота карты
	 * @type {number}
	 */
	#height;
	
	/**
	 * @param {number} width
	 * @param {number} height
	 */
	constructor( width, height )
	{
		this.#width = width;
		this.#height = height;
		this.#data = new Uint8Array( width * height );
	}

	/**
	 * Возвращает одномерный массив с кодами пикселей
	 */
	get data()
	{
		return this.#data;
	}

	/**
	 * Возвращает ширину карты в пискелях
	 */
	get width()
	{
		return this.#width;
	}

	/**
	 * Возвращает высоту карты в пикселях
	 */
	get height()
	{
		return this.#height;
	}
}
