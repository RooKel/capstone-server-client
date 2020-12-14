import {jsPanel} from './libs/jspanel/es6module/jspanel.js';
import {LoaderUtils} from "./LoaderUtils.js";
import * as THREE from "../../build/three.module.js";
import {AudioData} from "./AudioData.js";
import {AddScriptCommand} from "./commands/AddScriptCommand.js";
import ("./libs/muuri.js");

function AudioPanel(editor, panelOptions)
{
    var scope = this;
    this.editor = editor;
    this.clickCallback = undefined;

    function loadAudioFiles(files){
        let filesMap = LoaderUtils.createFilesMap( files );

        let manager = new THREE.LoadingManager();
        manager.setURLModifier( function ( url ) {

            let file = filesMap[ url ];

            if ( file ) {

                console.log( 'Loading', url );

                return URL.createObjectURL( file );

            }
            return url;
        } );

        for (let i = 0; i < files.length; i++)
        {
            var file = files[i];
            var filename = file.name;
            var extension = filename.split( '.' ).pop().toLowerCase();

            var reader = new FileReader();
            reader.addEventListener( 'progress', function ( event ) {

                var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
                var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';

                console.log( 'Loading', filename, size, progress );

            } );
            reader.addEventListener('load', function(event){
                var contents = event.target.result;
                scope.createItemElement(filename, contents);

            });
            reader.readAsArrayBuffer(file);
        }
    }

    var form = document.createElement('form');
    form.style.display = 'none';
    document.body.appendChild(form);

    var fileInput = document.createElement('input');
    fileInput.multiple = true;
    fileInput.type = 'file';
    fileInput.addEventListener('change', function(){
        let files = fileInput.files;
        loadAudioFiles(files);
        form.reset();
    });
    form.appendChild(fileInput);
    let panelContent =
        '<div class = "audio-panel-container">\n' +
        '   <div class="audio-panel-header">\n' +
        '       <button class="audio-load-bttn">IMPORT</button>\n'+
        '   </div>'+
        '   <div class="audio-source-grid">\n' +
        '       <template div class="audio-source-grid-template">\n' +
        '       <div class="grid-item">' +
            '       <div class ="grid-item-content">\n' +
            '           <div class="grid-item-content-header">' +
            '               <div class="grid-item-content-title"></div>' +
            '               <div class="grid-item-content-duration"></div>' +
            '           </div>' +
            '           <div class="grid-item-content-body">' +
            '               <img class="grid-item-preview-img"/>' +
            '               <button class="grid-item-button-play">PLAY</button>' +
            '               <button class="grid-item-button-stop">STOP</button>' +
            '               <button class="grid-item-button-remove">REMOVE</button>' +
        '           </div>' +
            '       </div>'+
        '       </div>'+
        '       </template div>'+
        '   </div>'+
        '</div>';
    panelOptions.content = panelContent;
    panelOptions.onwindowresize = false;
    panelOptions.animateIn = 'jsPanelFadeIn';
    panelOptions.animateOut = 'jsPanelFadeOut';
    panelOptions.panelSize = {
        width: () => { return Math.min(570, window.innerWidth*0.9);},
        height: () => { return Math.min(370, window.innerHeight*0.6);}
    };
    this.panel = jsPanel.create(panelOptions);
    let gridElement = document.querySelector('.audio-source-grid');
    gridElement.style.position = 'relative';
    let loadButton = document.querySelector('.audio-load-bttn');
    loadButton.addEventListener('click', (e)=>{
        fileInput.click();
    })
    this.itemTemplate = document.querySelector('.audio-source-grid-template');
    this.grid = new Muuri(gridElement, {
        items: [],
        dragEnabled: true
    });
    this.loadItemElements(editor.audioDataSet);

    editor.signals.audioAllocate.add(function(_elem, _audioData){
        console.log(_audioData.fileName);
        var selected = editor.selected;
        if(selected !== undefined)
        {
            var audioScript = {
                name:'AudioPlayer', source:
                    'let prefabMeta = {\n' +
                    '    is_global:false,\n' +
                    '	src_user_data_id:\''+editor.selected.userData.id+'\',\n'+
                    '    src_prefab:\'\',\n' +
                    '	src_prefab_id:\''+THREE.MathUtils.generateUUID()+'\',\n'+
                    '    src_prefab_properties:{\n' +
                    '       trigger_meta_info:{\n' +
                    '          dest_user_data_id: [\''+editor.selected.userData.id+'\'],\n' +
                    '          dest_prefab: \'audio_player\',\n' +
                    '          dest_prefab_properties: {\n' +
                    '               audioID: \''+_audioData.audioID +'\',\n'+
                    '               volume: 0.5,\n'+
                    '               loop: false\n'+
                    '          }\n' +
                    '       }\n' +
                    '    }\n' +
                    '}'
            };
            editor.execute( new AddScriptCommand( editor, editor.selected, audioScript ) );
        }
    });
}
AudioPanel.prototype ={
    loadItemElements: function(_audioDataSet){
      const elements = [];
        _audioDataSet.forEach((value,key,map)=>{
           let element = this.loadItemElement(value);
            elements.push(element);
        });
        return elements;
    },
    createItemElements: function(raw_elements){
        const elements = [];
        raw_elements.forEach((value,key,map)=>{
            let element = this.createItemElement(value);
            elements.push(element);
        });
        return elements;
    },
    loadItemElement: function(_audioData){
        let scope = this;
        const itemElem = document.importNode(this.itemTemplate.content.children[0], true);
        itemElem.classList.add('h'+100, 'w' + 100);
        itemElem.setAttribute('data-title', _audioData.fileName);
        itemElem.setAttribute('data-uid', "test");
        itemElem.querySelector('.grid-item-content-title').innerHTML = _audioData.fileName;
        itemElem.querySelector('.grid-item-content-duration').innerHTML = _audioData.artist;
        itemElem.addEventListener('dblclick',(e)=>{
            this.editor.signals.audioAllocate.dispatch(itemElem, _audioData);
        });

        if(_audioData.coverImage === undefined)
            itemElem.querySelector('.grid-item-preview-img').src = document.getElementById('preview-music').src;
        else
            itemElem.querySelector('.grid-item-preview-img').src = _audioData.coverImage;

        itemElem.querySelector('.grid-item-button-play').addEventListener('click',(e)=>{
            scope.editor.playWorldAudio(_audioData);
        });
        itemElem.querySelector('.grid-item-button-stop').addEventListener('click',(e)=>{
            scope.editor.stopWorldAudio();
        });
        itemElem.querySelector('.grid-item-button-remove').addEventListener('click',(e)=>{
            let item = scope.grid.getItem(itemElem);
            scope.grid.remove([item],{removeElements:true});
            if(scope.editor.getWorldAudio().isPlaying){

            }
            scope.editor.removeAudioBuffer(_data.audioID);
            scope.editor.removeAudioData(_data.audioID);
            scope.editor.signals.audioRemove.dispatch(_data);
        });
        scope.grid.add(itemElem);
        return itemElem;
    },
    createItemElement: function(filename, audioBuffer)
    {
        let scope = this;
        const itemElem = document.importNode(this.itemTemplate.content.children[0], true);
        let data = new AudioData(undefined, filename, new Blob([audioBuffer],{type:'application/octet-stream'}),(_data)=>{
            fillElement(itemElem, _data);
            this.editor.addAudioBuffer(_data.audioID, _data.dataBuffer);
            this.editor.addAudioData(_data.audioID, _data);
            itemElem.addEventListener('dblclick',(e)=>{
                this.editor.signals.audioAllocate.dispatch(itemElem, _data);
            });
        });

        function fillElement(_elem,_data){
            _elem.classList.add('h'+100, 'w' + 100);
            _elem.setAttribute('data-title', _data.fileName);
            _elem.setAttribute('data-uid', "test");
            _elem.querySelector('.grid-item-content-title').innerHTML = _data.fileName;
            _elem.querySelector('.grid-item-content-duration').innerHTML = _data.artist;

            if(_data.coverImage === undefined)
                _elem.querySelector('.grid-item-preview-img').src = document.getElementById('preview-music').src;
            else
                _elem.querySelector('.grid-item-preview-img').src = _data.coverImage;

            _elem.querySelector('.grid-item-button-play').addEventListener('click',(e)=>{
                scope.editor.playWorldAudio(_data);
            });
            _elem.querySelector('.grid-item-button-stop').addEventListener('click',(e)=>{
                scope.editor.stopWorldAudio();
            });
            _elem.querySelector('.grid-item-button-remove').addEventListener('click',(e)=>{
                let item = scope.grid.getItem(itemElem);
                scope.grid.remove([item],{removeElements:true});
                scope.editor.removeAudioBuffer(_data.audioID);
                scope.editor.removeAudioData(_data.audioID);
                scope.editor.signals.audioRemove.dispatch(_data);
            });

            scope.grid.add(_elem);
            scope.editor.signals.audioLoad.dispatch(_data);
        }
        return itemElem;
    },
    close: function()
    {
        this.panel.contentRemove();
        this.panel.close();
        this.grid.destroy(true);
    }
};
export {AudioPanel};
