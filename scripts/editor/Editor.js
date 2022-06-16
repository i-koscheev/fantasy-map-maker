import { DrawingWorkplace, Point } from "./DrawingWorkplace.js";
import { Toolkit } from "./Toolkit.js";
import { MapData } from "../types/MapData.js";
import { STYLES, SVG_NS } from "../assets/Styles.js";
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
	 * Целочисленный размер кисти
	 * @type {String}
	 */
	#intSize;

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
	 * Идёт ли рисование кистью в текущий момент
	 * @type {boolean}
	 */
	#isDrawing = false;

	/**
	 * Продолжается ли рисование за пределами холста
	 * @type {boolean}
	 */
	#isOutside = false;

	/**
	 * Последняя точка
	 * @type {Point}
	 */
	#lastPoint;

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

	/**
	 * Сетка
	 * @type {Grid}
	 */
	#grid;

	#svg;

	#imageTracer;

	#handleСlickBound;

	#handleMouseDownBound;

	#handleMouseMoveBound;

	#handleMouseUpBound;

	#handleMouseEnterBound;

	#handleMouseLeaveBound;

	/** @type { (event: Event) => void } */
	#preventDefault = ( event ) => { event.preventDefault(); };

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
		this.#cursor = new CircleCursor( container );
		this.#grid = new Grid( workplace.canvas );

		this.#imageTracer = new ImageTracer();

		workplace.onRescale = () => { this.#rescale(); };

		toolkit.onStartPainting = () => { this.#startDrawing(); };

		toolkit.onStopPainting = () => { this.#stopDrawing(); };

		toolkit.onStyleChange = () => { this.#changeStyle(); };

		toolkit.onPaintSizeChange = () => {
			this.#intSize = Math.round( this.#toolkit.paintSize );
			this.#cursor.resize( this.#intSize * this.#workplace.scale );
		};

		this.#wrapper.style.setProperty( "pointer-events", "auto" );
		
		this.#handleСlickBound = this.#handleСlick.bind( this );
		this.#handleMouseDownBound = this.#handleMouseDown.bind( this );
		this.#handleMouseMoveBound = this.#handleMouseMove.bind( this );
		this.#handleMouseUpBound = this.#handleMouseUp.bind( this );
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

		this.#wrapper.addEventListener(
			'mouseenter',
			( event ) => { this.#cursor.move( event.clientX, event.clientY ); },
			{ once: true }
		);

		this.#newSvg();
	}

	/** Начало рисования */
	#startDrawing()
	{
		this.#biome = this.#toolkit.biome;
		const biomeView = STYLES[ (this.#toolkit.styleIndex) ].biome( this.#biome );
		this.#drawingColor = 
			( !biomeView.drawingСolor )
			? biomeView.color.toHex()
			: biomeView.drawingСolor.toHex();
		this.#intSize = Math.round( this.#toolkit.paintSize );
		
		this.#drawingMode = true;
		this.#hasChanged = false;
		this.#rescale();
		this.#grid.show();
		this.#addMouseEventListeners();
	}

	/** Завершение рисования */
	#stopDrawing()
	{
		this.#drawingMode = false;
		this.#removeMouseEventListeners();
		this.#grid.hide();
		this.#workplace.clear();

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
			const newScale = this.#workplace.scale;
			this.#grid.rescale( newScale );
			this.#drawBiome();
			this.#cursor.resize( this.#intSize * newScale );
		}
	}

	/** Переносит на холст все области конкретной территории c текущей карты */
	#drawBiome()
	{
		this.#workplace.color = this.#drawingColor;
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
						this.#workplace.horizontalLine( start, x, y );
						start = -1;
					}
				}
			}
			//случай в конце строки
			if ( start !== -1 )
			{
				this.#workplace.horizontalLine( start, this.#mapData.width, y );
			}
		}
	}

	/** Регистрирует обработчики событий мыши */
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
		document.addEventListener(
			'mouseup',
			this.#handleMouseUpBound
		);
		document.addEventListener(
			'mousemove',
			this.#handleMouseMoveBound
		);
		this.#wrapper.addEventListener(
			'mousedown',
			this.#handleMouseDownBound
		);
		this.#wrapper.addEventListener(
			"click",
			this.#handleСlickBound
		);
		this.#wrapper.addEventListener(
			"contextmenu",
			this.#preventDefault
		);
	}

	/** Убирает обработчики событий мыши */
	#removeMouseEventListeners()
	{
		this.#wrapper.removeEventListener(
			"contextmenu",
			this.#preventDefault
		);
		this.#wrapper.removeEventListener(
			"click",
			this.#handleСlickBound
		);
		this.#wrapper.removeEventListener(
			'mousedown',
			this.#handleMouseDownBound
		);
		document.removeEventListener(
			'mousemove',
			this.#handleMouseMoveBound
		);
		document.removeEventListener(
			'mouseup',
			this.#handleMouseUpBound
		);
		this.#wrapper.removeEventListener(
			'mouseenter',
			this.#handleMouseEnterBound
		);
		this.#wrapper.removeEventListener(
			'mouseleave',
			this.#handleMouseLeaveBound
		);
		//прекращаем рисование, если оно происходило
		this.#handleMouseUp();
		this.#cursor.hide();
		this.#wrapper.style.cursor = "default";
	}


	/** Обрабатывает наведение указателя */
	#handleMouseEnter()
	{
		if ( this.#isDrawing ) 
		{
			this.#isOutside = false;
		}
		else
		{
			this.#cursor.show();
		}
	}

	/** Обрабатывает исчезновение указателя */
	#handleMouseLeave()
	{
		if ( this.#isDrawing ) 
		{
			this.#isOutside = true;
		}
		else
		{
			this.#cursor.hide();
		}
	} 
	
	/**
	 * Обрабатывает нажатие кнопки мыши
	 * @param {MouseEvent} event
	 */
	#handleMouseDown( event )
	{
		event.preventDefault();
		this.#hasChanged = true;
		this.#isDrawing = true;
		this.#lastPoint = this.#workplace.canvasPoint(
			event.clientX,
			event.clientY
		);
		this.#cursor.up();
		document.documentElement.style.setProperty( "cursor", "none" );
		document.documentElement.style.setProperty( "pointer-events", "none" );
	}

	/**
	 * Обрабатывает перемещение курсора (по всему документу)
	 * @param {MouseEvent} event
	 */
	#handleMouseMove( event )
	{	
		this.#cursor.move( event.clientX, event.clientY );

		if ( this.#isDrawing )
		{
			let currentPoint = this.#workplace.canvasPoint(
				event.clientX,
				event.clientY
			);
			const distance = distanceBetween( this.#lastPoint, currentPoint );
			const angle = angleBetween( this.#lastPoint, currentPoint );
			let x, y;
			let step = Math.min( Math.ceil( this.#intSize / 8 ), 10 );
			for ( let i = 0; i < distance; i+=step )
			{
				x = this.#lastPoint.x + ( Math.sin( angle ) * i );
				y = this.#lastPoint.y + ( Math.cos( angle ) * i );
				this.#drawCircle( x, y, this.#intSize );
			}
			this.#lastPoint = currentPoint;
		}
	}

	/** Обрабатывает отпускание кнопки мыши */
	#handleMouseUp()
	{
		if ( this.#isDrawing ) 
		{
			this.#isDrawing = false;
			if ( this.#isOutside )
			{
				this.#cursor.hide();
				this.#isOutside = false;
			}
			document.documentElement.style.removeProperty( "pointer-events" );
			document.documentElement.style.removeProperty( "cursor" );
			this.#cursor.down();
		}		
	}

	/**
	 * Обрабатывает одиночный клик по холсту
	 * @param {MouseEvent} event
	 */
	#handleСlick( event )
	{
		this.#hasChanged = true;
		const point = this.#workplace.canvasPoint( event.clientX, event.clientY );
		this.#drawCircle( point.x, point.y, this.#intSize );
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
			
			this.#workplace.horizontalLine( x0, x1, y );
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
	 * @param {number} d диаметр
	 */
	#drawCircle( x0, y0, d )
	{
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
 * Расстояние между двумя точками
 * @param {Point} point1 
 * @param {Point} point2 
 * @returns {number}
 */
function distanceBetween( point1, point2 )
{
	return Math.sqrt(
		Math.pow( point2.x - point1.x, 2 ) 
		+ Math.pow( point2.y - point1.y, 2 )
	);
}

/**
 * Угол (в радианах) между двумя точками
 * @param {Point} point1 
 * @param {Point} point2 
 * @returns {number}
 */
function angleBetween( point1, point2 )
{
	return Math.atan2( 
		point2.x - point1.x,
		point2.y - point1.y
	);
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

	/** Поднять */
	up()
	{
		this.#svg.style.zIndex = "1";
	}

	/** Опустить */
	down()
	{
		this.#svg.style.zIndex = "-1";
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


/**
 * Cетка
 */
class Grid
{
	/** Элемент */
	#element;

	/**
	 * Сетка
	 * @param {HTMLElement} element Блок, на фон которого устанавливается сетка 
	 */
	constructor( element )
	{
		this.#element = element;
	}

	/** Показать сетку */
	show()
	{
		this.#element.classList.add( "grid-background" );
	}

	/** Скрыть сетку */
	hide()
	{
		this.#element.classList.remove( "grid-background" );
	}

	/**
	 * Изменить масштаб сетки
	 * @param {number} scale
	 */
	rescale( scale )
	{
		const PX = [ 1, 2, 4, 5, 10, 20, 25, 50, 100 ];
		let minor = 0;
		for ( let i = 0; i < PX.length; i++ )
		{
			minor = PX[i] * scale;
			if ( minor >= 15 )
				break;
		}
		let major = 100 * scale;

		this.#element.style.setProperty( "--minor-length", `${minor}px` );
		this.#element.style.setProperty( "--major-length", `${major}px` );
	}
}