import {Vector3, Quaternion, MathUtils, Euler} from "three";

const OthUserRotationCtrl = (page_sigs, socket, model, data, uid)=>{
    const netw_obj = data;
    const server_update_rate = 12;
    var net_quat = new Quaternion();

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
        /*const inputQuat = new Quaternion(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
        net_quat = new Quaternion(0,inputQuat.y, 0, inputQuat.w);
        //rot = inputQuat;
        net_euler = net_euler.setFromQuaternion(net_quat);
        net_euler.y += MathUtils.degToRad(180);*/
        //net_rot = net_euler.toVector3();

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
            //netw_obj.quaternion.x = quat0._x + (quat1._x - quat0._x) * (render_timestamp - t0) / (t1 - t0);
            netw_obj.quaternion.y = quat0.y + (quat1.y - quat0.y) * (render_timestamp - t0) / (t1 - t0);
            //netw_obj.quaternion.z = quat0._z + (quat1._z - quat0._z) * (render_timestamp - t0) / (t1 - t0);
            //netw_obj.quaternion.w = quat0._w + (quat1._w - quat0._w) * (render_timestamp - t0) / (t1 - t0);
            net_quat.copy(netw_obj);
        }
        model.quaternion.copy(net_quat);

    }
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { OthUserRotationCtrl }
