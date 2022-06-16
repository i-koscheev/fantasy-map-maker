/**
 * Задaёт целочисленные размеры элемента
 */
export class SizeSetter
{
	/**
	 * Элемент формы
	 * @type {HTMLFormElement}
	 */
	#form;
	
	/**
	 * Поле ввода для изменения ширины
	 * @type {HTMLInputElement}
	 */
	#inputWidth;

	/**
	 * Поле ввода для изменения высоты
	 * @type {HTMLInputElement}
	 */
	#inputHeight;

	/**
	 * Ширина
	 * @type {number}
	 */
	#width;

	/**
	 * Высота
	 * @type {number}
	 */
	#height;

	/**
	 * Элемент, размеры которого изменяем
	 * @type {HTMLElement}
	 */
	#element;

	/**
	 * Прокручиваемый контейнер
	 * @type {HTMLElement}
	 */
	#wrapper;

	/**
	 * Действие после задания размеров
	 * @type {() => void}
	 */
	onSubmit;

	/** @type {( event: InputEvent ) => void} */
	#resizeWidthBound;

	/** @type {( event: InputEvent ) => void} */
	 #resizeHeightBound;

	/**
	 * Форма, устанавливающая размеры элемента
	 * 
	 * @param {HTMLFormElement} form
	 * @param {HTMLElement} element
	 */
	constructor( form, element )
	{
		this.#form = form;
		this.#element = element;
		this.#wrapper = element.closest( ".scrollable" );

		this.#form.addEventListener(
			'submit',
			( event ) => { event.preventDefault(); },
		);
		
		this.#inputWidth = this.#getFormInput( "width" );
		this.#inputHeight = this.#getFormInput( "height" );
		
		this.#inputWidth.addEventListener(
			'blur',
			( ) => { this.#inputWidth.value = this.#width; },
		);
		this.#inputHeight.addEventListener(
			'blur',
			( ) => { this.#inputHeight.value = this.#height; },
		);

		this.#resizeWidthBound = this.#resizeWidth.bind( this );
		this.#resizeHeightBound = this.#resizeHeight.bind( this );
	}

	/** Инициализация */
	init()
	{
		this.onSubmit = () => {};
		this.#initWidth();
		this.#initHeight();
		this.#initForm();
	}

	/** Прекращение работы */
	shutdown()
	{
		this.#inputWidth.removeEventListener(
			"input",
			this.#resizeWidthBound
		);
		this.#inputHeight.removeEventListener(
			"input",
			this.#resizeHeightBound
		);
		this.#inputWidth.disabled = true;
		this.#inputHeight.disabled = true;
	}

	/**
	 * Ширина элемента
	 * @type {number}
	 */
	get width() 
	{
		return this.#width;
	}

	/**
	 * Высота элемента
	 * @type {number}
	 */
	get height() 
	{
		return this.#height;
	}

	/**
	 * Возвращает поле ввода формы по его имени
	 * @param {string} name
	 */
	#getFormInput( name )
	{
		const input = this.#form.elements.namedItem( name );
		
		if ( !input || !( input instanceof HTMLInputElement ) )
		{
			throw new Error( `Can't find element "${name}"` );
		}
		
		return input;
	}

	/** Обрабатывает изменение ширины */
	#resizeWidth()
	{
		this.#width = getInt( this.#inputWidth );
		this.#element.width = this.#width;
		this.#scrollingX();
	}

	/** Инициализация поля ввода ширины */
	#initWidth()
	{
		this.#inputWidth.value = this.#inputWidth.defaultValue;
		this.#inputWidth.disabled = false;
		this.#width = Number( this.#inputWidth.defaultValue );
		this.#element.width = this.#width;
		
		this.#scrollingX();

		this.#inputWidth.addEventListener(
			"input",
			this.#resizeWidthBound
		);
	}

	/** Обрабатывает изменение высоты */
	#resizeHeight()
	{
		this.#height = getInt( this.#inputHeight );
		this.#element.height = this.#height;
		this.#scrollingY();
	}

	/** Инициализация поля ввода высоты */
	#initHeight()
	{
		this.#inputHeight.value = this.#inputHeight.defaultValue;
		this.#inputHeight.disabled = false;
		this.#height = Number( this.#inputHeight.defaultValue );
		this.#element.height = this.#height;
		
		this.#scrollingY();
		
		this.#inputHeight.addEventListener(
			"input",
			this.#resizeHeightBound
		);
	}

	/** Инициализация формы */
	#initForm()
	{
		this.#form.addEventListener(
			'submit',
			( ) => {
				//отменяем возможность дальнейшего изменения, чтобы зафиксировать значения
				this.shutdown();
				this.onSubmit();
			},
			{ once: true }
		);
	}

	/** Горизонтальная прокрутка  */
	#scrollingX()
	{
		this.#wrapper.scrollLeft = Math.floor( 
			( this.#wrapper.scrollWidth - this.#wrapper.clientWidth ) / 2
		);
	}

	/** Вертикальная прокрутка  */
	#scrollingY()
	{
		this.#wrapper.scrollTop = Math.floor( 
			( this.#wrapper.scrollHeight - this.#wrapper.clientHeight ) / 2
		);
	}
}

/**
 * Возвращает целое значение из поля ввода (в пределах диапазана) 
 * 
 * @param {HTMLInputElement} input
 */
function getInt( input )
{
	return Math.round(
		Math.min(
			Math.max(
				input.min,
				input.value
			),
			input.max
		)
	);
}
