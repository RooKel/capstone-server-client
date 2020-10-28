import * as THREE from '../../build/three.module.js';
import {GLTFExporter} from '../../examples/jsm/exporters/GLTFExporter.js';
import {JSZip} from '../../examples/jsm/libs/jszip.module.min.js';
import {UIPanel, UIRow, UIHorizontalRule} from './libs/ui.js';
import {GridPanel} from "./GridPanel.js";
import {GridPanelElement} from "./GridPanelElement.js";
import {UploadPanel} from "./UploadPanel.js";

function MenubarFile(editor) {

    function parseNumber(key, value) {

        var precision = config.getKey('exportPrecision');

        return typeof value === 'number' ? parseFloat(value.toFixed(precision)) : value;

    }
    let socket = io.connect('ws://localhost:3000');
    //

    var config = editor.config;
    var strings = editor.strings;

    var container = new UIPanel();
    container.setClass('menu');

    var title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/file'));
    container.add(title);

    var options = new UIPanel();
    options.setClass('options');
    container.add(options);

    // New

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/new'));
    option.onClick(function () {

        if (confirm('Any unsaved data will be lost. Are you sure?')) {

            editor.clear();

        }

    });
    options.add(option);

    //

    options.add(new UIHorizontalRule());

    // Import

    var form = document.createElement('form');
    form.style.display = 'none';
    document.body.appendChild(form);

    let fileInputID = 0;

    var fileInput = document.createElement('input');
    fileInput.multiple = true;
    fileInput.type = 'file';
    fileInput.addEventListener('change', function () {

        if (fileInputID == 1) {

            editor.loader.loadFiles(fileInput.files);
            form.reset();

        } else if (fileInputID == 2) {

            editor.loader.loadFiles(fileInput.files);
            form.reset();

        }

    });
    form.appendChild(fileInput);

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/import'));
    option.onClick(function () {

        fileInputID = 1;
        fileInput.click();

    });
    options.add(option);

    //

    // Load World

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/import/world'));
    option.onClick(function () {

        fileInputID = 2;
        fileInput.click();

    });
    options.add(option);

    //

    //	Import Scene File
    options.add(new UIHorizontalRule());
    //	Upload Avatar

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/upload/avatar'));
    option.onClick(function () {
        if (editor.floatingPanels.upload_avatar !== undefined) {
            editor.floatingPanels.upload_avatar.close();
        }
        let panelContents = {
            panel_type: 'avatar',
            preview   : undefined,
        };
        editor.floatingPanels.upload_avatar = new UploadPanel(panelContents, {
            theme      : 'lightslategray filleddark',
            headerTitle: 'Avatar Upload'
        }, function (dataStream) {
            getWorldJson(editor.scene, function(sceneJson){
                dataStream.raw_gltf = sceneJson;
                socket.emit('file-upload', dataStream);
                editor.floatingPanels.upload_avatar.close();
            });
        });
    });
    options.add(option);

    //	Upload World

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/upload/world'));
    option.onClick(function () {
        if (editor.floatingPanels.upload_world !== undefined) {
            editor.floatingPanels.upload_world.close();
        }
        let panelContents = {
            panel_type: 'world',
            preview   : undefined,
        };
        editor.floatingPanels.upload_world = new UploadPanel(panelContents, {
            theme      : 'lightslategray filleddark',
            headerTitle: 'World Upload'
        }, function (dataStream) {
            getWorldJson(editor.scene, function(sceneJson){
                dataStream.raw_gltf = sceneJson;
                socket.emit('file-upload', dataStream);
                editor.floatingPanels.upload_world.close();
            });
        });
    });
    options.add(option);

    options.add(new UIHorizontalRule());

    //	Download Avatar

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/download/avatar'));
    option.onClick(function () {
        let elements = [];
        for (let i = 0; i < 10; i++) {
            elements.push(new GridPanelElement("test" + i, 100, 100, null));
        }
        if (editor.floatingPanels.download_avatar !== undefined) {
            editor.floatingPanels.download_avatar.close();
        }
        let tmpGrid = new GridPanel(elements, {
            theme      : 'dark filleddark',
            headerTitle: 'Avatar Download'
        }, (event) => {
            console.log(event.type);
        });
        editor.floatingPanels.download_avatar = tmpGrid;
    });
    options.add(option);

    //	Download World

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/download/world'));
    option.onClick(function () {
        let elements = [];
        for (let i = 0; i < 10; i++) {
            elements.push(new GridPanelElement("test" + i, 100, 100, null));
        }
        if (editor.floatingPanels.download_world !== undefined) {
            editor.floatingPanels.download_world.close();
        }
        editor.floatingPanels.download_world = new GridPanel(elements, {
            theme      : 'dark filleddark',
            headerTitle: 'World Download'
        });
    });
    options.add(option);

    options.add(new UIHorizontalRule());
    // Export Geometry

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/export/geometry'));
    option.onClick(function () {

        var object = editor.selected;

        if (object === null) {

            alert('No object selected.');
            return;

        }

        var geometry = object.geometry;

        if (geometry === undefined) {

            alert('The selected object doesn\'t have geometry.');
            return;

        }

        var output = geometry.toJSON();

        try {

            output = JSON.stringify(output, parseNumber, '\t');
            output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        } catch (e) {

            output = JSON.stringify(output);

        }

        saveString(output, 'geometry.json');

    });
    //options.add( option );

    // Export Object

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/export/object'));
    option.onClick(function () {

        var object = editor.selected;

        if (object === null) {

            alert('No object selected');
            return;

        }

        var output = object.toJSON();

        try {

            output = JSON.stringify(output, parseNumber, '\t');
            output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        } catch (e) {

            output = JSON.stringify(output);

        }

        saveString(output, 'model.json');

    });
    //options.add( option );

    // Export Scene

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/export/scene'));
    option.onClick(function () {

        var output = editor.scene.toJSON();

        try {

            output = JSON.stringify(output, parseNumber, '\t');
            output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        } catch (e) {

            output = JSON.stringify(output);

        }

        saveString(output, 'scene.json');

    });
    //options.add( option );

    //

    //options.add( new UIHorizontalRule() );

    // Export GLB

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/export/glb'));
    option.onClick(function () {

        var exporter = new GLTFExporter();

        exporter.parse(editor.scene, function (result) {

            saveArrayBuffer(result, 'scene.glb');

        }, {binary: true});

    });
    //options.add( option );

    // Export GLTF

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/export/avatar'));
    option.onClick(function () {

        var exporter = new GLTFExporter();

        exporter.parse(editor.scene, function (result) {

            saveString(JSON.stringify(result, null, 2), 'scene.gltf');

        });


    });
    options.add(option);

    //options.add( new UIHorizontalRule() );

    //	Export World
    var option = new UIRow();
    option.setClass(`option`);
    option.setTextContent(strings.getKey('menubar/file/export/world'));
    option.onClick(exportWorld);

	function getWorldJson(scene, completeCallback) {
		let exporter = new GLTFExporter();
		exporter.parse(scene, function (result) {
			if(result.scenes[0].nodes === undefined) return;
			let q = [];
			for (let c = 0; c < result.scenes[0].nodes.length; c++) {
				q.push(result.scenes[0].nodes[c]);
			}
			while (q.length > 0) {
				scene.traverse(obj => {
					if (q.length <= 0) return;
					let node = result.nodes[q[q.length - 1]];
					if (node.name !== obj.name) return;

					let script = editor.scripts[obj.uuid];
					node.extras = {
						name  : obj.name,
						uuid  : obj.uuid,
						script: script
					};
					q.pop();

					if (node.children === undefined) return;

					for (let k = 0; k < node.children.length; k++) {
						q.push(node.children[k]);
					}
				});
			}
            completeCallback(JSON.stringify(result, null, 2));
		});
	}
    function exportWorld(scene) {

        let zip = new JSZip();

        getWorldJson(scene, function (sceneJson){

            zip.file('world.gltf', sceneJson);

            let title = config.getKey('project/title');
            save(zip.generate({type: 'blob'}), (title !== '' ? title : 'World') + '.zip');

        });
    }

    options.add(option);
    //
    //options.add( new UIHorizontalRule() );

    // Publish

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/publish'));
    option.onClick(function () {

        var zip = new JSZip();

        //

        var output = editor.toJSON();
        output.metadata.type = 'App';
        delete output.history;

        output = JSON.stringify(output, parseNumber, '\t');
        output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        zip.file('app.json', output);
        //

        var title = config.getKey('project/title');

        var manager = new THREE.LoadingManager(function () {

            save(zip.generate({type: 'blob'}), (title !== '' ? title : 'untitled') + '.zip');

        });

        var loader = new THREE.FileLoader(manager);
        loader.load('js/libs/app/index.html', function (content) {

            content = content.replace('<!-- title -->', title);

            var includes = [];

            content = content.replace('<!-- includes -->', includes.join('\n\t\t'));

            var editButton = '';

            if (config.getKey('project/editable')) {

                editButton = [
                    '',
                    '			var button = document.createElement( \'a\' );',
                    '			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
                    '			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 10px 16px; color: #fff; border: 1px solid #fff; border-radius: 20px; text-decoration: none;\';',
                    '			button.target = \'_blank\';',
                    '			button.textContent = \'EDIT\';',
                    '			document.body.appendChild( button );',
                    ''
                ].join('\n');

            }

            content = content.replace('\n\t\t\t/* edit button */\n', editButton);

            zip.file('index.html', content);

        });
        loader.load('js/libs/app.js', function (content) {

            zip.file('js/app.js', content);

        });
        loader.load('../build/three.module.js', function (content) {

            zip.file('js/three.module.js', content);

        });
        loader.load('../examples/jsm/webxr/VRButton.js', function (content) {

            zip.file('js/VRButton.js', content);

        });

    });
    //options.add( option );

    //

    var link = document.createElement('a');

    function save(blob, filename) {

        link.href = URL.createObjectURL(blob);
        link.download = filename || 'data.json';
        link.dispatchEvent(new MouseEvent('click'));

        // URL.revokeObjectURL( url ); breaks Firefox...

    }

    function saveArrayBuffer(buffer, filename) {

        save(new Blob([buffer], {type: 'application/octet-stream'}), filename);

    }

    function saveString(text, filename) {

        save(new Blob([text], {type: 'text/plain'}), filename);

    }

    return container;

}

export {MenubarFile};
