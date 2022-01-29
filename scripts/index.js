import { DrawingWorkplace } from "./DrawingWorkplace.js";
import { SizeSetter } from "./SizeSetter.js"

function main()
{
	const canvas = document.getElementById( "drawing-canvas" );
	const sizeForm = document.forms.namedItem( "new-size" );
	const zoom = document.getElementById( "zoom" );
	
	if ( !canvas || !( canvas instanceof HTMLCanvasElement )
		|| !sizeForm
		|| !zoom
	)
	{
		return;
	}
	
	
	const sizes = new SizeSetter( sizeForm, canvas );
	

	const modal = document.querySelector( "main aside.modal" );

	function newMap()
	{
		// for ( const menu of menus)
		// {
		// 	menu.hidden = !menu.hidden;
		// }
		const workplace = new DrawingWorkplace(
			canvas,
			sizes.width,
			sizes.height,
			zoom
		);
	}

	sizes.onSubmit = newMap;
	
	// size.init();
}



main();
