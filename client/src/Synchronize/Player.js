import * as EVENTS from '../Events/Import.js'
import * as CTRL from '../Controllers/Import.js'

const Player = (socket, uid, model, data)=>{
    //#region init
    const input = {
        entity_id: uid,
        input_sequence_number: 0
    };
    const netw_obj = data;
    const pending_inputs = [ ];
    //#region init event link
    //#region socket event handlers
    const ProcessServerInput = (msg)=>{
        if(msg.entity_id !== uid) return;
        netw_obj.x = msg.entity_properties.x;
        netw_obj.y = msg.entity_properties.y;
        //Reconciliation & Prediction
        let j = 0;
        while(j < pending_inputs.length){
            if(pending_inputs[j].input_sequence_number <= msg.last_processed_input)
                pending_inputs.splice(j,1);
            else {
                netw_obj.x += pending_inputs[j].move_dx * netw_obj.speed;
                netw_obj.y += pending_inputs[j].move_dy * netw_obj.speed;
                j++;
            }
        }
    }
    //#endregion
    //#region event link event handlers
    const OnInit = ()=>{
        console.log('Player: init');
        socket.on('world_state', ProcessServerInput);
    }
    const OnUpdate = (delta)=>{
        const out = Object.assign({}, input);
        socket.emit('input', out);
        pending_inputs.push(out);
        input.input_sequence_number++;

        model.position.x += input.move_dx * netw_obj.speed;
        model.position.y += input.move_dy * netw_obj.speed;

        //#region reset input
        input.move_dx = 0;
        input.move_dy = 0;
        //#endregion
    }
    const OnDispose = ()=>{
        console.log('Player: dispose');
        socket.off('world_state', ProcessServerInput);
    }
    //#endregion
    const event_link = EVENTS.EventLink([
        { name:'init', handler:OnInit },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ])
    event_link.AddLink(CTRL.WASD(input).event_link);
    //#endregion
    //#endregion
    return {
        event_link: event_link,
    }
}

export default Player