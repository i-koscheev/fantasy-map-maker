import { DrawingWorkplace } from "./DrawingWorkplace.js";
import { SizeSetter } from "./SizeSetter.js"

function main()
{
	const canvas = document.getElementById( "drawing-canvas" );
	const sizeForm = document.forms.namedItem( "new-size" );
	const scaleSelector = document.getElementById( "scale" );
	
	if ( !canvas || !( canvas instanceof HTMLCanvasElement )
		|| !sizeForm
		|| !scaleSelector
	)
	{
		return;
	}
	
	const sizes = new SizeSetter( sizeForm, canvas );

	const menus = document.querySelectorAll( "header .menu" );

	function newMap()
	{
		for ( const menu of menus)
		{
			menu.hidden = !menu.hidden;
		}
		const workplace = new DrawingWorkplace(
			canvas,
			sizes.width,
			sizes.height,
			scaleSelector
		);
	}

	sizes.onSubmit = newMap;
	
	// size.init();
}



main();
