import EventLink from '../EventLink.js'
import * as THREE from 'three'
import {Quaternion} from "three";

const TestCameraCtrl = (socket, client_data, data, camera, input_collector)=>{
    const netw_obj = data;
    const sum = { x:0, y:0 };
    let target = undefined;
    let offset = undefined;

    let prev_mouse_pos = undefined;
    let d_mouse_pos = { mouse_dx:0, mouse_dy:0 };
    let pending_inputs = [ ];
    let input_sequence_number = 0;

    //#region socket event handlers
    const ProcessServerMessage = (msg)=>{
        if(msg.entity_id !== client_data.uid) return;
        let prev_quat = new THREE.Quaternion(
            msg.entity_properties.quaternion._x,
            msg.entity_properties.quaternion._y,
            msg.entity_properties.quaternion._z,
            msg.entity_properties.quaternion._w
        );
        //console.log(tempQuat);
        pending_inputs = pending_inputs.filter((_)=>_.input_sequence_number > msg.last_processed_input);
        pending_inputs.forEach((_)=>{
            let x_rot = _.sum_dx;
            let y_rot = _.sum_dy;
            let tempQuat = new THREE.Quaternion();
            let mulQuat = new THREE.Quaternion();
            mulQuat.setFromAxisAngle(new THREE.Vector3(-1,0,0), y_rot);
            tempQuat.setFromAxisAngle(new THREE.Vector3(0,1,0), x_rot);
            tempQuat.multiply(mulQuat);
            prev_quat.slerp(tempQuat, 0.5);
            prev_quat.copy(tempQuat);
        });
        netw_obj.quaternion = prev_quat;
    }
    //#endregion
    //#region input event handlers
    const OnMouseMove = (e)=>{
        if(!prev_mouse_pos){
            prev_mouse_pos = { x:e.offsetX, y:e.offsetY };
        }
        else{
            d_mouse_pos.mouse_dx = e.offsetX - prev_mouse_pos.x;
            d_mouse_pos.mouse_dy = prev_mouse_pos.y - e.offsetY;
            prev_mouse_pos.x = e.offsetX;
            prev_mouse_pos.y = e.offsetY;
        }
    }
    //#endregion
    //#region event link event handlers
    const OnEnter = ()=>{
        socket.on('world_state', ProcessServerMessage);
        document.addEventListener('mousemove', OnMouseMove);
    }
    const OnUpdate = (delta)=>{
        //#region camera translation
        if(target){
            let target_pos = target.position.clone().add(offset);
            camera.position.lerp(target_pos, 0.5);
        }
        //#endregion
        //#region camera rotation
        //#region post to server
        const input = {
            mouse_dx: d_mouse_pos.mouse_dx * 0.03,
            mouse_dy: d_mouse_pos.mouse_dy * 0.03,
            input_sequence_number: input_sequence_number++
        };
        input_collector.AddMsg('input', input);
        sum.x -= input.mouse_dx;
        sum.y -= input.mouse_dy;
        input.sum_dx = sum.x;
        input.sum_dy = sum.y;
        pending_inputs.push(input);
        //#endregion
        let tempQuat = new THREE.Quaternion();
        let mulQuat = new THREE.Quaternion();
        mulQuat.setFromAxisAngle(new THREE.Vector3(-1,0,0), sum.y);
        tempQuat.setFromAxisAngle(new THREE.Vector3(0,1,0), sum.x);
        tempQuat.multiply(mulQuat);
        camera.quaternion.copy(camera.quaternion.slerp(tempQuat, 0.5));
        //camera.quaternion.copy(tempQuat);

        d_mouse_pos.mouse_dx = 0;
        d_mouse_pos.mouse_dy = 0;
        //#endregion
    }
    const OnExit = ()=>{
        socket.off('world_state', ProcessServerMessage);
        document.removeEventListener('mousemove', OnMouseMove);
    }
    //#endregion
    const event_link = EventLink([
        {name:'enter',handler:OnEnter},
        {name:'update',handler:OnUpdate},
        {name:'exit',handler:OnExit}
    ]);
    //#region public funcs
    const ChangeTarget = (_target, _offset)=>{
        if(!(_target instanceof THREE.Object3D)) return -1;
        if(!(_offset instanceof THREE.Vector3)) return -1;
        target = _target;
        offset = _offset;
    }
    //#endregion
    return {
        event_link: event_link,
        ChangeTarget: (target, offset)=>ChangeTarget(target, offset)
    }
}

export default TestCameraCtrl
