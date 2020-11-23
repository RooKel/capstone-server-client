import { Vector3, Quaternion,Euler } from "three";
import {MathUtils} from "three";

const PlayerRotationCtrl = (page_sigs, socket, model, data, uid, camera)=>{
    const netw_obj = data;
    let target_quat = new Quaternion();

    let rot = new Quaternion(0,0,0,1);
    let euler = new Euler(0,0,0);
    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        const inputQuat = new Quaternion(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
        rot = new Quaternion(0,inputQuat.y, 0, inputQuat.w);
        euler = euler.setFromQuaternion(rot);
        euler.y += MathUtils.degToRad(180);
        //rot = inputQuat;
    }
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
    }
    let tempQuat = new Quaternion(0,0,0,1);
    const OnUpdate = (delta)=>{
        if(!rot) return;

        model.rotation.copy(euler);
        //model.quaternion.copy(rot);
        //model.quaternion.slerp(target_quat, 0.5);
    }
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { PlayerRotationCtrl }
