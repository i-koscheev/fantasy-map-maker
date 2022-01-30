import { MainMenu } from "./MainMenu.js";
import { Editor } from "./Editor.js";
import { MapMaker } from "./MapMaker.js";

function main()
{
	const canvas = document.getElementById( "drawing-canvas" );
	const sizeForm = document.forms.namedItem( "new-size" );
	const tools = document.querySelector( ".toolbar" );
	const menu = document.querySelector( "header .horizontal-menu" );
	const zoom = document.getElementById( "zoom" );
	
	if ( 
		!canvas || !( canvas instanceof HTMLCanvasElement )
		|| !sizeForm
		|| !tools
		|| !zoom
		|| !menu
	)
	{
		return;
	}
	
	const editor = new Editor( canvas, tools, zoom );

	const app = new MapMaker( canvas, sizeForm, editor );
	
	new MainMenu( app, menu );
}

main();
