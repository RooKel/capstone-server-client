import { Vector3, Quaternion,Euler } from "three";
import {MathUtils} from "three";

const PlayerRotationCtrl = (page_sigs, socket, model, data, uid, camera)=>{
    const netw_obj = data;
    const server_update_rate = 12;

    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        let tmpQuat = new Quaternion();
        tmpQuat.x = msg.entity_properties.quaternion._x;
        tmpQuat.y = msg.entity_properties.quaternion._y;
        tmpQuat.z = msg.entity_properties.quaternion._z;
        tmpQuat.w = msg.entity_properties.quaternion._w;

        netw_obj.quaternion_buffer.push([
            +new Date(),
            tmpQuat
        ]);
    }
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
    }

    const OnUpdate = (delta)=>{
        let render_timestamp = +new Date() - (1000.0/server_update_rate);

        let buffer = netw_obj.quaternion_buffer;
        while(buffer.length >= 2 && buffer[1][0] <= render_timestamp)
        {
            buffer.shift();
        }
        if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
            let t0 = buffer[0][0]; let t1 = buffer[1][0];
            let quat0 = buffer[0][1]; let quat1 = buffer[1][1];
            netw_obj.quaternion.x = quat0.x + (quat1.x - quat0.x) * (render_timestamp - t0) / (t1 - t0);
            netw_obj.quaternion.y = quat0.y + (quat1.y - quat0.y) * (render_timestamp - t0) / (t1 - t0);
            netw_obj.quaternion.z = quat0.z + (quat1.z - quat0.z) * (render_timestamp - t0) / (t1 - t0);
            netw_obj.quaternion.w = quat0.w + (quat1.w - quat0.w) * (render_timestamp - t0) / (t1 - t0);
        }
        model.quaternion.copy(netw_obj.quaternion);
    }
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { PlayerRotationCtrl }
