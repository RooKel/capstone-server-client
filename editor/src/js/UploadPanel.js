import {jsPanel} from './libs/jspanel/es6module/jspanel.js';

let uploadPanelCount = 0;

function UploadPanel(contents, panelOptions, callback)
{
    let panel_name = contents.panel_name;
    let preview = contents.preview;
    let content_name = contents.content_name;
    let creator_name = contents.creator_name;
    let submit_view = contents.submit_view;

    let panelContent =
        '<div class="grid-container">\n' +
        '  <div class="Panel-Name">'+panel_name+'</div>\n' +
        '  <div class="Preview-Area">'+preview+'</div>\n' +
        '  <div class="Content-Name">'+content_name+'</div>\n' +
        '  <div class="Creator-Name">'+creator_name+'</div>\n' +
        '  <div class="Submit-Area">'+submit_view+'</div>\n' +
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
    if(callback !== undefined)
        this.panel.addEventListener('click', callback);
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
