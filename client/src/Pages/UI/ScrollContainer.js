import * as TMUI from 'three-mesh-ui'
import * as STY from './UIStyles.js'
import EventLink from '../../EventLink.js'

const ScrollContainer = (ui_objs)=>{
    let hovered = false;

    let temp_style = {};
    Object.assign(temp_style, STY.large_panel);
    temp_style.width -= 0.25;
    temp_style.height -= 0.25;
    const container = new TMUI.Block(temp_style);
    temp_style.width -= 0.1;
    temp_style.height -= 0.1;
    const text_container = new TMUI.Block(temp_style);
    text_container.add(new TMUI.Text({content:'Hello World! '.repeat(100)}));
    const init_pos = text_container.position.y;
    container.add(text_container);
    ui_objs.push(container);
    //#region input event handlers
    const OnWheel = (e)=>{
        if(hovered) {
            text_container.position.y += e.deltaY * 0.005;
            if(text_container.position.y < init_pos)
                text_container.position.y = init_pos;
        }
    }
    const OnKeyDown = (e)=>{
        switch(e.code){
            case 'Escape':
                container.visible = !container.visible;
                break;
        }
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        window.addEventListener('wheel', OnWheel);
        document.addEventListener('keydown', OnKeyDown);
        container.visible = false;
    }
    const OnExit = ()=>{
        window.removeEventListener('wheel', OnWheel);
        document.removeEventListener('keydown', OnKeyDown);
    }
    const OnIdle = ()=>{
        //console.log('ScrollContainer: idle');
        hovered = false;
    }
    const OnHover = ()=>{
        //console.log('ScrollContainer: hover');
        hovered = true;
    }
    const OnInteract = ()=>{
        //console.log('ScrollContainer: interact');
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit },
        { name:'idle', handler:OnIdle },
        { name:'hover', handler:OnHover },
        { name:'interact', handler:OnInteract }
    ]);
    Object.assign(container, { event_link: event_link });
    return container;
}

ScrollContainer.prototype ={
    AddUIElement : function (element) {
        this.container
    }
}

export default ScrollContainer
