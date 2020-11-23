import {Vector3, Quaternion, MathUtils, Euler} from "three";

const OthUserRotationCtrl = (page_sigs, socket, model, data, uid)=>{
    const netw_obj = data;
    let target_quat = new Quaternion();

    let net_quat = new Quaternion(0,0,0,1);
    let net_rot = new Vector3(0,0,0);
    let net_euler = new Euler(0,0,0);

    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== uid) return;
        const inputQuat = new Quaternion(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
        net_quat = new Quaternion(0,inputQuat.y, 0, inputQuat.w);
        //rot = inputQuat;
        net_euler = net_euler.setFromQuaternion(net_quat);
        net_euler.y += MathUtils.degToRad(180);
        //net_rot = net_euler.toVector3();

    }
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
    }

    const OnUpdate = (delta)=>{
        if(!net_quat) return;
        model.rotation.copy(net_euler);
        //model.quaternion.slerp(target_quat, 0.5);
    }
    page_sigs.update.add(OnUpdate);
    model.sigs.init.add(OnInit);
    model.sigs.dispose.add(OnDispose);
}

export { OthUserRotationCtrl }
