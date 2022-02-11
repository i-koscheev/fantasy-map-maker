import { DrawingWorkplace } from "./DrawingWorkplace.js";
import { Toolkit } from "./Toolkit.js";
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

	#svg;

	#imageTracer;

	#handleСlickBounded;


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

		workplace.onRescale = () => { this.#rescale(); };

		toolkit.onStartPainting = () => { this.#startDrawing(); };

		toolkit.onStopPainting = () => { this.#stopDrawing(); };

		toolkit.onStyleChange = () => { this.#changeStyle(); };
		
		this.#imageTracer = new ImageTracer();

		this.#handleСlickBounded = this.#handleСlick.bind( this );
	}

	/** Завершение работы */
	shutdown()
	{
		this.#workplace.shutdown();
		this.#toolkit.shutdown();
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
		this.#workplace.canvas.style.background = "rgba(0,0,0,0.1)";
		
		this.#biome = this.#toolkit.biome;
		const biomeView = STYLES[ (this.#toolkit.styleIndex) ].biome( this.#biome );
		this.#drawingColor = 
			( !biomeView.drawingСolor )
			? biomeView.color.toHex()
			: biomeView.drawingСolor.toHex();

		this.#drawBiome();
		
		this.#drawingMode = true;
		this.#hasChanged = false;

		this.#workplace.canvas.addEventListener(
			"click",
			this.#handleСlickBounded
		)

	}

	/** Завершение рисования */
	#stopDrawing()
	{
		this.#drawingMode = false;
		this.#workplace.canvas.removeEventListener(
			"click",
			this.#handleСlickBounded
		);
		this.#workplace.clear();
		this.#workplace.canvas.style.background = "";

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
			this.#drawBiome();
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
	
	/**
	 * Обработка клика по холсту
	 * @param {MouseEvent} event
	 */
	#handleСlick( event )
	{
		if ( this.#drawingMode )
		{
			this.#hasChanged = true;

			const rect = this.#workplace.canvas.getBoundingClientRect();
		
			const x = event.clientX - (rect.left + window.pageXOffset);
			const y = event.clientY - (rect.top + window.pageYOffset);
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