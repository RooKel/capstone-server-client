import * as TMUI from 'three-mesh-ui'
import * as STY from './UIStyles.js'
import * as STA from './UIStates.js'
import EventLink from '../../EventLink.js'

const StartButton = (ui_objs, socket)=>{
    const start_button = new TMUI.Block(STY.button_type1);
    start_button.setupState(STA.hoveredStateAttributes);
    start_button.setupState(STA.idleStateAttributes);
    let temp = STA.selectedAttributes;
    Object.assign(temp, { onSet:()=>{
        socket.emit('login', true);
    }});
    start_button.setupState(temp);
    start_button.add(new TMUI.Text({ content:'Start' }));
    ui_objs.push(start_button);
    //#region event link event handlers
    const OnIdle = ()=>{
        //console.log('StartButton: idle');
        start_button.setState('idle');
    } 
    const OnHover = ()=>{
        //console.log('StartButton: hover');
        start_button.setState('hovered');
    }
    const OnInteract = ()=>{
        //console.log('StartButton: interact');
        start_button.setState('selected');
    }
    //#endregion
    const event_link = EventLink([
        { name:'idle', handler:OnIdle },
        { name:'hover', handler:OnHover },
        { name:'interact', handler:OnInteract }
    ]);
    Object.assign(start_button, { event_link: event_link });
    return start_button;
}

export default StartButton