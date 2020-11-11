import * as TMUI from 'three-mesh-ui'
import * as STY from './UIStyles.js'
import EventLink from '../../EventLink.js'
import ScrollContainer from './ScrollContainer.js'

const WorldPageMenu = (ui_objs)=>{
    let temp_style = {};
    Object.assign(temp_style, STY.large_panel);
    Object.assign(temp_style, STY.roboto_font);
    const container = new TMUI.Block(temp_style);
    container.add(new TMUI.Text({ content: 'WorldPageMenu' }));
    const scroll_cont = ScrollContainer(ui_objs);
    container.add(scroll_cont);
    container.position.set(0,0,-1);
    //#region input event handlers
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
        document.addEventListener('keydown', OnKeyDown);
        container.visible = false;
    }
    const OnExit = ()=>{
        document.removeEventListener('keydown', OnKeyDown);
    }
    const OnIdle = ()=>{
        //console.log('WorldPageMenu: idle');
    }
    const OnHover = ()=>{
        //console.log('WorldPageMenu: hover');
    }
    const OnInteract = ()=>{
        //console.log('WorldPageMenu: interact');
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit },
        { name:'idle', handler:OnIdle },
        { name:'hover', handler:OnHover },
        { name:'interact', handler:OnInteract }
    ]);
    event_link.AddLink(scroll_cont.event_link);
    Object.assign(container, { event_link: event_link });
    return container;
}

export default WorldPageMenu