/**
 * Цвет в модели RGB
 */
export class Color
{
	/**
	 * Красный канал
	 * @type {number}
	 */
	#r = 0;

	/**
	 * Зелёный канал
	 * @type {number}
	 */
	#g = 0;

	/**
	 * Синий канал
	 * @type {number}
	 */
	#b = 0;
	
	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 */
	constructor( r = 0, g = 0, b = 0 )
	{
		this.r = r;
		this.g = g;
		this.b = b;
	}
	
	get r()
	{
		return this.#r;
	}
	
	set r( value )
	{
		this.#r = this.#normalize( value );
	}
	
	get g()
	{
		return this.#g;
	}
	
	set g( value )
	{
		this.#g = this.#normalize( value );
	}
	
	get b()
	{
		return this.#b;
	}
	
	set b( value )
	{
		this.#b = this.#normalize( value );
	}
	
	/**
	 * Нормализует значение канала
	 * 
	 * @param {number} value
	 */
	#normalize( value )
	{
		return Math.min(
			Math.max( value | 0, 0 ),
			255
		);
	}
	
	/**
	 * Шестнадцатеричная запись цвета вида #000000
	 */
	toHex()
	{
		return (
			"#" + this.#partToHex( this.#r )
			+ this.#partToHex( this.#g )
			+ this.#partToHex( this.#b )
		);
	}
	
	/**
	 * Формирует шестнадцатеричную запись одного компонента
	 * @param {number} value
	 */
	#partToHex( value )
	{
		const hex = value.toString( 16 );	
		return (
			( hex.length > 1 )
			? hex
			: "0" + hex
		);
	};
}
