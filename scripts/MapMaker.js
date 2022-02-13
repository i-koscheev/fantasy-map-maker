import { SizeSetter } from "./SizeSetter.js"

import { Editor } from "./Editor.js"

/**
 * Состояния приложения
 * @enum {number}
 */
const States = {
	NOTHING: 0,
	SIZE_DIALOG: 1,
	EDITING: 2,
};

/**
 * Класс для создания, закрытия, открытия карт
 */
export class MapMaker
{
	/**
	 * Текущее состояние
	 * @type {number}
	 */
	#state = States.NOTHING;

	/**
	 * Модальное окно для ввода начальных размеров
	 * @type {HTMLElement}
	 */
	#modal;

	/**
	 * Кликабельный контейнер для холста
	 * @type {HTMLElement}
	 */
	#wrapper;

	/**
	 * Установка размеров
	 * @type {SizeSetter}
	 */
	#sizes;

	/**
	 * Редактирование карты
	 * @type {Editor}
	 */
	#editor;


	/**
	 * Класс приложения
	 * 
	 * @param {HTMLCanvasElement} canvas Холст для выбора размера
	 * @param {HTMLFormElement} form Форма для ввода
	 * @param {Editor} editor Редактор карты
	 */
	constructor( canvas, form, editor )
	{
		this.#wrapper = canvas.closest( ".clickable" );
		// this.#setNothing();

		this.#sizes = new SizeSetter( form, canvas );	
		this.#modal = form.closest( ".modal" );
		const cancelButton = this.#modal.querySelector( ".button_close" );
		cancelButton.addEventListener(
			"click",
			() => { this.#cancelNewMap(); }
		);

		this.#editor = editor;
	}

	/**
	 * Возвращает, открыта ли сейчас карта в редакторе
	 * @type {boolean}
	 */
	get isMapOpened()
	{
		return ( this.#state === States.EDITING );
	}

	/**
	 * Новая карта
	 */
	newMap()
	{
		if ( this.#state === States.EDITING )
		{
			this.#editor.shutdown();
		}
		else
			if ( this.#state === States.SIZE_DIALOG )
			{	
				const field = this.#modal.querySelector( ".field" );
				if ( !!field )
				{
					field.focus();
				}			
				return;
			}

		this.#wrapper.style.display = "block";
		this.#sizes.init();
		this.#sizes.onSubmit = () => { this.#createNewMap(); };
		this.#modal.style.display = "block";
		this.#state = States.SIZE_DIALOG;
	}

	/**
	 * Закрытие текущей карты
	 */
	closeMap()
	{
		if ( this.#state === States.EDITING )
		{
			this.#editor.shutdown();
			this.#setNothing();
		}
		else
			if ( this.#state === States.SIZE_DIALOG )
			{
				this.#cancelNewMap();
			}
	}

	/** Cоздание новой карты */
	#createNewMap()
	{
		this.#modal.style.display = "none";
		this.#editor.newMap(
			this.#sizes.width,
			this.#sizes.height,
		);
		this.#state = States.EDITING;
	}

	/** Отмена создания новой карты */
	#cancelNewMap()
	{
		this.#modal.style.display = "none";
		this.#sizes.shutdown();
		this.#setNothing();
	}

	/** Устанавливает внешний вид пустого состояния */
	#setNothing()
	{
		this.#wrapper.style.display = "none";
		this.#state = States.NOTHING;
	}
}