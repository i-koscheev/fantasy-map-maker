/**
 * Рабочее пространство с масштабируемым холстом для рисования
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
	 * Кнопка для приближения
	 * @type {HTMLButtonElement}
	 */
	#plusButton;

	/**
	 * Кнопка для уменьшения масштаба
	 * @type {HTMLButtonElement}
	 */
	#minusButton;
	
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
	 * Холст для рисования с заданными шириной и высотой
	 * и элементом управления для изменения масштаба
	 * 
	 * @param {HTMLCanvasElement} canvas
	 * @param {number} width
	 * @param {number} height
	 * @param {HTMLSelectElement} selector
	 */
	constructor( canvas, width, height, selector )
	{
		//холст и контекст рисования
		this.#canvas = canvas;
		const context = canvas.getContext( "2d" );
		if ( !context )
		{
			throw new Error( "No 2d context" );
		}
		this.#context = context;
		context.imageSmoothingEnabled = false;

		//изначальный масштаб
		this.#selector = selector;
		this.#scale = Number( selector.value );

		//устанавливаем изначальные размеры
		this.#width = width;
		this.#height = height;
		this.#canvas.width = width * this.#scale;
		this.#canvas.height = height * this.#scale;
		
		//настраиваем работу селектора масштаба
		this.rescale = this.rescale.bind( this );
		this.#selector.addEventListener( "input", this.rescale );
		this.#selector.disabled = false;
		
		//кнопки для изменения масштаба
		this.#minusButton = this.#selector.previousElementSibling;
		this.#plusButton = this.#selector.nextElementSibling;
		if ( this.#minusButton instanceof HTMLButtonElement )
		{
			this.#minusButton.disabled = false;
			this.minusScale = this.minusScale.bind( this );
			this.#minusButton.addEventListener( "click", this.minusScale );
		}
		if ( this.#plusButton instanceof HTMLButtonElement )
		{
			this.#plusButton.disabled = false;
			this.plusScale = this.plusScale.bind( this );
			this.#plusButton.addEventListener( "click", this.plusScale );
		}
	}

	/** Завершение работы */
	shutdown()
	{
		this.#selector.disabled = true;
		this.#selector.removeEventListener( "input", this.rescale );
		if ( this.#minusButton instanceof HTMLButtonElement )
		{
			this.#minusButton.disabled = true;
			this.#minusButton.removeEventListener( "click", this.minusScale );
		}
		if ( this.#plusButton instanceof HTMLButtonElement )
		{
			this.#plusButton.disabled = true;
			this.#plusButton.removeEventListener( "click", this.plusScale );
		}
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
	rescale()
	{
		this.#scale = Number( this.#selector.value );
		const w = this.#width * this.#scale;
		const h = this.#height * this.#scale;
		if ( this.#canvas.width !== w || this.#canvas.height !== h)
		{	
			this.#canvas.width = w;
			this.#canvas.height = h;
			this.#context.scale( w, h );
		}
	}

	/**
	 * Увеличение выбранного масштаба
	 */
	plusScale()
	{
		this.#selector.focus();
		let index = this.#selector.selectedIndex;
		if ( index < this.#selector.length - 1 )
		{
			this.#selector.selectedIndex = index + 1;
			const event = new Event( "input" );
			this.#selector.dispatchEvent( event );
		}
	}

	/**
	 * Уменьшение выбранного масштаба
	 */
	minusScale()
	{
		this.#selector.focus();
		let index = this.#selector.selectedIndex;
		if ( 0 < index )
		{
			this.#selector.selectedIndex = index - 1;
			const event = new Event( "input" );
			this.#selector.dispatchEvent( event );
		}
	}

}