import * as EVENTS from '../Events/Import.js'

const Others = (socket, uid, model, data)=>{
    //#region init
    const netw_obj = data;
    const server_update_rate = 12;
    //#region init event link
    //#region socket event handlers
    const ProcessServerInput = (msg)=>{
        if(msg.entity_id !== uid) return;
        netw_obj.position_buffer.push([
            +new Date(),
            msg.entity_properties.x,
            msg.entity_properties.y
        ]);
    }
    //#endregion
    //#region event link event handlers
    const Interpolate = ()=>{
        let cur_timestamp = +new Date();
        let render_timestamp = cur_timestamp - (1000.0/server_update_rate);
        let buffer = netw_obj.position_buffer;
        while(buffer.length >= 2 && buffer[1][0] <= render_timestamp){
            buffer.shift();
        }
        if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
            let x0 = buffer[0][1]; let x1 = buffer[1][1];
            let y0 = buffer[0][2]; let y1 = buffer[1][2];
            let t0 = buffer[0][0]; let t1 = buffer[1][0];
      
            netw_obj.x = x0 + (x1 - x0) * (render_timestamp - t0) / (t1 - t0);
            netw_obj.y = y0 + (y1 - y0) * (render_timestamp - t0) / (t1 - t0);
        }
    }
    const OnInit = ()=>{
        console.log('Others: init');
        socket.on('world_state', ProcessServerInput);
    }
    const OnUpdate = (delta)=>{
        Interpolate();
        model.position.x = netw_obj.x;
        model.position.y = netw_obj.y;
    }
    const OnDispose = ()=>{
        console.log('Others: dispose');
        socket.off('world_state', ProcessServerInput);
    }
    //#endregion
    const event_link = EVENTS.EventLink([
        { name:'init', handler:OnInit },
        { name:'update', handler:OnUpdate },
        { name:'dispose', handler:OnDispose }
    ])
    //#endregion
    //#endregion
    return {
        event_link: event_link,
    }
}

export default Others