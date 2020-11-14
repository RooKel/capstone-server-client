import * as THREE from '../../build/three.module.js';
import {GLTFExporter} from '../../examples/jsm/exporters/GLTFExporter.js';
import {JSZip} from '../../examples/jsm/libs/jszip.module.min.js';
import {UIPanel, UIRow, UIHorizontalRule} from './libs/ui.js';
import {GridPanel} from "./GridPanel.js";
import {UploadPanel} from "./UploadPanel.js";
import {FileTransferManager} from "./FileTransferManager.js";
import {DRACOLoader} from "../../examples/jsm/loaders/DRACOLoader.js";
import {GLTFLoader} from "../../examples/jsm/loaders/GLTFLoader.js";
import {AddObjectCommand} from "./commands/AddObjectCommand.js";

function b64(e){
    let t="";
    let n=new Uint8Array(e);
    let r=n.byteLength;
    for(let i=0;i<r;i++)
    {
        t+=String.fromCharCode(n[i])
    }
    return window.btoa(t)
}
function MenubarFile(editor) {
    var networkObject = new FileTransferManager(editor, "ws://localhost:3000");

    function onFileDownloaded(res)
    {
        let models = res.data;

        if(res.request_type === 'thumbnail')
        {
            let panel = undefined;
            if(res.category === 'avatar')
            {
                panel = editor.floatingPanels.download_avatar;
            }
            else if (res.category === 'world')
            {
                panel = editor.floatingPanels.download_world;
            }
            for (let c = 0; c < models.length; c++)
            {
                let model = models[c];
                let b64data = "data:image/png;base64," + b64(model.data);
                panel.createItemElement(model.name, model.creator, 100, 100, b64data, model.uid);
            }
        }
        else if(res.request_type === 'gltf')
        {
            for (let c = 0; c < models.length; c++)
            {
                let model = models[c];
                let dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

                let loader = new GLTFLoader();
                loader.setDRACOLoader( dracoLoader );
                loader.parse( model.data, '', function ( result ) {

                    var scene = result.scene;
                    scene.name = result.scene.name;

                    editor.addAnimation( scene, result.animations );
                    editor.execute( new AddObjectCommand( editor, scene ) );

                } );
            }
        }
        editor.signals.loadStateChanged.dispatch("close");
    }

    networkObject.addFileDownloadListener(onFileDownloaded);
    networkObject.listenFileDownload();

    this.htmlEvents = {
        clickNewSceneOption: () => {
            if (confirm('Any unsaved data will be lost. Are you sure?')) {
                editor.clear();
            }
        },
        clickUploadAvatarPanel: () => {
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
                getAvatarJson(editor.scene, function(avatarJson){
                    dataStream.raw_gltf = avatarJson;
                    editor.signals.loadStateChanged.dispatch("open");
                    networkObject.requestFileUpload(dataStream);
                    editor.floatingPanels.upload_avatar.close();
                });
            });
        },
        clickUploadWorldPanel: () => {
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
                    editor.signals.loadStateChanged.dispatch("open");
                    networkObject.requestFileUpload(dataStream);
                    editor.floatingPanels.upload_world.close();
                });
            });
        },
        clickDownloadAvatarPanel: () => {
            editor.signals.loadStateChanged.dispatch("open");
            networkObject.requestFileDownload('thumbnail','avatar');

            let elements = [];

            if (editor.floatingPanels.download_avatar !== undefined) {
                editor.floatingPanels.download_avatar.close();
            }
            let tmpGrid = new GridPanel(elements, {
                theme      : 'dark filleddark',
                headerTitle: 'Avatar Download'
            }, (event) => {
                console.log(event.type);
                if(event.type === 'dblclick')
                {
                    if(event.currentTarget.dataset.uid === undefined) return;
                    let panel = editor.floatingPanels.download_avatar;
                    let panelElement = panel.htmlPanelElementMap[event.currentTarget.dataset.uid];
                    editor.signals.loadStateChanged.dispatch("open");
                    networkObject.requestFileDownload('gltf', 'avatar', panelElement.uid);
                }
            });
            editor.floatingPanels.download_avatar = tmpGrid;
        },
        clickDownloadWorldPanel: () => {
            editor.signals.loadStateChanged.dispatch("open");
            networkObject.requestFileDownload('thumbnail','world');

            let elements = [];
            if (editor.floatingPanels.download_world !== undefined) {
                editor.floatingPanels.download_world.close();
            }
            //  Download thumbnail files

            editor.floatingPanels.download_world = new GridPanel(elements, {
                theme      : 'dark filleddark',
                headerTitle: 'World Download'
            }, (event)=>
            {
                if(event.type === 'dblclick')
                {
                    if(event.currentTarget.dataset.uid === undefined) return;
                    let panel = editor.floatingPanels.download_world;
                    let panelElement = panel.htmlPanelElementMap[event.currentTarget.dataset.uid];
                    editor.signals.loadStateChanged.dispatch("open");
                    networkObject.requestFileDownload('gltf', 'world', panelElement.uid);
                }
            });
        }
    }

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
    option.onClick(this.htmlEvents.clickNewSceneOption);
    options.add(option);

    //

    options.add(new UIHorizontalRule());

    // Import

    var form = document.createElement('form');
    form.style.display = 'none';
    document.body.appendChild(form);

    var fileInput = document.createElement('input');
    fileInput.multiple = true;
    fileInput.type = 'file';
    fileInput.addEventListener('change', function () {

        editor.loader.loadFiles(fileInput.files);
        form.reset();

    });
    form.appendChild(fileInput);

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/import'));
    option.onClick(function () {

        fileInput.click();

    });
    options.add(option);

    //

    // Load World

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/import/world'));
    option.onClick(function () {

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
    option.onClick(this.htmlEvents.clickUploadAvatarPanel);
    options.add(option);

    //	Upload World

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/upload/world'));
    option.onClick(this.htmlEvents.clickUploadWorldPanel);
    options.add(option);

    options.add(new UIHorizontalRule());

    //	Download Avatar

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/download/avatar'));

    option.onClick(this.htmlEvents.clickDownloadAvatarPanel);
    options.add(option);

    //	Download World

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/download/world'));
    option.onClick(this.htmlEvents.clickDownloadWorldPanel);
    options.add(option);

    options.add(new UIHorizontalRule());

    // Export Avatar

    var option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/export/avatar'));
    option.onClick(exportAvatar);
    options.add(option);

    function getAvatarJson(scene, completeCallback) {
        let exporter = new GLTFExporter();
        let skinnedMeshRoot = undefined;
        scene.traverse(obj => {
            if(undefined !== skinnedMeshRoot) return;
            if(obj.type == "SkinnedMesh")
            {
                if(obj.parent === undefined)
                    skinnedMeshRoot = editor.scene;
                else
                    skinnedMeshRoot = obj.parent;
                return;
            }
        });

        exporter.parse(skinnedMeshRoot, function(result){
            completeCallback(JSON.stringify(result, null, 2));
        });
    }

    function exportAvatar() {

        let zip = new JSZip();

        getAvatarJson(editor.scene, function (avatarJson){

            zip.file('avatar.gltf', avatarJson);

            let title = config.getKey('project/title');
            save(zip.generate({type: 'blob'}), (title !== '' ? title : 'Avatar') + '.zip');

        });
    }

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
    function exportWorld() {

        let zip = new JSZip();

        getWorldJson(editor.scene, function (sceneJson){

            zip.file('world.gltf', sceneJson);

            let title = config.getKey('project/title');
            save(zip.generate({type: 'blob'}), (title !== '' ? title : 'World') + '.zip');

        });
    }

    options.add(option);

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
