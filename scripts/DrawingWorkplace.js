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
	 * Действие при изменении размера
	 * @type {() => void}
	 */
	onRescale = () => {};
	
	/**
	 * Масштабируемый холст для рисования
	 * 
	 * @param {HTMLCanvasElement} canvas Холст
	 * @param {HTMLSelectElement} selector Элемент для изменения масштаба
	 */
	constructor( canvas, selector )
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

		this.rescale = this.rescale.bind( this );
		this.minusScale = this.minusScale.bind( this );
		this.plusScale = this.plusScale.bind( this );

		//кнопки для изменения масштаба
		this.#minusButton = this.#selector.previousElementSibling;
		if ( !!this.#minusButton )
		{
			this.#minusButton.addEventListener( "click", this.minusScale );
		}
		this.#plusButton = this.#selector.nextElementSibling;
		if ( !!this.#plusButton )
		{
			this.#plusButton.addEventListener( "click", this.plusScale );
		}
	}

	/** Инициализация
	 * 
	 * @param {number} width Ширина
	 * @param {number} height Высота
	 */
	init( width, height )
	{
		this.#scale = Number( this.#selector.value );
		//устанавливаем изначальные размеры
		this.#width = width;
		this.#height = height;
		this.#canvas.width = width * this.#scale;
		this.#canvas.height = height * this.#scale;
		this.#context.scale( this.#scale, this.#scale );

		//настраиваем работу селектора масштаба
		this.#selector.addEventListener( "input", this.rescale );
		this.#selector.disabled = false;
		if ( !!this.#minusButton )
		{	
			this.#minusButton.disabled = false;
		}
		if ( !!this.#plusButton )
		{	
			this.#plusButton.disabled = false;	
		}
	}

	/** Завершение работы */
	shutdown()
	{
		this.clear();
		this.#selector.disabled = true;
		this.#selector.removeEventListener( "input", this.rescale );
		if ( !!this.#minusButton )
		{
			this.#minusButton.disabled = true;
		}
		if ( !!this.#plusButton )
		{
			this.#plusButton.disabled = true;
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

	/** Масштаб */
	get scale()
	{
		return this.#scale;
	}

	/**
	 * Очистка холста
	 */
	clear()
	{
		this.#context.save();
		this.#context.setTransform(1, 0, 0, 1, 0, 0);
		this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		this.#context.restore();
	}

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
			this.#context.scale( this.#scale, this.#scale );
			this.onRescale();
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