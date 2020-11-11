import * as TMUI from 'three-mesh-ui'
import * as STY from './UIStyles.js'
import EventLink from '../../EventLink.js'
import StartButton from './StartButton.js'

const StartPagePanel = (ui_objs, socket)=>{
    let temp_style = {};
    Object.assign(temp_style, STY.small_panel);
    Object.assign(temp_style, STY.roboto_font);
    const container = new TMUI.Block(temp_style);
    const start_button = StartButton(ui_objs, socket);
    container.add(new TMUI.Text({ content: 'StartPagePanel' }));
    container.add(start_button);
    container.position.set(0,0,-1);
    //#region event link event handlers
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
        { name:'idle', handler:OnIdle },
        { name:'hover', handler:OnHover },
        { name:'interact', handler:OnInteract }
    ]);
    Object.assign(container, { event_link: event_link });
    return container;
}

export default StartPagePanel