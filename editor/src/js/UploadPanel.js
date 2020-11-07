import {jsPanel} from './libs/jspanel/es6module/jspanel.js';

let uploadPanelCount = 0;

function UploadPanel(contents, panelOptions, uploadCallback)
{
    let panel_type = contents.panel_type;
    let preview = contents.preview;
    let btn_id = "btn-"+contents.panel_type + "-upload";
    let img_thumbnail_id = "img-" + panel_type + "-thumbnail";
    let input_thumbnail_id = "input-" + panel_type + "-thumbnail";
    let input_name_id = "input-" + panel_type + "-content-name";
    let input_creator_id = "input-" + panel_type + "-creator-name";
    var data_stream = {
        data_type: undefined,
        data_name: undefined,
        data_thumbnail: undefined,
        data_creator:undefined,
        raw_gltf:undefined
    };

    let panelContent =
        '<div class="grid-container">\n' +
        '  <div class="Preview-Area">\n' +
        '       <img id="'+img_thumbnail_id+'" src="">\n' +
        '  </div>\n' +
        '  <div class="Preview-File">\n' +
        '       <input id="'+input_thumbnail_id+'" type="file" accept=".png"/>\n' +
        '  </div>\n' +
        '  <div class="Content-Outline">\n' +
        '       <div class="Content-Name">\n' +
        '           <div class="name-rect">' +
        '               <a>NAME</a>\n' +
        '           </div>' +
        '           <div class="content-rect">' +
        '               <input type="text" id="'+input_name_id + '">\n' +
        '           </div>' +
        '       </div>\n' +
        '       <div class="Creator-Name">\n' +
        '           <div class="name-rect">' +
        '               <a>CREATOR </a>\n' +
        '           </div>' +
        '           <div class="content-rect">' +
        '               <input type="text" id="'+input_creator_id + '">\n' +
        '           </div>' +
        '       </div>\n' +
        '  </div>\n' +
        '  <div class="Submit-Area">\n' +
        '       <div class="name-rect"></div>' +
        '       <div class="content-rect">' +
        '       <div class="button-wrapper">' +
        '           <button id="'+btn_id + '" type="button"/>\n' +
        '       </div>' +
        '       </div>' +
        '  </div>\n' +
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

    let input_content_name = document.getElementById(input_name_id);
    let input_creator_name = document.getElementById(input_creator_id);
    let img_thumbnail = document.getElementById(img_thumbnail_id);
    let input_file_thumbnail = document.getElementById(input_thumbnail_id);

    input_content_name.addEventListener('keydown', function(event){
        event.stopPropagation();
    });
    input_creator_name.addEventListener('keydown', function(event){
        event.stopPropagation();
    });
    img_thumbnail.setAttribute("width", "100%");
    img_thumbnail.setAttribute("height", "100%");

    input_file_thumbnail.onchange = function (e) {
        var fr = new FileReader();

        fr.onload = function(){
            img_thumbnail.setAttribute("src", fr.result);
            data_stream.data_thumbnail = fr.result;
        }

        fr.readAsDataURL(e.target.files[0]);
    }

    let submit_button = document.getElementById(btn_id);
    submit_button.innerHTML = "UPLOAD";
    submit_button.onclick = function (){
        data_stream.data_name = input_content_name.value;
        data_stream.data_creator = input_creator_name.value;
        data_stream.data_type = panel_type;

        uploadCallback(data_stream);
    };

    uploadPanelCount++;
}
UploadPanel.prototype ={
    close: function()
    {
        this.panel.close();
        this.panel.contentRemove();
    }
};
export {UploadPanel};
