import { Matrix4, Vector3 } from "three";

const OthUserMovementCtrl = (socket, uid, data, model, page_sigs, anim_ctrl)=>{
    const netw_obj = data;
    const server_update_rate = 12;
    let prev_model_pos = new Vector3(data.x, 0, data.y);
    let current_anim = undefined;
    let prev_anim = undefined;
    //#region socket event handlers
    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        current_anim = msg.entity_properties.animation_state;
        netw_obj.position_buffer.push([
            +new Date(),
            msg.entity_properties.x,
            msg.entity_properties.y
        ]);
    }
    //#endregion
    //#region event link event handlers
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
    }
    let walking = false;
    const OnUpdate = (delta)=>{
        let render_timestamp = +new Date() - (1000.0/server_update_rate);

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

        model.position.x = netw_obj.x;
        model.position.z = netw_obj.y;
        if(anim_ctrl && current_anim) {
            if(current_anim !== prev_anim)
                anim_ctrl.PlayAnim(current_anim);
            prev_anim = current_anim;
        }
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
    }
    //#endregion
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { OthUserMovementCtrl }