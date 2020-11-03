import EventLink from '../EventLink.js'

const QLogin = (input_collector)=>{
    //#region input event handlers
    const OnKeyDown = (e)=>{
        if(e.code !== 'KeyQ') return;
        input_collector.AddMsg('login', true);
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        document.addEventListener('keydown', OnKeyDown);
    }
    const OnExit = ()=>{
        document.removeEventListener('keydown', OnKeyDown);
    }
    //#endregion
    const event_link = EventLink([
        {name:'enter',handler:OnEnter},
        {name:'exit',handler:OnExit}
    ]);
    return {
        event_link: event_link
    }
}

export default QLogin