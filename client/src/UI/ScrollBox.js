import ThreeMeshUI from 'three-mesh-ui'
import EventLink from '../EventLink.js'

const ScrollBox = ()=>{
    let focused = false;
    //#region event link event handlers
    const OnEnter = ()=>{

    }
    const OnExit = ()=>{
        
    }
    //#endregion
    const event_link = EventLink([
        { name:'enter', handler:OnEnter },
        { name:'exit', handler:OnExit }
    ]);
    return {
        event_link: event_link
    }
}