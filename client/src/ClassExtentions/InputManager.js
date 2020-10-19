
const InputManager = (page, socket, client_data)=>{
    let input_sequence_number = 0;
    let pending_inputs = [];
    let wasd = [0,0,0,0];
    let vertical = 0;
    let horizontal = 0;

    let prev_mouseX = 0;
    let prev_mouseY = 0;
    let mouse_dx = 0;
    let mouse_dy = 0;

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

    //#region event handlers
    const OnMouseMove = (e)=>{
        //if(!pointerLocked)
        //    return;
        
        mouse_dx = e.offsetX - prev_mouseX;
        mouse_dy = e.offsetY - prev_mouseY;

        //console.log(mouse_dx + "/" + mouse_dy);

        prev_mouseX = e.offsetX;
        prev_mouseY = e.offsetY;
    }
    const OnMouseDown = ()=>{
        //if(pointerLocked)
        //    return;

        //
        domElement.requestPointerLock = domElement.requestPointerLock ||
            domElement.mozRequestPointerLock ||
            domElement.webkitRequestPointerLock;
        domElement.requestPointerLock();
    }
    const OnPointerLockChange = ()=>{
        if(enabled)
            pointerLocked = !pointerLocked;
    }

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
        document.addEventListener('mousedown', OnMouseDown);
        document.addEventListener('mousemove', OnMouseMove, false);
        document.addEventListener('pointerlockchange', OnPointerLockChange, false);

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
        if(vertical == 0 && horizontal == 0 && mouse_dx == 0 && mouse_dy == 0)
            return;

        let input = { entity_id: client_data.uid };
        input.move_dx = delta * horizontal;
        input.move_dy = delta * vertical;

        //mouse move
        input.mouse_dx = delta * mouse_dx;
        input.mouse_dy = delta * mouse_dy;
        console.log("mouse delta: " + mouse_dx + " / " + mouse_dy);

        input.input_sequence_number = input_sequence_number++;

        socket.emit('input', input);
        pending_inputs.push(input);

        mouse_dx = 0;
        mouse_dy = 0;
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

export default InputManager