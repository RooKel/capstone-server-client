import {jsPanel} from "./libs/jspanel/es6module/jspanel.js";
import("./libs/muuri.js");

let gridPanelCount = 0;

function GridPanel(raw_elements, panelOptions, callback)
{
    let panelContent =
        '<div class="grid'+gridPanelCount +'">\n'+
        '   <template div class="grid-item-template">\n' +
        '   <div class="grid-item">\n' +
        '       <div class="grid-item-content">\n' +
        '           <div class="grid-item-title"></div>' +
        '       </div>\n' +
        '   </div>\n' +
        '   </templatediv>\n' +
        '</div>';
    panelOptions.content = panelContent;
    panelOptions.contentOverflow = 'scroll scroll';
    panelOptions.onwindowresize = true;
    panelOptions.animateIn = 'jsPanelFadeIn';
    panelOptions.animateOut = 'jsPanelFadeOut';
    panelOptions.panelSize = {
        width: () => { return Math.min(800, window.innerWidth*0.9);},
        height: () => { return Math.min(500, window.innerHeight*0.6);}
    };
    this.panel = jsPanel.create(panelOptions);
    this.gridElement = document.querySelector('.grid'+gridPanelCount);
    if(callback !== undefined)
        this.gridElement.addEventListener('click', callback);
    this.itemTemplate = document.querySelector('.grid-item-template');
    this.grid = new Muuri(this.gridElement, {
        items: this.createItemElements(raw_elements),
        dragEnabled: false
    });
    gridPanelCount++;
    //addItems(raw_elements);
}
GridPanel.prototype = {
    addItems: function(raw_elements){
        const items = this.grid.add(this.createItemElements(raw_elements),{
            layout:false,
            active:false
        });
    },
    createItemElements: function(raw_elements){
        const elements = [];
        for(let i = 0; i < raw_elements.length; i++)
        {
            let raw_element = raw_elements[i];
            let element = this.createItemElement(raw_element.title, raw_element.width, raw_element.height, raw_element.preview);
            elements.push(element);
        }
        return elements;
    },
    createItemElement: function(title, width, height, preview)
    {
        const itemElem = document.importNode(this.itemTemplate.content.children[0], true);

        itemElem.classList.add('h'+height, 'w' + width);
        itemElem.setAttribute('data-title', title);
        itemElem.src = preview;
        itemElem.querySelector('.grid-item-title').innerHTML = title;
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
