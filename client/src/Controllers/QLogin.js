import EventLink from '../EventLink.js'

const QLogin = (out)=>{
    //#region input event handler
    const OnKeyDown = (e)=>{
        if(e.code === 'KeyQ'){
            out.push({name:'login',args:Object.assign({}, true)});
        }
    }
    //#endregion
    //#region event link event handlers
    const OnInit = ()=>{
        document.addEventListener('keydown', OnKeyDown);
    }
    const OnDispose = ()=>{
        document.removeEventListener('keydown', OnKeyDown);
    }
    //#endregion
    const event_link = EventLink([
        { name:'init', handler:OnInit },
        { name:'dispose', handler:OnDispose }
    ]);
    return {
        event_link: event_link
    }
}

export default QLogin