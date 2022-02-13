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
	 * Прокручиваемый контейнер
	 * @type {HTMLElement}
	 */
	#wrapper;

	/**
	 * Координата мыши
	 * @type {number}
	 */
	#mouseX = 0;

	/**
	 * Координата мыши
	 * @type {number}
	 */
	#mouseY = 0;

	/**
	 * Действие при изменении размера
	 * @type {() => void}
	 */
	onRescale = () => {};

	#rescaleBound;
	
	#minusScaleBound;
		
	#plusScaleBound;
	
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

		//прокручиваемый контейнер для рабочего пространства
		this.#wrapper = canvas.closest( ".scrollable" );
		this.#wrapper.addEventListener(
			"mousemove",
			( event ) => { this.#handleMouseMove( event ); },
		)
		this.#wrapper.addEventListener(
			"mouseleave",
			( ) => { this.#handleMouseLeave(); },
		)

		//события
		document.addEventListener(
			"wheel",
			( event ) => { this.#handleWheel( event ); },
			{ capture: true, passive: false }
		)
		this.#rescaleBound = this.#rescale.bind( this );
		this.#minusScaleBound = this.#minusScale.bind( this );
		this.#plusScaleBound = this.#plusScale.bind( this );

		//кнопки для изменения масштаба
		this.#minusButton = this.#selector.previousElementSibling;
		if ( !!this.#minusButton )
		{
			this.#minusButton.addEventListener( "click", this.#minusScaleBound );
		}
		this.#plusButton = this.#selector.nextElementSibling;
		if ( !!this.#plusButton )
		{
			this.#plusButton.addEventListener( "click", this.#plusScaleBound );
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
		
		const el = this.#wrapper;
		el.scrollTop = Math.floor( ( el.scrollHeight - el.clientHeight ) / 2 );
		el.scrollLeft = Math.floor( ( el.scrollWidth - el.clientWidth ) / 2 );

		//настраиваем работу селектора масштаба
		this.#selector.addEventListener( "input", this.#rescaleBound );
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
		this.#selector.removeEventListener( "input", this.#rescaleBound );
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
	#rescale()
	{
		this.#scale = Number( this.#selector.value );
		const w = this.#width * this.#scale;
		const h = this.#height * this.#scale;
		if ( this.#canvas.width !== w || this.#canvas.height !== h)
		{
			const el = this.#wrapper;
			let a = ( this.#mouseX - el.offsetLeft ) / el.clientWidth;
			a = ( a < 0 || a > 1 ) ? 0.5 : a;
			let b = ( this.#mouseY - el.offsetTop ) / el.clientHeight;
			b = ( b < 0 || b > 1 ) ? 0.5 : b;
			const xRatio = ( el.scrollLeft + el.clientWidth * a ) / el.scrollWidth;
			const yRatio = ( el.scrollTop + el.clientHeight * b ) / el.scrollHeight;
			
			this.#canvas.width = w;
			this.#canvas.height = h;		
			this.#context.scale( this.#scale, this.#scale );
			this.onRescale();
			
			el.scrollLeft = Math.floor( xRatio * el.scrollWidth - el.clientWidth * a );
			el.scrollTop = Math.floor( yRatio * el.scrollHeight - el.clientHeight * b );
		}
	}

	/**
	 * Увеличение выбранного масштаба
	 */
	#plusScale()
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
	#minusScale()
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

	/**
	 * Обрабатывает масштабирование через колесо мыши + ctrl
	 * @param {WheelEvent} event 
	 */
	#handleWheel( event )
	{
		if ( event.ctrlKey )
		{
			event.preventDefault();

			if ( !this.#selector.disabled )
			{
				if ( event.deltaY > 0 )
				{
					this.#minusScale();
				}
				else
				{
					this.#plusScale();
				}
			}
		}
	}

	/**
	 * Обрабатывает изменение положения мыши 
	 * @param {MouseEvent} event 
	 */
	#handleMouseMove( event )
	{
		this.#mouseX = event.clientX;
		this.#mouseY = event.clientY;
	} 
	
	/** Обрабатывает изменение положения мыши */
	#handleMouseLeave()
	{
		this.#mouseX = 0;
		this.#mouseY = 0;
	} 
	 
}