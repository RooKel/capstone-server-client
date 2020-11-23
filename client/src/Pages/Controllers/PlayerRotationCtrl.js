import { Vector3, Quaternion } from "three";

const PlayerRotationCtrl = (page_sigs, socket, model, data, uid, camera)=>{
    const netw_obj = data;
    let target_quat = new Quaternion();

    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        const inputQuat = new Quaternion(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
        
        let tempQuat = new THREE.Quaternion();
        let mulQuat = new THREE.Quaternion();
        mulQuat.setFromAxisAngle(new THREE.Vector3(-1,0,0), msg.y_rot);
        tempQuat.setFromAxisAngle(new THREE.Vector3(0,1,0), msg.x_rot);
        tempQuat.multiply(mulQuat);

        target_quat = tempQuat;
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

export { PlayerRotationCtrl }