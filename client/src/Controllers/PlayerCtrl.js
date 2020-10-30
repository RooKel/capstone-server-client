import EventLink from '../EventLink.js'

const PlayerCtrl = (socket, uid, model, data, out)=>{
    const netw_obj = data;
    const pressed = [ false, false, false, false ];
    const key_map = {
        0:[ 'KeyW', 'ArrowUp' ],
        1:[ 'KeyA', 'ArrowLeft' ],
        2:[ 'KeyS', 'ArrowRight' ],
        3:[ 'KeyD', 'ArrowDown' ]
    }
    const pending_inputs = [ ];
    let input_sequence_number = 0;
    //#region socket event handlers
    const OnWorldState = (msg)=>{
        if(msg.entity_id !== uid)
            return;
        netw_obj.x = msg.entity_properties.x;
        netw_obj.y = msg.entity_properties.y;
        let j = 0;
        while(j < pending_inputs.length){
            if(pending_inputs[j].input_sequence_number > msg.last_processed_input){
                netw_obj.x += pending_inputs[j].move_dx * netw_obj.speed;
                netw_obj.y += pending_inputs[j].move_dy * netw_obj.speed;
            }
            j++;
        }
    }
    //#endregion
    //#region input event handlers
    const TranslateKeyCode = (code)=>{
        for(let key in key_map){
            if(key_map[key].find((_)=>_===code))
                return key;
        }
        return -1;
    }
    const OnKeyDown = (e)=>{
        const index = TranslateKeyCode(e.code);
        if(index !== -1)
            pressed[index] = true;
    }
    const OnKeyUp = (e)=>{
        const index = TranslateKeyCode(e.code);
        if(index !== -1)
            pressed[index] = false;
    }
    //#endregion
    //#region event link event handlers
    const AnalyzeInput = (delta)=>{
        let horizontal = 0;
        let vertical = 0;

        if((pressed[1] && pressed[3]) || (!pressed[1] && !pressed[3]))
            horizontal = 0;
        else if(pressed[1])
            horizontal = -1;
        else
            horizontal = 1;

        if((pressed[0] && pressed[2]) || (!pressed[0] && !pressed[2]))
            vertical = 0;
        else if(pressed[0])
            vertical = 1;
        else
            vertical = -1;

        const input = { 
            move_dx: horizontal * delta, 
            move_dy: vertical * delta,
            input_sequence_number: input_sequence_number++
        };
        out.push({ name: 'input', args: input });
        pending_inputs.push(input);

        model.position.x += input.move_dx * netw_obj.speed;
        model.position.y += input.move_dy * netw_obj.speed;
    }
    const OnInit = ()=>{
        socket.on('world_state', OnWorldState);
        document.addEventListener('keydown', OnKeyDown);
        document.addEventListener('keyup', OnKeyUp);
    }
    const OnUpdate = (delta)=>{
        AnalyzeInput(delta);
    }
    const OnDispose = ()=>{
        socket.off('world_state', OnWorldState);
        document.removeEventListener('keydown', OnKeyDown);
        document.removeEventListener('keyup', OnKeyUp);
    }
    //#endregion
    const event_link = EventLink([
        { name:'init', handler:OnInit },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ]);
    return {
        event_link: event_link
    }
}

export default PlayerCtrl