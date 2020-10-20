
const MainPage = (page, socket, events, uid)=>{
    //#region socket event handlers
    
    //#endregion
    //#region page event handlers
    const OnEnter = ()=>{
        //#region register socket events handlers

        //#endregion
    }
    const OnExit = ()=>{
        //#region deregister socket events handlers
        
        //#endregion
    }
    const OnUpdate = (delta)=>{

    }
    //#endregion
    //#region register page event handlers
    page.events.on('enter', OnEnter);
    page.events.on('exit', OnExit);
    page.events.on('update', OnUpdate);
    //#endregion
    
    //#region init page scene
    
    //#endregion
    return page;
}

export default MainPage