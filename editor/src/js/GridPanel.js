import {jsPanel} from "./libs/jspanel/es6module/jspanel.js";
import {GridPanelElement} from "./GridPanelElement.js";
import("./libs/muuri.js");

let gridPanelCount = 0;

function GridPanel(raw_elements, panelOptions, callback)
{
    let panelContent =
        '<div class="grid'+gridPanelCount +'">\n'+
        '   <template div class="grid-item-template">\n' +
        '   <div class="grid-item">\n' +
        '       <div class="grid-item-content">\n' +
        '           <div class="grid-item-content-header">' +
        '               <div class="grid-item-content-title"></div>' +
        '               <div class="grid-item-content-creator"></div>' +
        '           </div>' +
        '           <div class="grid-item-content-body">' +
        '               <img class="grid-item-preview-img"/>' +
        '           </div>' +
        '       </div>\n' +
        '   </div>\n' +
        '   </templatediv>\n' +
        '</div>';
    panelOptions.content = panelContent;
    panelOptions.contentOverflow = 'hidden scroll';
    panelOptions.onwindowresize = false;
    panelOptions.animateIn = 'jsPanelFadeIn';
    panelOptions.animateOut = 'jsPanelFadeOut';
    panelOptions.panelSize = {
        width: () => { return Math.min(640, window.innerWidth*0.9);},
        height: () => { return Math.min(500, window.innerHeight*0.6);}
    };
    this.panel = jsPanel.create(panelOptions);
    this.htmlPanelElementMap = {};
    let gridElement = document.querySelector('.grid'+gridPanelCount);
    this.clickCallback = undefined;
    if(callback !== undefined)
    {
        this.clickCallback = callback;
        gridElement.addEventListener('click', callback);
    }
    this.itemTemplate = document.querySelector('.grid-item-template');
    this.grid = new Muuri(gridElement, {
        items: this.createItemElements(raw_elements),
        dragEnabled: false
    });
    gridPanelCount++;
    //addItems(raw_elements);
}
GridPanel.prototype = {
    createItemElements: function(raw_elements){
        const elements = [];
        for(let i = 0; i < raw_elements.length; i++)
        {
            let raw_element = raw_elements[i];
            let element = this.createItemElement(raw_element.title, raw_element.creator, raw_element.width, raw_element.height, raw_element.preview, raw_element.uid);
            elements.push(element);
        }
        return elements;
    },
    createItemElement: function(title, creator, width, height, preview, uid)
    {
        const itemElem = document.importNode(this.itemTemplate.content.children[0], true);

        itemElem.classList.add('h'+height, 'w' + width);
        itemElem.setAttribute('data-title', title);
        itemElem.setAttribute('data-uid', uid);
        itemElem.querySelector('.grid-item-content-title').innerHTML = title;
        itemElem.querySelector('.grid-item-content-creator').innerHTML = creator;

        if(preview !== undefined)
            itemElem.querySelector('.grid-item-preview-img').src = preview;
        itemElem.addEventListener('click', this.clickCallback);
        this.grid.add(itemElem);
        this.htmlPanelElementMap[itemElem.dataset.uid] = new GridPanelElement(title,creator,width,height,preview,uid);
        return itemElem;
    },
    close: function()
    {
        this.panel.close();
        this.grid.destroy(true);
        this.panel.contentRemove();
    }
};
export {GridPanel};
