import { DrawingWorkplace } from "./DrawingWorkplace.js";
import { Toolkit } from "./Toolkit.js";
import { Editor } from "./Editor.js";
import { MapMaker } from "./MapMaker.js";
import { MainMenu } from "./MainMenu.js";

function main()
{
	const canvas = document.getElementById( "drawing-canvas" );
	const sizeForm = document.forms.namedItem( "new-size" );
	const menu = document.querySelector( "header .horizontal-menu" );
	const zoom = document.getElementById( "zoom" );
	
	if ( 
		!canvas || !( canvas instanceof HTMLCanvasElement )
		|| !sizeForm
		|| !zoom
		|| !menu
	)
	{
		return;
	}
	
	const workplace = new DrawingWorkplace(	canvas, zoom );

	const toolkit = new Toolkit();

	const container = canvas.parentElement;
	const editor = new Editor( workplace, toolkit, container );

	const app = new MapMaker( canvas, sizeForm, editor );
	
	new MainMenu( app, menu );
}

main();
