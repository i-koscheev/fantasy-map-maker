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
	#scale;

	/**
	 * Масштаб по умолчанию
	 * @type {number}
	 */
	#defaultScale = 1;

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
	 * Высота при рисовании одной линии.
	 * Нужна для холста с масштабом меньшим 1 для непрозрачной отрисовки
	 * @type {number}
	 */
	#lineHeight = 1;

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
		this.#defaultScale = Number( selector.value );
		this.#scale = this.#defaultScale;

		//прокручиваемый контейнер для рабочего пространства
		this.#wrapper = canvas.closest( ".scrollable" );

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
		// this.#scale = Number( this.#selector.value );
		this.#selector.value = `${ this.#scale }`;
		//устанавливаем изначальные размеры
		this.#width = width;
		this.#height = height;
		this.#canvas.width = width * this.#scale;
		this.#canvas.height = height * this.#scale;
		this.#context.scale( this.#scale, this.#scale );
		
		const el = this.#wrapper;
		el.scrollTop = Math.floor( ( el.scrollHeight - el.clientHeight ) / 2 );
		el.scrollLeft = Math.floor( ( el.scrollWidth - el.clientWidth ) / 2 );
		this.#mouseX = 0;
		this.#mouseY = 0;

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
		this.#selector.value = `${ this.#defaultScale }`;
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
	 * Задаёт цвет для рисования
	 * @param {string} colorString
	 */
	set color( colorString )
	{
		this.#context.fillStyle = colorString;
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
	 * Рисует горизонтальную линию
	 * @param {number} x0 
	 * @param {number} x1 
	 * @param {number} y 
	 */
	horizontalLine( x0, x1, y )
	{
		this.#context.fillRect( x0, y, x1-x0, this.#lineHeight );
	}

	/**
	 * Переводит координаты указателя в точку на холсте
	 * @param {number} clientX
	 * @param {number} clientY
	 * @returns {Point}
	 */
	canvasPoint( clientX, clientY )
	{
		const rect = this.#canvas.getBoundingClientRect();
		const x = ( clientX - ( rect.left + window.scrollX ) ) / this.#scale;
		const y = ( clientY - ( rect.top + window.scrollY ) ) / this.#scale;
		return new Point( x, y );
	}

	/**
	 * Изменение масштаба
	 */
	#rescale()
	{
		const newScale = Number( this.#selector.value );
		const w = this.#width * newScale;
		const h = this.#height * newScale;
		if ( this.#canvas.width !== w || this.#canvas.height !== h)
		{
			const el = this.#wrapper;
			if (
				this.#mouseX < el.offsetLeft
				|| this.#mouseY < el.offsetTop
				|| this.#mouseX > el.offsetLeft + el.clientWidth
				|| this.#mouseY > el.offsetTop + el.clientHeight
			) {
				this.#mouseX = el.offsetLeft + el.clientWidth / 2; 
				this.#mouseY = el.offsetTop + el.clientHeight / 2;
			}
			const position = this.canvasPoint( this.#mouseX, this.#mouseY );
			const k = newScale - this.#scale;
			const newLeft = el.scrollLeft + position.x * k;
			const newTop = el.scrollTop + position.y * k;
			
			this.#canvas.width = w;
			this.#canvas.height = h;		
			this.#context.scale( newScale, newScale );
			this.#lineHeight = Math.ceil( 1 / newScale );
			this.#scale = newScale;

			el.scrollLeft = Math.round( newLeft );
			el.scrollTop = Math.round( newTop );

			this.onRescale();
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
				this.#mouseX = event.clientX;
				this.#mouseY = event.clientY;

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
}


/** Точка */
export class Point
{
	/** @type {number} */
	x;
	/** @type {number} */
	y;
	
	/**
	 * @param {number} [x]
	 * @param {number} [y]
	 */
	constructor( x = 0, y = 0 )
	{
		this.x = x;
		this.y = y;
	}
}