import * as EVENTS from '../Events/Import.js'

const Mouse = (out)=>{
    //#region init
    const mouse = {
        mouse_dx: 0,
        mouse_dy: 0
    }
    //#region init event link
    //#region input event handlers
    const OnMouseMove = (e)=>{
        mouse.mouse_dx = e.offset.x;
        mouse.mouse_dy = e.offset.y;
    }
    //#endregion
    //#region event link event handlers
    const OnInit = ()=>{
        document.addEventListener('mousemove', OnMouseMove);
    }
    const OnUpdate = (delta)=>{
        out.mouse_dx = mouse.mouse_dx;
        out.mouse_dy = mouse.mouse_dy;
        mouse.mouse_dx = 0;
        mouse.mouse_dy = 0;
    }
    const OnDispose = ()=>{
        document.removeEventListener('mousemove', OnMouseMove);
    }
    //#endregion
    const event_link = EVENTS.EventLink([
        { name:'init', handler:OnInit },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ]);
    //#endregion
    //#endregion
    return {
        event_link: event_link
    }
}

export default Mouse