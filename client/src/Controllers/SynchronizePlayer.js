import * as EVENTS from '../FastImports/Events.js'

const SynchronizePlayer = (socket, uid, data, object)=>{
    const netw_obj = data;
    const pending_inputs = [ ];
    let input_sequence_number = 0;
    const key_map = [false,false,false,false];
    const axis = { vertical:0, horizontal:0 };
    //#region input event handlers
    const OnKeyDown = (e)=>{
        if(e.code === 'KeyW')
            key_map[0] = true;
        if(e.code === 'KeyA')
            key_map[1] = true;
        if(e.code === 'KeyS')
            key_map[2] = true;
        if(e.code === 'KeyD') 
            key_map[3] = true;
    }
    const OnKeyUp = (e)=>{
        if(e.code === 'KeyW')
            key_map[0] = false;
        if(e.code === 'KeyA')
            key_map[1] = false;
        if(e.code === 'KeyS')
            key_map[2] = false;
        if(e.code === 'KeyD') 
            key_map[3] = false;
    }
    //#endregion
    //#region socket event handlers
    const ProcessServerMessage = (data)=>{
        if(data.entity_id !== uid)
            return;
        netw_obj.x = data.entity_properties.x;
        netw_obj.y = data.entity_properties.y;
        //Reconciliation & Prediction
        let j = 0;
        while(j < pending_inputs.length){
            if(pending_inputs[j].input_sequence_number <= data.last_processed_input)
                pending_inputs.splice(j,1);
            else {
                netw_obj.x += pending_inputs[j].move_dx * netw_obj.speed;
                netw_obj.y += pending_inputs[j].move_dy * netw_obj.speed;
                j++;
            }
        }
    }
    //#endregion
    //#region init event link
    const Interpolate = ()=>{
        object.position.x = netw_obj.x;
        object.position.y = netw_obj.y;
    }
    const ProcessInput = (delta)=>{
        //vertical
        if((key_map[0] && key_map[2]) || (!key_map[0] && !key_map[2]))
            axis.vertical = 0;
        else if(!key_map[0])
            axis.vertical = -1;
        else
            axis.vertical = 1;
        //horizontal
        if((key_map[1] && key_map[3]) || (!key_map[1] && !key_map[3]))
            axis.horizontal = 0;
        else if(!key_map[3])
            axis.horizontal = -1;
        else
            axis.horizontal = 1;
        //send input
        let input = { 
            entity_id: uid,
            move_dx: axis.horizontal * delta,
            move_dy: axis.vertical * delta,
            input_sequence_number: input_sequence_number++
        }
        socket.emit('input', input);
        netw_obj.x += input.move_dx * netw_obj.speed;
        netw_obj.y += input.move_dy * netw_obj.speed;
        pending_inputs.push(input);
    }
    const OnEnter = ()=>{
        socket.on('world_state', ProcessServerMessage);
        document.addEventListener('keydown', OnKeyDown);
        document.addEventListener('keyup', OnKeyUp);
    }
    const OnUpdate = (delta)=>{
        ProcessInput(delta);
        Interpolate();
    }
    const OnExit = ()=>{
        socket.off('world_state', ProcessServerMessage);
        document.removeEventListener('keydown', OnKeyDown);
        document.removeEventListener('keyup', OnKeyUp);
    }
    const event_link = EVENTS.EventLink([
        { name:'enter', handler:OnEnter },
        { name:'update', handler:OnUpdate },
        { name:'exit', handler:OnExit },
    ]);
    //#endregion

    return {
        event_link: event_link
    }
}

export default SynchronizePlayer