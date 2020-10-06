//#region imports

//#endregion

const InputManager = (page, socket, uid)=>{
    let input_sequence_number = 0;
    let pending_inputs = [];
    let wasd = [0,0,0,0];
    let vertical = 0;
    let horizontal = 0;

    //#region helper funcs
    const assessInput = ()=>{
        if(wasd[0] == wasd[2] )
            vertical = 0;
        else if(wasd[0] == 1)
            vertical = 1;
        else if(wasd[2] == 1)
            vertical = -1;

        if(wasd[1] == wasd[3] )
            horizontal = 0;
        else if(wasd[3] == 1)
            horizontal = 1;
        else if(wasd[1] == 1)
            horizontal = -1;
    }
    //#endregion
    //#region key event handlers
    const onKeyDown = (e)=>{
        if(e.code === 'KeyW')
            wasd[0] = 1;
        if(e.code === 'KeyA')
            wasd[1] = 1;
        if(e.code === 'KeyS')
            wasd[2] = 1;
        if(e.code === 'KeyD')
            wasd[3] = 1;
    }
    const onKeyUp = (e)=>{
        if(e.code === 'KeyW')
            wasd[0] = 0;
        if(e.code === 'KeyA')
            wasd[1] = 0;
        if(e.code === 'KeyS')
            wasd[2] = 0;
        if(e.code === 'KeyD')
            wasd[3] = 0;
    }
    //#endregion
    //#region page event handlers
    const onEnter = ()=>{
        //#region register key event handlers
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        //#endregion
    }
    const onExit = ()=>{
        //#region deregister key event handlers
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        //#endregion
    }
    const onUpdate = (delta)=>{
        assessInput();
        if(vertical == 0 && horizontal == 0)
            return;

        let input = { entity_id: uid };
        input.move_dx = delta * horizontal;
        input.move_dy = delta * vertical;
        input.input_sequence_number = input_sequence_number++;

        socket.emit('input', input);
        pending_inputs.push(input);
    }
    //#endregion
    //#region register page event handlers
    page.events.on('enter', onEnter);
    page.events.on('exit', onExit);
    page.events.on('update', onUpdate);
    //#endregion

    return {
        pending_inputs: ()=>pending_inputs,
        vertical: ()=>vertical,
        horizontal: ()=>horizontal,
    }
}
const InputManagerConst = (page, socket, uid)=>{
    return Object.assign(page, InputManager(page, socket, uid));
}

export { InputManagerConst }