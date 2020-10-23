import * as THREE from '../../build/three.module.js';
import { GLTFExporter } from '../../examples/jsm/exporters/GLTFExporter.js';
import { JSZip } from '../../examples/jsm/libs/jszip.module.min.js';
import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';
import {jsPanel} from "./libs/jspanel/es6module/jspanel.js";

function MenubarFile( editor ) {

	function parseNumber( key, value ) {

		var precision = config.getKey( 'exportPrecision' );

		return typeof value === 'number' ? parseFloat( value.toFixed( precision ) ) : value;

	}

	//

	var config = editor.config;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass( 'menu' );

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/file' ) );
	container.add( title );

	var options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// New

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/new' ) );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

		}

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Import

	var form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	let fileInputID = 0;

	var fileInput = document.createElement( 'input' );
	fileInput.multiple = true;
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function () {

		if ( fileInputID == 1 ) {

			editor.loader.loadFiles( fileInput.files );
			form.reset();

		} else if ( fileInputID == 2 ) {

			editor.loader.loadFiles( fileInput.files );
			form.reset();

		}

	} );
	form.appendChild( fileInput );

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/import' ) );
	option.onClick( function () {

		fileInputID = 1;
		fileInput.click();

	} );
	options.add( option );

	//

	// Load World

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/import/world' ) );
	option.onClick( function () {

		fileInputID = 2;
		fileInput.click();

	} );
	options.add( option );

	//

	//	Import Scene File

	//	Download Avatar

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/download/avatar' ) );
	option.onClick( function () {
		jsPanel.create({
			theme: 'dimgray filleddark',
			headerTitle: 'Avatar Download',
			panelSize: {
				width: () => { return Math.min(800, window.innerWidth*0.9);},
				height: () => { return Math.min(500, window.innerHeight*0.6);}
			},
			content: '<p>My first panel.</p>',
			animateIn: 'jsPanelFadeIn',
			onwindowresize: true
		})
	} );
	options.add( option );

	//	Download World

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/download/world' ) );

	options.add( option );

	//	Upload Avatar

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/upload/avatar' ) );

	options.add( option );

	//	Upload World

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/upload/world' ) );

	options.add( option );

	options.add( new UIHorizontalRule() );
	// Export Geometry

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/geometry' ) );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		var geometry = object.geometry;

		if ( geometry === undefined ) {

			alert( 'The selected object doesn\'t have geometry.' );
			return;

		}

		var output = geometry.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'geometry.json' );

	} );
	//options.add( option );

	// Export Object

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/object' ) );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected' );
			return;

		}

		var output = object.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'model.json' );

	} );
	//options.add( option );

	// Export Scene

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/scene' ) );
	option.onClick( function () {

		var output = editor.scene.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'scene.json' );

	} );
	//options.add( option );

	//

	//options.add( new UIHorizontalRule() );

	// Export GLB

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/glb' ) );
	option.onClick( function () {

		var exporter = new GLTFExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveArrayBuffer( result, 'scene.glb' );

		}, { binary: true } );

	} );
	//options.add( option );

	// Export GLTF

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/export/avatar' ) );
	option.onClick( function () {

		var exporter = new GLTFExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveString( JSON.stringify( result, null, 2 ), 'scene.gltf' );

		} );


	} );
	options.add( option );

	//options.add( new UIHorizontalRule() );

	//	Export World
	var option = new UIRow();
	option.setClass( `option` );
	option.setTextContent( strings.getKey( 'menubar/file/export/world' ) );
	option.onClick( function () {

		var zip = new JSZip();
		var output = { metadata: {}, scripts: {} };
		output.metadata.type = "Scripts";
		output.scripts = JSON.stringify( editor.scripts, parseNumber, '\t' );
		output = JSON.stringify( output, parseNumber, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		zip.file( 'scripts.json', output );

		var exporter = new GLTFExporter();

		exporter.parse( editor.scene, function ( result ) {

			var sceneJson = JSON.stringify( result, null, 2 );
			zip.file( 'world.gltf', sceneJson );

			var title = config.getKey( 'project/title' );

			save( zip.generate( { type: 'blob' } ), ( title !== '' ? title : 'World' ) + '.zip' );

		} );

	} );
	options.add( option );
	//
	//options.add( new UIHorizontalRule() );

	// Publish

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/file/publish' ) );
	option.onClick( function () {

		var zip = new JSZip();

		//

		var output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		output = JSON.stringify( output, parseNumber, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		zip.file( 'app.json', output );
		//

		var title = config.getKey( 'project/title' );

		var manager = new THREE.LoadingManager( function () {

			save( zip.generate( { type: 'blob' } ), ( title !== '' ? title : 'untitled' ) + '.zip' );

		} );

		var loader = new THREE.FileLoader( manager );
		loader.load( 'js/libs/app/index.html', function ( content ) {

			content = content.replace( '<!-- title -->', title );

			var includes = [];

			content = content.replace( '<!-- includes -->', includes.join( '\n\t\t' ) );

			var editButton = '';

			if ( config.getKey( 'project/editable' ) ) {

				editButton = [
					'',
					'			var button = document.createElement( \'a\' );',
					'			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
					'			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 10px 16px; color: #fff; border: 1px solid #fff; border-radius: 20px; text-decoration: none;\';',
					'			button.target = \'_blank\';',
					'			button.textContent = \'EDIT\';',
					'			document.body.appendChild( button );',
					''
				].join( '\n' );

			}

			content = content.replace( '\n\t\t\t/* edit button */\n', editButton );

			zip.file( 'index.html', content );

		} );
		loader.load( 'js/libs/app.js', function ( content ) {

			zip.file( 'js/app.js', content );

		} );
		loader.load( '../build/three.module.js', function ( content ) {

			zip.file( 'js/three.module.js', content );

		} );
		loader.load( '../examples/jsm/webxr/VRButton.js', function ( content ) {

			zip.file( 'js/VRButton.js', content );

		} );

	} );
	//options.add( option );

	//

	var link = document.createElement( 'a' );
	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename || 'data.json';
		link.dispatchEvent( new MouseEvent( 'click' ) );

		// URL.revokeObjectURL( url ); breaks Firefox...

	}

	function saveArrayBuffer( buffer, filename ) {

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

	return container;

}

export { MenubarFile };
