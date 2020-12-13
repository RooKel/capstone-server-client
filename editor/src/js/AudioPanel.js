import {jsPanel} from './libs/jspanel/es6module/jspanel.js';
import {LoaderUtils} from "./LoaderUtils.js";
import * as THREE from "../../build/three.module.js";
import {AudioData} from "./AudioData.js";
import ("./libs/muuri.js");

function AudioPanel(editor, panelOptions)
{
    var scope = this;
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
                editor.addAudioBuffer(filename, contents);

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
        items: this.createItemElements(editor.audioBufferSet),
        dragEnabled: true
    });
}
AudioPanel.prototype ={
    createItemElements: function(raw_elements){
        const elements = [];
        for(let i = 0; i < raw_elements.length; i++)
        {
            let raw_element = raw_elements[i];
            let element = this.createItemElement(raw_element);
            elements.push(element);
        }
        return elements;
    },
    createItemElement: function(filename, audioBuffer)
    {
        let scope = this;
        const itemElem = document.importNode(this.itemTemplate.content.children[0], true);
        let data = new AudioData(new Blob([audioBuffer],{type:'application/octet-stream'}),(_data)=>{
            fillElement(itemElem, _data);
        });


        function fillElement(_elem,_data){
            _elem.classList.add('h'+100, 'w' + 100);
            _elem.setAttribute('data-title', _data.fileName);
            _elem.setAttribute('data-uid', "test");
            _elem.querySelector('.grid-item-content-title').innerHTML = _data.fileName;
            _elem.querySelector('.grid-item-content-duration').innerHTML = "creator";

            if(_data.coverImage === undefined)
                _elem.querySelector('.grid-item-preview-img').src = document.getElementById('preview-music').src;
            else
                _elem.querySelector('.grid-item-preview-img').src = _data.coverImage;
            scope.grid.add(_elem);
        }
    },
    close: function()
    {
        this.panel.contentRemove();
        this.panel.close();
        this.grid.destroy(true);
    }
};
export {AudioPanel};
