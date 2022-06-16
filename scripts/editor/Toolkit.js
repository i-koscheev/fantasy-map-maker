import { Biomes, rusName, biomeName, BiomeView, Palette, BIOMES_COUNT } from "../assets/Biomes.js";

import { STYLES, SVG_NS } from "../assets/Styles.js";

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

const MAX_PAINT_SIZE = 500;

/**
 * Панель инструментов
 */
export class Toolkit
{
	/**
	 * Выбранный инструмент
	 * @type {number}
	 */
	#checked = Tools.CURSOR;

	/** 
	 * Инструменты 
	 * @type {NodeListOf<HTMLInputElement>}
	 */
	#tools;

	/**
	 * Настройки кисти
	 * @type {HTMLElement}
	 */
	#brushSettings;

	/**
	 * Элемент с названием кисти
	 * @type {HTMLElement}
	 */
	#brushTitle;

	/**
	 * Размер кисти
	 * @type {number}
	 */
	#brushSize = 30;
	
	/**
	 * Выбранный тип территории
	 * @type {number}
	 */
	#biome = 1;

	/**
	 * Настройки ластика
	 * @type {HTMLElement}
	 */
	#eraserSettings;

	/**
	 * Размер ластика
	 * @type {number}
	 */
	#eraserSize = 60;

	/**
	 * Настройки стиля
	 * @type {HTMLElement}
	 */
	 #styleSettings;
	
	/**
	 * "Индекс выбранного стиля"
	 * @type {number}
	 */
	#paletteIndex = 0;

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

	/**
	 * Действие при выборе кисти или ластика
	 * @type {() => void}
	 */
	onStartPainting = () => {};

	/**
	 * Действие при прекращении рисования
	 * @type {() => void}
	 */
	onStopPainting = () => {};

	/**
	 * Действие при смене размера кисти или ластика
	 * @type {() => void}
	 */
	onPaintSizeChange = () => {};

	/**
	 * Действие при изменении стиля
	 * @type {() => void}
	 */
	onStyleChange = () => {};

	/**
	 * Панель инструментов
	 * 
	 */
	constructor( )
	{
		//инструменты
		this.#tools = document.getElementsByName( "tool" );
		
		// создаём настройки для каждого инструмента
		this.#createSettings();
	}
	
	/** 
	 * Ининциализация
	 * @param {number} [styleIndex] Номер выбранного стиля из набора STYLES
	 */
	init( styleIndex = 0 )
	{	
		this.#controller = new AbortController();

		if ( 0 <= styleIndex && styleIndex < STYLES.length )
		{
			this.#paletteIndex = styleIndex;
		}
		else
		{
			this.#paletteIndex = 0;
		}

		for ( let tool of this.#tools )
		{
			tool.addEventListener(
				"change",
				( event ) => { this.#handleChange( event ); },
				{
					signal: this.#controller.signal,
				},
			);
			if ( tool.checked )
				this.#selectTool( tool.value );
		}
	}

	/** Завершение работы */
	shutdown()
	{
		this.#hideSettings();
		this.#controller.abort();
	}

	/**
	 * Выбранный биом
	 * @returns {Biomes | null} 
	 */
	get biome()
	{
		switch ( this.#checked )
		{
			case Tools.BRUSH:
				return ( this.#biome );
			
			case Tools.ERASER:
				return Biomes.NONE;

			default:
				return null;
		}
	}

	/**
	 * Размер инструмента рисования
	 * @returns {number | null} 
	 */
	get paintSize()
	{
		switch ( this.#checked )
		{
			case Tools.BRUSH:
				return this.#brushSize;
			
			case Tools.ERASER:
				return this.#eraserSize;

			default:
				return null;
		}
	}

	/**
	 * Номер текущего стиля из набора STYLES
	 * @returns {Biomes | null} 
	 */
	get styleIndex()
	{
		return this.#paletteIndex;
	}


	/**
	 * Выбирает инструмент
	 * @param {string} value
	 */
	#selectTool( name )
	{
		this.#stopPainting();
		switch ( name )
		{
			case "brush":
				this.#selectBrush();
				break;
			
			case "eraser":
				this.#selectEraser();
				break;

			case "style":
				this.#selectStyle();
				break;
				
			case "cursor":
				this.#selectCursor();
				break;
			
			default:
				throw new Error( `Unknown tool "${name}"` );
		}
	}
	
	#selectBrush( )
	{
		this.#brushSettings.style.display = "flex";
		this.#eraserSettings.style.display = "none";
		this.#styleSettings.style.display = "none";
		this.#checked = Tools.BRUSH;
		this.onStartPainting();
	}

	#selectEraser( )
	{
		this.#brushSettings.style.display = "none";
		this.#eraserSettings.style.display = "flex";
		this.#styleSettings.style.display = "none";
		this.#checked = Tools.ERASER;
		this.onStartPainting();
	}
	
	#selectStyle( )
	{
		this.#brushSettings.style.display = "none";
		this.#eraserSettings.style.display = "none";
		this.#styleSettings.style.display = "flex";
		this.#checked = Tools.STYLE;
	}

	#selectCursor( )
	{
		this.#hideSettings();
		this.#checked = Tools.CURSOR;
	}

	#stopPainting()
	{
		if ( this.#checked === Tools.ERASER || this.#checked === Tools.BRUSH )
			this.onStopPainting();
	}

	#hideSettings()
	{
		this.#brushSettings.style.display = "none";
		this.#eraserSettings.style.display = "none";
		this.#styleSettings.style.display = "none";
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
	
	/**
	 * Обработчик изменения параметра толщины
	 * @param {Event} event
	 */
	#handleSizeInput( event )
	{
		const target = event.currentTarget;
		switch ( target.id )
		{
			case "brush-size":
				this.#brushSize = getNumber( target );
				break;
			
			case "eraser-size":
				this.#eraserSize = getNumber( target );;
				break;
		
			default:
				return;
		}
		this.onPaintSizeChange();
	}

	/**
	 * Обработчик изменения стиля
	 * 
	 * @param {Event} event
	 */
	#handleStyleChange( event )
	{
		const target = event.currentTarget;
		if ( target.name !== "style" )
		{
			return;
		}

		if ( !this.#controller.signal.aborted )
		{
			this.#paletteIndex = Number( target.value );
			this.#styleTitle.innerText = STYLES[ this.#paletteIndex ].rusName;
			this.#changeBrushColorsView();
			this.onStyleChange();
		}
		
	}

	/**
	 * Обработчик изменения цвета кисти
	 * 
	 * @param {Event} event
	 */
	#handleColorChange( event )
	{
		const target = event.currentTarget;
		if ( target.name !== "color" )
		{
			return;
		}

		if ( !this.#controller.signal.aborted )
		{
			this.#biome = Number( target.value );
			this.#brushTitle.innerText = rusName( this.#biome );
			//перезапускаем рисование
			this.onStopPainting();
			this.onStartPainting();
		}	
	}

	/** Изменяет отображение цветов для кисти */
	#changeBrushColorsView()
	{
		const labels = this.#brushSettings.querySelectorAll( "input + label.color" );

		for ( let label of labels )
		{
			const i = Number( label.previousSibling.value );

			const svg = label.firstChild;
			const rect = svg.firstChild;
			rect.removeAttribute( "fill" );

			const biome = STYLES[ (this.#paletteIndex) ].biome( i );
			const fill = biome.color.toHex();
			rect.setAttribute( "fill", fill );
			
			const use = rect.nextSibling;
			if ( !!use )
				use.remove();
			
			if ( biome.hasPattern )
			{
				const newUse = document.createElementNS( SVG_NS, "use");
				newUse.setAttribute( "x", "-25%" );
				newUse.setAttribute( "y", "-25%" );
				newUse.setAttribute( "width", "150%" );
				newUse.setAttribute( "height", "150%" );
				const href = `images/patterns/${ STYLES[this.#paletteIndex].name }.svg#${ biomeName( i ) }`;
				newUse.setAttribute( "href", href );
				svg.append( newUse );
			}
		}
	}

	/** Создаёт настройки инструментов */
	#createSettings()
	{
		//после подписей к элементам
		const labels = document.querySelectorAll( "label.tool" );
		
		for ( let label of labels )
		{
			switch ( label.htmlFor )
			{
				case "brush":
					this.#createBrushSettings( label );
					break;
				
				case "eraser":
					this.#createEraserSettings( label );
					break;
	
				case "style":
					this.#createStyleSettings( label );
					break;
					
				case "cursor":
				default:
					break;
			}
		}
	}

	/** Cоздаёт настройки ластика */
	#createEraserSettings( labelBefore )
	{
		const settings = document.createElement( "div" );
		settings.classList.add( "settings", "row" );

		//элемент для установки размера
		const input = document.createElement( "input" );
		input.classList.add( "field" );
		input.setAttribute( "type", "number" );
		input.setAttribute( "id", "eraser-size" );
		input.setAttribute( "min", "1" );
		input.setAttribute( "max", MAX_PAINT_SIZE );
		input.setAttribute( "value", this.#eraserSize );

		const label = document.createElement( "label" );
		label.append( "Размер" );
		label.setAttribute( "for", "eraser-size" )

		input.addEventListener(
			"input",
			( event ) => { this.#handleSizeInput( event ); }
		);
		input.addEventListener(
			'blur',
			( event ) => { event.currentTarget.value = this.#eraserSize; },
		);

		settings.append( label, input );
		labelBefore.after( settings );

		this.#eraserSettings = settings;
	}

	/** Cоздаёт настройки для стиля */
	#createStyleSettings( labelBefore )
	{
		const settings = document.createElement( "div" );
		settings.classList.add( "settings", "column" );

		const p = document.createElement( "p" );
		
		this.#styleTitle = document.createElement( "span" );
		this.#styleTitle.classList.add( "title" );
		p.append( "Набор: ", this.#styleTitle );
		this.#styleTitle.append( STYLES[0].rusName );

		//палитра с отображением стилей
		const ul = document.createElement( "ul" );
		ul.classList.add( "palette_two", "none-list" );

		for ( let i = 0; i < STYLES.length; i++ )
		{
			const li = document.createElement( "li" );
			
			//скрытый радио-переключатель
			const input = document.createElement( "input" );
			input.classList.add( "none-radio" );
			input.setAttribute( "type", "radio" );
			input.setAttribute( "name", "style" );
			input.setAttribute( "id", STYLES[i].name );
			input.setAttribute( "value", i );
			if ( i === 0 )
			{
				input.setAttribute( "checked", "" );
			}
			
			//подпись к нему
			const label = document.createElement( "label" );
			label.classList.add( "color" );
			label.setAttribute( "for", STYLES[i].name );
			label.setAttribute( "title", STYLES[i].rusName );

			//содержит svg-изображение
			const svg = document.createElementNS( SVG_NS, "svg");
			svg.classList.add( "color__icon" );
			svg.setAttribute( "role", "presentation" );
			svg.setAttribute( "width", "20" );
			svg.setAttribute( "height", "20" );
			const rect = document.createElementNS( SVG_NS, "rect");
			rect.setAttribute( "width", "100%" );
			rect.setAttribute( "height", "100%" );
			svg.append( rect );

			const biome = STYLES[i].data[Biomes.FOREST];
			const fill = biome.color.toHex();
			rect.setAttribute( "fill", fill );
			
			if ( biome.hasPattern )
			{
				const use = document.createElementNS( SVG_NS, "use");
				use.setAttribute( "x", "-25%" );
				use.setAttribute( "y", "-25%" );
				use.setAttribute( "width", "150%" );
				use.setAttribute( "height", "150%" );
				const href = `images/patterns/${STYLES[i].name}.svg#forest`;
				use.setAttribute( "href", href );
				svg.append( use );
			}
			label.append( svg );
			 
			li.append( input, label );
			ul.append( li );

			input.addEventListener(
				"change",
				( event ) => { this.#handleStyleChange( event ); },
			);
		}
		
		settings.append( p, ul );
		labelBefore.after( settings );
		this.#styleSettings = settings;
	}

	/** Cоздаёт настройки кисти */
	#createBrushSettings( labelBefore )
	{
		const settings = document.createElement( "div" );
		settings.classList.add( "settings", "column" );

		const div = document.createElement( "div" );
		div.classList.add( "row" );

		//элемент для установки размера
		const input = document.createElement( "input" );
		input.classList.add( "field" );
		input.setAttribute( "type", "number" );
		input.setAttribute( "id", "brush-size" );
		input.setAttribute( "min", "1" );
		input.setAttribute( "max", MAX_PAINT_SIZE );
		input.setAttribute( "value", this.#brushSize );

		const label = document.createElement( "label" );
		label.append( "Размер" );
		label.setAttribute( "for", "brush-size" )

		input.addEventListener(
			"input",
			( event ) => { this.#handleSizeInput( event ); }
		);
		input.addEventListener(
			'blur',
			( event ) => { event.currentTarget.value = this.#brushSize; },
		);

		div.append( label, input );
		settings.append( div )

		const p = document.createElement( "p" );
		this.#brushTitle = document.createElement( "span" );
		this.#brushTitle.classList.add( "title" );
		p.append( "Тип территории: ", this.#brushTitle );
		this.#brushTitle.append( rusName( 1 ) );

		//палитра с отображением биомов
		const ul = document.createElement( "ul" );
		ul.classList.add( "palette_three", "none-list" );

		for ( let i = 1; i <= BIOMES_COUNT; i++ )
		{
			const li = document.createElement( "li" );

			const input = document.createElement( "input" );
			input.classList.add( "none-radio" );
			input.setAttribute( "type", "radio" );
			input.setAttribute( "name", "color" );
			input.setAttribute( "id", biomeName( i ) );
			input.setAttribute( "value", i );
			if ( i === 1 )
			{
				input.setAttribute( "checked", "" );
			}
			
			const label = document.createElement( "label" );
			label.classList.add( "color" );
			label.setAttribute( "for", biomeName( i ) );
			label.setAttribute( "title", rusName( i ) );

			const svg = document.createElementNS( SVG_NS, "svg");
			svg.classList.add( "color__icon" );
			svg.setAttribute( "role", "presentation" );
			svg.setAttribute( "width", "20" );
			svg.setAttribute( "height", "20" );
			const rect = document.createElementNS( SVG_NS, "rect");
			rect.setAttribute( "width", "100%" );
			rect.setAttribute( "height", "100%" );
			svg.append( rect );

			const biome = ( STYLES[this.#paletteIndex].biome( i ) );
			const fill = biome.color.toHex();
			rect.setAttribute( "fill", fill );
			
			if ( biome.hasPattern )
			{
				const use = document.createElementNS( SVG_NS, "use");
				use.setAttribute( "x", "-25%" );
				use.setAttribute( "y", "-25%" );
				use.setAttribute( "width", "150%" );
				use.setAttribute( "height", "150%" );
				const href = `images/patterns/${ STYLES[this.#paletteIndex].name }.svg#${ biomeName( i ) }`;
				use.setAttribute( "href", href );
				svg.append( use );
			}
			label.append( svg );
			 
			li.append( input, label );
			ul.append( li );

			input.addEventListener(
				"change",
				( event ) => { this.#handleColorChange( event ); },
			);
		}
		
		settings.append( p, ul );
		labelBefore.after( settings );
		this.#brushSettings = settings;
	}

}



/**
 * Возвращает число из поля ввода в пределах диапазана
 * 
 * @param {HTMLInputElement} input
 */
function getNumber( input )
{
	return Math.min(
		Math.max(
			input.min,
			input.value
		),
		input.max
	);
}