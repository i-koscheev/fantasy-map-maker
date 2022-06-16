import { MapMaker } from "./MapMaker.js";

/**
 * Главное меню
 */
export class MainMenu
{
	/** 
	 * Редактор карт 
	 * @type {MapMaker}
	 */
	#app;
	
	/**
	 * Главное меню для управления страницей
	 *
	 * @param {MapMaker} app Редактор карт
	 * @param {HTMLElement} menuList Список элементов меню
	 */
	constructor( app, menuList )
	{
		this.#app = app;

		const buttons = menuList.querySelectorAll( ".button" );
		
		for ( let button of buttons )
		{
			button.addEventListener(
				"click",
				( event ) => { this.#handleButtonClick( event ); }
			);
		}
	}
	
	/**
	 * Выполняет действие
	 * @param {string} name
	 */
	command( name )
	{
		switch ( name )
		{
			case "close":
				this.#app.closeMap();
				break;
			
			case "new":
				this.#app.newMap();
				break;
			
			default:
				throw new Error( `Unknown command "${name}"` );
		}
	}
	
	/**
	 * Обработчик нажатия на кнопку
	 * 
	 * @param {Event} event
	 */
	#handleButtonClick( event )
	{
		const target = event.currentTarget;
		if ( !( target.matches( ".button" ) ) )
		{
			return;
		}
		const name = target.dataset.command;
		this.command( name );
	}

}
