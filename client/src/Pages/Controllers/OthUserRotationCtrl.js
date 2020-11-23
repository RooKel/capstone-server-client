import { Vector3, Quaternion, Euler } from "three";

const OthUserRotationCtrl = (page_sigs, socket, model, data, uid)=>{
    const netw_obj = data;

    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        const tempQuat = new Quaternion(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
        const tempQuatEuler = new Euler().setFromQuaternion(tempQuat);
        tempQuatEuler.x = 0;
        tempQuatEuler.z = 0;
        target_quat.copy(tempQuat);
    }
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
    }
    const OnUpdate = (delta)=>{
        if(!target_quat) return;
        model.quaternion.slerp(target_quat, 0.5);
    }
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { OthUserRotationCtrl }