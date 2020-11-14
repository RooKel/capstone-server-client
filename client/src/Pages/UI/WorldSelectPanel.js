import * as TMUI from 'three-mesh-ui'
import * as STY from './UIStyles.js'
import EventLink from '../../EventLink.js'
import StartButton from './StartButton.js'
import ScrollContainer from "./ScrollContainer";

const WorldSelectPanel = (ui_objs, socket)=>{
    let temp_style = {};
    Object.assign(temp_style, STY.large_panel);
    Object.assign(temp_style, STY.roboto_font);
    const container = new TMUI.Block(temp_style);
    const start_button = StartButton(ui_objs, socket);
    const scroll_cont = ScrollContainer(ui_objs);

    container.add(new TMUI.Text({ content: 'WorldSelectPanel' }));
    container.add(scroll_cont);
    container.add(start_button);
    container.position.set(0,0,-1);

    const OnKeyDown = (e)=>{
        switch(e.code){
            case 'Escape':
                container.visible = !container.visible;
                break;
        }
    }
    //#region event link event handlers
    const OnEnter = ()=>{
        document.addEventListener('keydown', OnKeyDown);
        container.visible = false;
    }
    const OnExit = ()=>{
        document.removeEventListener('keydown', OnKeyDown);
    }
    const OnIdle = ()=>{
        //console.log('StartPagePanel: idle');
    }
    const OnHover = ()=>{
        //console.log('StartPagePanel: hover');
    }
    const OnInteract = ()=>{
        //console.log('StartPagePanel: interact');
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

export default WorldSelectPanel
