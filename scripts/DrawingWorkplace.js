/**
 * Масштабируемый холст для рисования
 */
export class DrawingWorkplace
{
	/**
	 * Холст
	 * @type {HTMLCanvasElement}
	 */
	#canvas;

	/**
	 * Контекст
	 * @type {CanvasRenderingContext2D}
	 */
	#context;

	/**
	 * Элемент для выбора масштаба
	 * @type {HTMLSelectElement}
	 */
	#selector;

	/**
	 * Масштаб
	 * @type {number}
	 */
	#scale = 1;
	
	/**
	 * Ширина в пикселях в масштабе 1
	 * @type {number}
	 */
	#width;

	/**
	 * Высота в пикселях в масштабе 1
	 * @type {number}
	 */
	#height;
	
	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {number} width
	 * @param {number} height
	 * @param {HTMLSelectElement} selector
	 */
	constructor( canvas, width, height, selector )
	{
		this.#canvas = canvas;
		const context = canvas.getContext( "2d" );
		if ( !context )
		{
			throw new Error( "No 2d context" );
		}
		this.#context = context;
		context.imageSmoothingEnabled = false;

		this.#selector = selector;
		this.#scale = Number( selector.value );

		this.#width = width;
		this.#height = height;
		canvas.width = width * this.#scale;
		canvas.height = height * this.#scale;
		
		console.log(selector);
		selector.disabled = false;
		selector.addEventListener( "input", this.#rescale.bind(this) );
	}

	/**
	 * Холст
	 * @type {HTMLCanvasElement}
	 */
	get canvas()
	{
		return this.#canvas;
	}

	/**
	 * Контекст для рисования
	 * @type {CanvasRenderingContext2D}
	 */
	get context()
	{
		return this.#context;
	}

	// get width()
	// {
	// 	return this.#width;
	// }

	// get height()
	// {
	// 	return this.#height;
	// }

	/**
	 * Изменение масштаба
	 */
	#rescale()
	{
		this.#scale = Number( this.#selector.value );
		const w = this.#width * this.#scale;
		const h = this.#height * this.#scale;
		if ( this.#canvas.width !== w || this.#canvas.height !== h)
		{
			// console.log(this.#context.getImageData(15,15,20,20));
			this.#canvas.width = w;
			// console.log(this.#context.getImageData(15,15,20,20));
			this.#canvas.height = h;
			// console.log(this.#context.getImageData(15,15,20,20));
			this.#context.scale(w, h);
			// console.log(this.#context.getImageData(15,15,20,20));
		}
	}
}
