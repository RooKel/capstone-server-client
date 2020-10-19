
const StartPage = (page, socket, events, client_data)=>{
    //#region socket event handlers
    const LoginAccept = (_uid)=>{
        client_data.uid = _uid;
        events.emit('change_room', 2);
    }
    //#endregion
    //#region page event handlers
    const OnEnter = ()=>{
        //#region register socket events handlers
        socket.on('login_accept', LoginAccept);
        //#endregion

        //TEST
        document.addEventListener('keydown', (e)=>{
            if(e.code === 'KeyQ')
                socket.emit('login', true);
        })
    }
    const OnExit = ()=>{
        //#region deregister socket events handlers
        socket.off('login_accept', LoginAccept);
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
    //TODO: 'START' Button that calls socket.emit('login', true) when pressed
    
    //#endregion
    return page;
}

export default StartPage