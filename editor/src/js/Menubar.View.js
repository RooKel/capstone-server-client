import { UIPanel, UIRow } from './libs/ui.js';
import {AudioPanel} from "./AudioPanel.js";

function MenubarView( editor ) {

	var container = new UIPanel();
	container.setClass( 'menu' );

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( 'View' );
	container.add( title );

	var options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// VR mode

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( 'VR mode' );
	option.onClick( function () {

		//editor.signals.enterVR.dispatch();

	} );
	options.add( option );

	// Audio Source View
	var option = new UIRow();
	option.setClass('option');
	option.setTextContent("Audio View");
	option.onClick(function () {

		var panel = new AudioPanel(editor,{
			theme 		: 'dark filleddark',
			headerTitle	: 'Audio Source View'
		});

	});
	options.add(option);

	return container;

}

export { MenubarView };
