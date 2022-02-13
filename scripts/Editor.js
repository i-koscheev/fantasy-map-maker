import { DrawingWorkplace } from "./DrawingWorkplace.js";
import { Toolkit, SVG_NS } from "./Toolkit.js";
import { MapData } from "./MapData.js";
import { STYLES } from "./Styles.js";
import { ImageTracer } from "./ImageTracer.js";

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
	 * @type {Toolkit}
	 */
	#toolkit;

	/**
	 * Контейнер, содержащий холст для рисования
	 * @type {HTMLElement}
	 */
	#container;

	/**
	 * Пиксельная карта
	 * @type {MapData}
	 */
	#mapData;

	/**
	 * Текущий цвет
	 * @type {Number}
	 */
	#biome;

	/**
	 * Текущий цвет
	 * @type {String}
	 */
	#drawingColor;

	/**
	 * Режим рисования
	 * @type {boolean}
	 */
	#drawingMode = false;

	/**
	 * Изменился ли холст при рисовании
	 * @type {boolean}
	 */
	#hasChanged = false;

	/**
	 * Указатель для рисования
	 * @type {CircleCursor}
	 */
	#cursor;

	/**
	 * Обёртка для обработки событий мыши
	 * @type {HTMLElement}
	 */
	#wrapper;

	#svg;

	#imageTracer;

	#handleСlickBound;

	#handleMouseMoveBound;

	#handleMouseEnterBound;

	#handleMouseLeaveBound;


	/**
	 * Редактор карты
	 * 
	 * @param {DrawingWorkplace} workplace Пространство для рисования
	 * @param {Toolkit} toolkit Набор инструментов
	 * @parm {HTMLElement} container Родительский блок для холста
	 */
	constructor( workplace, toolkit, container )
	{		
		this.#toolkit = toolkit;
		this.#workplace = workplace;
		this.#container = container;
		this.#wrapper = container.closest( ".clickable" );

		workplace.onRescale = () => { this.#rescale(); };

		toolkit.onStartPainting = () => { this.#startDrawing(); };

		toolkit.onStopPainting = () => { this.#stopDrawing(); };

		toolkit.onStyleChange = () => { this.#changeStyle(); };

		toolkit.onPaintSizeChange = () => {
			this.#cursor.resize( this.#toolkit.paintSize * this.#workplace.scale );
		};
		
		this.#imageTracer = new ImageTracer();

		this.#cursor = new CircleCursor( this.#container );

		this.#handleСlickBound = this.#handleСlick.bind( this );
		this.#handleMouseMoveBound = this.#handleMouseMove.bind( this );
		this.#handleMouseEnterBound = this.#handleMouseEnter.bind( this );
		this.#handleMouseLeaveBound = this.#handleMouseLeave.bind( this );
	}

	/** Завершение работы */
	shutdown()
	{
		this.#workplace.shutdown();
		this.#toolkit.shutdown();
		if ( this.#drawingMode )
		{	
			this.#stopDrawing();
		}
		this.#container.style.background = null;
	}

	/** 
	 * Новая карта
	 * 
	 * @param {number} width Ширина
	 * @param {number} height Высота
	 */
	newMap( width, height )
	{
		this.#mapData = new MapData( width, height );
		this.#mapData.init();

		this.#workplace.init( width, height );
		this.#toolkit.init();

		this.#newSvg();
	}

	/** Начало рисования */
	#startDrawing()
	{	
		// this.#workplace.canvas.style.background = "rgba(0,0,0,0.1)";
		
		this.#biome = this.#toolkit.biome;
		const biomeView = STYLES[ (this.#toolkit.styleIndex) ].biome( this.#biome );
		this.#drawingColor = 
			( !biomeView.drawingСolor )
			? biomeView.color.toHex()
			: biomeView.drawingСolor.toHex();

		this.#drawBiome();
		
		this.#drawingMode = true;
		this.#hasChanged = false;

		this.#cursor.resize( this.#toolkit.paintSize * this.#workplace.scale );
		this.#addMouseEventListeners();
	}

	/** Завершение рисования */
	#stopDrawing()
	{
		this.#drawingMode = false;
		this.#removeMouseEventListeners();
		this.#workplace.clear();
		// this.#workplace.canvas.style.background = null;

		if ( this.#hasChanged )
		{
			this.#newSvg();
		}
	}

	#newSvg()
	{
		this.#svg = this.#imageTracer.mapDataToSVG(
			this.#mapData,
			this.#toolkit.styleIndex,
			this.#workplace.scale
		);
		// console.log( this.#svg );
		
		const bg = window.btoa( this.#svg );
		this.#container.style.background = 'url("data:image/svg+xml; base64, '
			+ bg + '") no-repeat center';
	}

	/** Смена стиля */
	#changeStyle()
	{
		//перерисовка
		this.#newSvg()
	}

	/** Смена масштаба */
	#rescale()
	{
		if ( this.#drawingMode )
		{	
			this.#drawBiome();
			this.#cursor.resize( this.#toolkit.paintSize * this.#workplace.scale );
		}
	}

	/** Переносит на холст все области данной территории c текущей карты */
	#drawBiome()
	{
		this.#workplace.context.fillStyle = this.#drawingColor;
		for ( let y = 0; y < this.#mapData.height; y++ )
		{
			const add = y * this.#mapData.width;
			let start = -1;
			for ( let x = 0; x < this.#mapData.width; x++ )
			{
				if ( this.#mapData.data[add + x] === this.#biome )
				{
					if ( start === -1 )
					{
						//начало линии нужного цвета
						start = x;
					}
				}
				else
				{
					if ( start !== -1 )
					{
						//линия закончилась
						this.#workplace.context.fillRect( start, y, (x - start), 1 );
						start = -1;
					}
				}
			}
			//случай в конце строки
			if ( start !== -1 )
			{
				this.#workplace.context.fillRect( start, y, (this.#mapData.width - start), 1 );
			}
		}
	}

	/** Присоединяет обработчики событий мыши */
	#addMouseEventListeners()
	{
		this.#wrapper.style.cursor = "none";
		this.#wrapper.addEventListener(
			'mouseenter',
			this.#handleMouseEnterBound
		);
		this.#wrapper.addEventListener(
			'mouseleave',
			this.#handleMouseLeaveBound
		);
		this.#wrapper.addEventListener(
			'mousemove',
			this.#handleMouseMoveBound
		);
		this.#wrapper.addEventListener(
			"click",
			this.#handleСlickBound
		);
	}

	/** Убирает обработчики событий мыши */
	#removeMouseEventListeners()
	{
		this.#wrapper.removeEventListener(
			"click",
			this.#handleСlickBound
		);	
		this.#wrapper.removeEventListener(
			'mousemove',
			this.#handleMouseMoveBound
		);
		this.#wrapper.removeEventListener(
			'mouseenter',
			this.#handleMouseEnterBound
		);
		this.#wrapper.removeEventListener(
			'mouseleave',
			this.#handleMouseLeaveBound
		);
		this.#wrapper.style.cursor = "default";
	}

	/**
	 * Обрабатывает наведение указателя
	 * @param {MouseEvent} event
	 */
	#handleMouseEnter( event )
	{
		this.#cursor.move( event.clientX, event.clientY );
		this.#cursor.show();
	}

	/** Исчезновение указателя */
	#handleMouseLeave()
	{
		this.#cursor.hide();
	} 
	
	/**
	 * Обрабатывает перемещение курсора по холсту
	 * @param {MouseEvent} event
	 */
	#handleMouseMove( event )
	{
		this.#cursor.move( event.clientX, event.clientY );
	} 
	
	/**
	 * Обрабатывает клик по холсту
	 * @param {MouseEvent} event
	 */
	#handleСlick( event )
	{
		if ( this.#drawingMode )
		{
			this.#hasChanged = true;

			const rect = this.#workplace.canvas.getBoundingClientRect();
		
			const x = event.clientX - (rect.left + window.scrollX);
			const y = event.clientY - (rect.top + window.scrollY);
			const x0 = x / this.#workplace.scale;
			const y0 = y / this.#workplace.scale;
			
			this.#drawCircle( x0, y0, this.#toolkit.paintSize );
		}
	}

	
	/**
	 * Горизонтальная линия
	 * @param {number} x0 
	 * @param {number} x1 
	 * @param {number} y 
	 */
	#drawHorizontalLine( x0, x1, y )
	{
		if ( 0 <= y && y <= this.#mapData.height )
		{
			const add = y * this.#mapData.width;
			const start = add + Math.max(x0, 0);
			const end = add + Math.min(x1, this.#mapData.width);
	
			for( let i = start; i < end; i++ )
			{
				this.#mapData.data[i] = this.#biome;
			}
			
			this.#workplace.context.fillStyle = this.#drawingColor;
			this.#workplace.context.fillRect( x0, y, x1-x0, 1 );
		}
	}

	/* 
	 * Cм. Midpoint circle algorithm for filled circles
	 * https://stackoverflow.com/questions/10878209/midpoint-circle-algorithm-for-filled-circles
	 */

	/**
	 * Рисует круг на карте
	 * @param {number} x0 координаты центра
	 * @param {number} y0 координаты центра
	 * @param {number} diameter диаметр
	 */
	#drawCircle( x0, y0, diameter )
	{
		let d = Math.round( diameter );
		
		if ( d % 2 === 1 )
		{
			//случай с нечётным диаметром
			let centerX = Math.floor( x0 );
			let centerY = Math.floor( y0 );

			let x = (d - 1) / 2;
			let y = 0;
			let error = 1 - x;
			while ( x >= y )
			{
				let startX = centerX - x;
				let endX = centerX + x + 1;
				this.#drawHorizontalLine( startX, endX, centerY - y );
				if ( y !== 0 )
				{
					this.#drawHorizontalLine( startX, endX, centerY + y );
				}
				y++;
			
				if ( error < 0 )
				{
					error += 2 * y + 1;
				}
				else 
				{
					if (x >= y)
					{
						startX = -y + 1 + centerX;
						endX = y - 1 + centerX + 1;
						this.#drawHorizontalLine( startX, endX, centerY + x );
						this.#drawHorizontalLine( startX, endX, centerY - x );
					}
					x--;
					error += 2 * (y - x + 1);
				}
			}
		}
		else
		{
			//случай с чётным диаметром
			let centerX = Math.floor( x0 + 0.5 );
			let centerY = Math.floor( y0 + 0.5 );

			let x = d / 2;
			let y = 0;
			let error = 2 - x;
			while ( x >= y )
			{
				let startX = centerX - x;
				let endX = centerX + x;
				this.#drawHorizontalLine( startX, endX, centerY - y - 1 );
				this.#drawHorizontalLine( startX, endX, centerY + y );
				y++;
			
				if ( error < 0 )
				{
					error += 2 * y + 2;
				}
				else 
				{
					if (x >= y)
					{
						startX = -y + centerX;
						endX = y + centerX;
						this.#drawHorizontalLine( startX, endX, centerY + x - 1 );
						this.#drawHorizontalLine( startX, endX, centerY - x );
					}
					x--;
					error += 2 * (y - x + 2);
				}
			}
		}
		
	}
}


/**
 * Указатель мыши в виде окружности
 */
class CircleCursor
{
	/** Элемент */
	#svg;

	/** Окружность */
	#circle;

	/** Крест в центре */
	#cross;

	/**
	 * Половина стороны
	 * @type {number}
	 */
	#halfSize = 0;

	/**
	 * Указатель мыши в виде окружности
	 * @param {HTMLElement} content Блок, поверх которого отображается курсор
	 */
	constructor( content )
	{
		const svg = document.createElementNS( SVG_NS, "svg" );
		svg.style.display = "none";
		svg.style.position = "fixed";
		svg.style.zIndex = "-1";
		svg.style.pointerEvents = "none";
		svg.style.userSelect = "none";
		svg.style.cursor = "none";
		svg.setAttribute( "fill", "none" );
		svg.setAttribute( "filter", "drop-shadow(0 0 1px black)" );
		
		const circle = document.createElementNS( SVG_NS, "circle");
		circle.setAttribute( "fill", "none" );
		circle.setAttribute( "stroke", "white" );
		circle.setAttribute( "stroke-width", "2" );
		svg.append( circle );
		this.#circle = circle;

		const cross = document.createElementNS( SVG_NS, "svg");
		cross.setAttribute( "width", "16" );
		cross.setAttribute( "height", "16" );
		const path = document.createElementNS( SVG_NS, "path");
		path.setAttribute( "d", "M 8 0 v 16 M 0 8 h 16" );
		path.setAttribute( "stroke", "white" );
		path.setAttribute( "stroke-width", "2" );
		cross.append( path );
		svg.append( cross );
		this.#cross = cross;

		content.style.position = "relative";
		content.style.zIndex = "-2";
		content.after( svg );
		this.#svg = svg;
	}

	/** Показать */
	show()
	{
		this.#svg.style.display = "block";
	}

	/** Скрыть */
	hide()
	{
		this.#svg.style.display = "none";
	}

	/**
	 * Изменить позицию
	 * @param {number} x
	 * @param {number} y
	 */
	move( x, y )
	{
		this.#svg.style.left = `${ x - this.#halfSize }px`;
		this.#svg.style.top = `${ y - this.#halfSize }px`;
	}

	/**
	 * Изменить размер указателя
	 * @param {number} diameter
	 */
	resize( diameter )
	{
		const rect = this.#svg.getBoundingClientRect();
		const x0 = rect.left + this.#halfSize;
		const y0 = rect.top + this.#halfSize;

		this.#svg.setAttribute( "width", diameter + 2 );
		this.#svg.setAttribute( "height", diameter + 2 );
		let half = diameter / 2 + 1;
		this.#halfSize = half;
		
		this.#circle.setAttribute( "cx", half );
		this.#circle.setAttribute( "cy", half );
		this.#circle.setAttribute( "r", half - 1 );

		if ( diameter > 70 )
		{
			half = Math.floor( half );
			this.#cross.setAttribute( "x", `${ half - 8 }` );
			this.#cross.setAttribute( "y", `${ half - 8 }` );
			this.#cross.removeAttribute( "display" );
		}
		else
		{
			this.#cross.setAttribute( "display", "none" );
		}

		this.move( x0, y0 );
	}
}