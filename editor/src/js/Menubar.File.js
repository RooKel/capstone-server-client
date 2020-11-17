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
import {AnimationClip} from '../../build/three.module.js';

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
    function onFileUploadAck(res)
    {
        console.log(res.uid + " : " + res.data_name);
        editor.signals.loadStateChanged.dispatch("close");
    }
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
            editor.signals.loadStateChanged.dispatch("close");
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

                    let scene = result.scene;
                    scene.name = result.scene.name;

                    while(scene.children.length > 0)
                    {
                        editor.execute( new AddObjectCommand( editor, scene.children[0] ) );
                    }
                    editor.scene.traverse(x => {
                        if(x.userData === undefined)        return;
                        if(x.userData.animSet === undefined)return;
                        if(x.userData.animSet.length === 0) return;

                        let getAnimSet = [];
                        for (let a = 0; a < x.userData.animSet.length; a++)
                        {
                            let animByName = result.animations.find(
                                anim => anim.name === x.userData.animSet[a].animation
                            );
                            getAnimSet.push(animByName);
                        }
                        editor.addAnimation( x, getAnimSet );

                    });
                    //editor.execute( new AddObjectCommand( editor, scene ) );
                    editor.signals.loadStateChanged.dispatch("close");
                } );
            }
        }
    }

    networkObject.addFileUploadAckListener(onFileUploadAck);
    networkObject.addFileDownloadListener(onFileDownloaded);

    networkObject.listenFileUploadAck();
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
                editor.signals.loadStateChanged.dispatch("open");
                getAvatarJson(editor.scene, function(avatarJson){
                    dataStream.raw_gltf = avatarJson;
                    networkObject.requestFileUpload(dataStream);
                    editor.floatingPanels.upload_avatar.close();
                }, function(err){
                    editor.floatingPanels.upload_avatar.close();
                    editor.signals.loadStateChanged.dispatch("close");
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
                editor.signals.loadStateChanged.dispatch("open");
                getWorldJson(editor.scene, function(sceneJson){
                    dataStream.raw_gltf = sceneJson;
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

    function getAvatarJson(scene, completeCallback, errorCallback) {
        let skinnedMeshRoot = undefined;

        editor.skeletons.forEach((value, key, mapObj) => {
            if(undefined !== value)
            {
                if(value.parent === undefined)
                {
                    skinnedMeshRoot = editor.scene;
                }
                else
                {
                    skinnedMeshRoot = value.parent;
                    while(skinnedMeshRoot.parent !== editor.scene)
                    {
                        skinnedMeshRoot = skinnedMeshRoot.parent;
                    }
                }
            }
        });

        if(undefined === skinnedMeshRoot)
        {
            errorCallback("No Skeleton");
            return;
        }

        var animations = [];
        editor.animations.forEach((value, key, mapObj) => {
            animations.push(... value);
        });

        let exporter = new GLTFExporter();

        exporter.parse(scene, function(result){
            let gScene = result.scenes[0];

            if(gScene.nodes === undefined) return;
            let eScene = editor.scene;

            let gQ = [];
            let eQ = [];

            //  씬 하이어라키의 최상위 객체들의 인덱스를 q에 넣는다.
            for (let c = 0; c < gScene.nodes.length; c++) {
                gQ.push(result.nodes[gScene.nodes[c]]);
                eQ.push(eScene.children[c]);
            }
            //  gltf와 scene을 동시에 traverse하며 script 비교 생성
            while(gQ.length > 0)
            {
                let topNode = gQ.shift();
                let topObject = eQ.shift();

                let script = editor.scripts[topObject.uuid];
                let anims = editor.animations.get(topObject.uuid);
                let animSet = [];
                if (anims !== undefined)
                {
                    for (let a = 0; a < anims.length; a++)
                    {
                        animSet.push(anims[a].name);
                    }
                }
                topNode.extras = {
                    name  : topObject.name,
                    script: script,
                    animSet: animSet
                }

                if(topNode.children !== undefined)
                {
                    //  TODO Handle 자식있을 때
                    for (let c = 0; c < topNode.children.length; c++)
                    {
                        let cNodeIdx = topNode.children[c];
                        gQ.push(result.nodes[cNodeIdx]);
                        eQ.push(topObject.children[c]);
                    }
                }
            }

            completeCallback(JSON.stringify(result, null, 2));
        }, { animations: animations });
    }

    function exportAvatar() {

        let zip = new JSZip();

        getAvatarJson(editor.scene, function (avatarJson){

            zip.file('avatar.gltf', avatarJson);

            let title = config.getKey('project/title');
            save(zip.generate({type: 'blob'}), (title !== '' ? title : 'Avatar') + '.zip');

        }, function(err){
            console.log(err);
        });
    }

    //	Export World
    var option = new UIRow();
    option.setClass(`option`);
    option.setTextContent(strings.getKey('menubar/file/export/world'));
    option.onClick(exportWorld);

	function getWorldJson(scene, completeCallback) {
		let exporter = new GLTFExporter();

        var animations = [];
        editor.animations.forEach((value, key, mapObj) => {
            animations.push(... value);
        });

		exporter.parse(scene, function (result) {
		    let gScene = result.scenes[0];

            if(gScene.nodes === undefined) return;
            let eScene = editor.scene;

            let gQ = [];
            let eQ = [];

            //  씬 하이어라키의 최상위 객체들의 인덱스를 q에 넣는다.
            for (let c = 0; c < gScene.nodes.length; c++) {
                gQ.push(result.nodes[gScene.nodes[c]]);
                eQ.push(eScene.children[c]);
            }
            //  gltf와 scene을 동시에 traverse하며 script 비교 생성
            while(gQ.length > 0) {
                let topNode = gQ.shift();
                let topObject = eQ.shift();

                let script = editor.scripts[topObject.uuid];
                let anims = editor.animations.get(topObject.uuid);
                let animSet = [];
                if (anims !== undefined)
                {
                    for (let a = 0; a < anims.length; a++)
                    {
                        animSet.push({
                            state:'idle',
                            animation:anims[a].name
                        });
                    }
                }
                topNode.extras = {
                    name  : topObject.name,
                    script: script,
                    animSet: animSet
                }

                if(topNode.children !== undefined)
                {
                    //  TODO Handle 자식있을 때
                    for (let c = 0; c < topNode.children.length; c++)
                    {
                        let cNodeIdx = topNode.children[c];
                        gQ.push(result.nodes[cNodeIdx]);
                        eQ.push(topObject.children[c]);
                    }
                }
            }

            completeCallback(JSON.stringify(result, null, 2));
		}, { animations: animations });
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
