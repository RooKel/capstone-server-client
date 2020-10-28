import {jsPanel} from './libs/jspanel/es6module/jspanel.js';

let uploadPanelCount = 0;

function UploadPanel(contents, panelOptions, uploadCallback)
{
    let panel_type = contents.panel_type;
    let preview = contents.preview;
    let btn_id = "btn-"+contents.panel_type + "-upload";
    let img_thumbnail_id = "img-" + panel_type + "-thumbnail";
    let input_thumbnail_id = "input-" + panel_type + "-thumbnail";

    let panelContent =
        '<div class="grid-container">\n' +
        '  <div class="Preview-Area">\n' +
        '       <img id="'+img_thumbnail_id+'" src="'+preview+'">\n' +
        '  </div>\n' +
        '  <div class="Preview-File">\n' +
        '       <input id="'+input_thumbnail_id+'" type="file"/>\n' +
        '  </div>\n' +
        '  <div class="Content-Name">\n' +
        '       <a>'+panel_type+' 이름 '+'</a>\n' +
        '       <input type="text" class="upload-panel-content-name">\n' +
        '  </div>\n' +
        '  <div class="Creator-Name">\n' +
        '       <a>제작자 </a>\n' +
        '       <input type="text" class="upload-panel-creator-name">\n' +
        '  </div>\n' +
        '  <div class="Submit-Area">\n' +
        '       <button id="'+btn_id + '" type="button"/>\n' +
        '  </div>\n' +
        '</div>';
    panelOptions.content = panelContent;
    panelOptions.onwindowresize = true;
    panelOptions.animateIn = 'jsPanelFadeIn';
    panelOptions.animateOut = 'jsPanelFadeOut';
    panelOptions.panelSize = {
        width: () => { return Math.min(800, window.innerWidth*0.9);},
        height: () => { return Math.min(500, window.innerHeight*0.6);}
    };
    this.panel = jsPanel.create(panelOptions);

    let img_thumbnail = document.getElementById(img_thumbnail_id);
    img_thumbnail.setAttribute("width", "100%");
    img_thumbnail.setAttribute("height", "100%");

    let file_input = document.getElementById(input_thumbnail_id);
    file_input.onchange = function (e) {
        console.log(e.target.files[0]);
        var fr = new FileReader();

        fr.onload = function(){
            img_thumbnail.setAttribute("src", fr.result);
        }
        fr.readAsDataURL(e.target.files[0]);
    }

    let submit_button = document.getElementById(btn_id);
    submit_button.setAttribute("value", "UPLOAD");
    submit_button.setAttribute("width", "75%");
    submit_button.setAttribute("height", "75%");
    submit_button.onclick = uploadCallback;

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
