import * as THREE from 'three'
import { Vector3 } from 'three';

const CameraCtrl = (socket, client_data, data, camera, input_collector, sigs)=>{
    let mouse_sensitivity = 50;
    const netw_obj = data;
    const sum = { x:0, y:0 };
    let target = undefined;
    let offset = new Vector3(0,0,0);

    let prev_mouse_pos = undefined;
    let d_mouse_pos = { mouse_dx:0, mouse_dy:0 };
    let pending_inputs = [ ];
    let input_sequence_number = 0;

    const OnPointerLockChange = ()=>{
        if(document.pointerLockElement){
            OnInit();
        }
        else{
            OnDispose();
        }
    }
    document.addEventListener('pointerlockchange', OnPointerLockChange);
    sigs.exit.add(()=>{
        document.removeEventListener('pointerlockchange', OnPointerLockChange);
    });

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
            //prev_quat.slerp(tempQuat, deltaTime);
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
            d_mouse_pos.mouse_dx = e.movementX / screen.width;
            d_mouse_pos.mouse_dy = -e.movementY / screen.height;
            prev_mouse_pos.x += e.movementX;
            prev_mouse_pos.y -= e.movementY;
        }
    }
    //#endregion
    //#region event link event handlers
    const OnInit = ()=>{
        socket.on('instance-state', ProcessServerMessage);
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
            mouse_dx: d_mouse_pos.mouse_dx * mouse_sensitivity,
            mouse_dy: d_mouse_pos.mouse_dy * mouse_sensitivity,
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
        //camera.quaternion.copy(camera.quaternion.slerp(tempQuat, deltaTime));
        camera.quaternion.slerp(tempQuat, 0.5);

        d_mouse_pos.mouse_dx = 0;
        d_mouse_pos.mouse_dy = 0;
        //#endregion
    }
    const OnDispose = ()=>{
        socket.off('instance-state', ProcessServerMessage);
        document.removeEventListener('mousemove', OnMouseMove);
    }
    //#endregion
    camera.sigs.init.add(OnInit);
    camera.sigs.dispose.add(OnDispose);
    sigs.update.add(OnUpdate);
    //#region public funcs
    const ChangeTarget = (_target, _offset)=>{
        if(_target)
            target = _target;
        offset.set(_offset.x, _offset.y, _offset.z);
    }
    camera.sigs.change_target.add(ChangeTarget);
    //#endregion
}

export { CameraCtrl }
